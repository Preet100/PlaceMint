"""
model_utils.py
--------------
Loads the trained pipeline and its supporting JSON artifacts (produced by
notebooks/Placement_Model_Training.ipynb) and exposes a single clean
`predict_placement()` function used by both the Resume Analyzer and Direct
Prediction pages.

Everything here is read-only with respect to the model: this module never
re-implements encoding/scaling/feature-engineering -- that all lives inside
the pickled pipeline itself (see utils/feature_engineering.py) so the app
can never drift out of sync with how the model was trained.
"""

from __future__ import annotations

import functools
import json
from typing import Any

import joblib
import pandas as pd

from config.settings import FEATURE_CONFIG_PATH, MODEL_METRICS_PATH, MODEL_PATH

# `PlacementFeatureEngineer` is never called directly in this module, but it
# MUST be imported somewhere before `joblib.load` runs, so that Python can
# resolve the class the pickle refers to.
from utils.feature_engineering import PlacementFeatureEngineer  # noqa: F401


@functools.lru_cache(maxsize=1)
def load_pipeline():
    """Load the trained scikit-learn pipeline (cached for the app's lifetime)."""
    if not MODEL_PATH.exists():
        return None
    return joblib.load(MODEL_PATH)


@functools.lru_cache(maxsize=1)
def load_feature_config() -> dict[str, Any]:
    """Load feature lists, dropdown options, ranges, defaults, and cohort stats."""
    if not FEATURE_CONFIG_PATH.exists():
        return {}
    with open(FEATURE_CONFIG_PATH) as f:
        return json.load(f)


@functools.lru_cache(maxsize=1)
def load_model_metrics() -> dict[str, Any]:
    """Load the saved comparison table / confusion matrix / ROC curve / etc."""
    if not MODEL_METRICS_PATH.exists():
        return {}
    with open(MODEL_METRICS_PATH) as f:
        return json.load(f)


def artifacts_ready() -> bool:
    """True once the notebook has been run and all three artifacts exist."""
    return MODEL_PATH.exists() and FEATURE_CONFIG_PATH.exists() and MODEL_METRICS_PATH.exists()


def fill_defaults(user_values: dict[str, Any]) -> dict[str, Any]:
    """Merge user-supplied feature values with dataset defaults for anything
    the user didn't provide, so a prediction can always be made even from a
    partially-filled form or a partially-parsed resume."""
    config = load_feature_config()
    full = {}

    for col in config.get("numeric_features", []):
        if col in user_values and user_values[col] is not None:
            full[col] = float(user_values[col])
        else:
            full[col] = float(config["numeric_defaults"].get(col, 0.0))

    for col in config.get("categorical_features", []):
        if col in user_values and user_values[col] is not None:
            full[col] = str(user_values[col])
        else:
            full[col] = str(config["categorical_defaults"].get(col, ""))

    return full


def predict_placement(feature_values: dict[str, Any]) -> dict[str, Any]:
    """
    Run a placement prediction for one student.

    Parameters
    ----------
    feature_values : dict
        Raw feature values (numeric_features + categorical_features from
        feature_config.json). Any missing keys are back-filled with dataset
        defaults via `fill_defaults`.

    Returns
    -------
    dict with keys:
        prediction        : "Placed" | "Not Placed"
        placed_probability : float in [0, 1]
        not_placed_probability : float in [0, 1]
        confidence         : float in [0, 1]  (probability of the predicted class)
    """
    pipeline = load_pipeline()
    if pipeline is None:
        raise FileNotFoundError(
            "No trained model found at models/placement_model.pkl. "
            "Run notebooks/Placement_Model_Training.ipynb first."
        )

    full_values = fill_defaults(feature_values)
    row = pd.DataFrame([full_values])

    proba = pipeline.predict_proba(row)[0]
    not_placed_p, placed_p = float(proba[0]), float(proba[1])

    # Extract user inputs (distinguish explicit 0 from filled defaults)
    cgpa = float(feature_values.get("cgpa", full_values.get("cgpa", 0)))
    t10 = float(feature_values.get("tenth_percentage", full_values.get("tenth_percentage", 0)))
    t12 = float(feature_values.get("twelfth_percentage", full_values.get("twelfth_percentage", 0)))
    proj = float(feature_values.get("projects_completed", full_values.get("projects_completed", 0)))
    intern = float(feature_values.get("internships_completed", full_values.get("internships_completed", 0)))
    coding = float(feature_values.get("coding_skill_rating", full_values.get("coding_skill_rating", 0)))

    # Zero-Input & Out-of-Bounds Capping Guardrails:
    # 1. Zero CGPA or zero overall academic profile -> 0% Placement Probability
    if cgpa == 0.0 or (t10 == 0.0 and t12 == 0.0 and cgpa < 5.0):
        placed_p = 0.0
    elif cgpa < 5.0:
        # Severe penalty for failing / below minimum CGPA threshold (< 5.0)
        cgpa_factor = (cgpa / 5.0) ** 1.5
        placed_p = placed_p * cgpa_factor

    # 2. Hard zero core practical rule (0 projects, 0 internships, <= 1 coding rating AND CGPA < 6.0)
    if proj == 0 and intern == 0 and coding <= 1 and cgpa < 6.0:
        placed_p = min(placed_p, 0.15 * (cgpa / 6.0 if cgpa > 0 else 0.0))

    placed_p = max(0.0, min(1.0, round(placed_p, 4)))
    not_placed_p = round(1.0 - placed_p, 4)
    prediction = "Placed" if placed_p >= 0.5 else "Not Placed"

    return {
        "prediction": prediction,
        "placed_probability": placed_p,
        "not_placed_probability": not_placed_p,
        "confidence": max(placed_p, not_placed_p),
        "input_features": full_values,
    }
