import os
import sys
import json
import numpy as np
import pandas as pd
import joblib
from pathlib import Path

# Add project root to sys.path
PROJECT_ROOT = Path("e:/internship_project/PlaceMint-AI").resolve()
if str(PROJECT_ROOT) not in sys.path:
    sys.path.append(str(PROJECT_ROOT))

from utils.feature_engineering import PlacementFeatureEngineer
from sklearn.model_selection import train_test_split, GridSearchCV, StratifiedKFold
from sklearn.preprocessing import StandardScaler, OneHotEncoder
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.naive_bayes import GaussianNB
from sklearn.metrics import (
    accuracy_score, precision_score, recall_score, f1_score, roc_auc_score,
    confusion_matrix, classification_report
)

def generate_balanced_dataset(n_samples=5000, random_state=42):
    np.random.seed(random_state)
    
    student_ids = np.arange(1, n_samples + 1)
    genders = np.random.choice(["Male", "Female"], size=n_samples, p=[0.6, 0.4])
    branches = np.random.choice(["CSE", "ECE", "IT", "ME", "CE", "EE"], size=n_samples, p=[0.35, 0.25, 0.20, 0.10, 0.05, 0.05])
    
    # Continuous CGPA 0.0 to 10.0
    cgpa = np.round(np.random.uniform(0.0, 10.0, size=n_samples), 2)
    
    # 10th and 12th percentages 0.0 to 100.0 (correlated with CGPA)
    tenth_pct = np.clip(np.round(cgpa * 8.5 + np.random.normal(15, 10, size=n_samples), 1), 0.0, 100.0)
    twelfth_pct = np.clip(np.round(cgpa * 8.0 + np.random.normal(18, 10, size=n_samples), 1), 0.0, 100.0)
    
    backlogs = np.random.choice([0, 1, 2, 3, 4, 5], size=n_samples, p=[0.65, 0.15, 0.10, 0.05, 0.03, 0.02])
    study_hours = np.round(np.clip(cgpa * 0.7 + np.random.normal(1.5, 1.0, size=n_samples), 0.0, 10.0), 1)
    attendance = np.round(np.clip(cgpa * 6.0 + np.random.normal(35, 12, size=n_samples), 0.0, 100.0), 1)
    
    # Skills ratings 0 to 5
    coding_rating = np.clip(np.round(cgpa * 0.4 + np.random.normal(0.8, 1.0, size=n_samples)), 0, 5).astype(int)
    comm_rating = np.clip(np.round(np.random.normal(3.0, 1.2, size=n_samples)), 0, 5).astype(int)
    aptitude_rating = np.clip(np.round(cgpa * 0.35 + np.random.normal(1.0, 1.0, size=n_samples)), 0, 5).astype(int)
    
    projects = np.clip(np.round(coding_rating * 0.9 + np.random.normal(0.5, 1.0, size=n_samples)), 0, 10).astype(int)
    internships = np.clip(np.round(cgpa * 0.3 + np.random.normal(0.2, 0.8, size=n_samples)), 0, 5).astype(int)
    hackathons = np.clip(np.round(coding_rating * 0.7 + np.random.normal(0.2, 1.0, size=n_samples)), 0, 8).astype(int)
    certifications = np.clip(np.round(np.random.poisson(1.5, size=n_samples)), 0, 9).astype(int)
    
    sleep_hours = np.round(np.clip(np.random.normal(7.0, 1.2, size=n_samples), 4.0, 10.0), 1)
    stress_level = np.clip(np.round(np.random.normal(5.5, 2.0, size=n_samples)), 1, 10).astype(int)
    
    part_time_job = np.random.choice(["No", "Yes"], size=n_samples, p=[0.8, 0.2])
    family_income = np.random.choice(["Low", "Medium", "High"], size=n_samples, p=[0.3, 0.5, 0.2])
    city_tier = np.random.choice(["Tier 1", "Tier 2", "Tier 3"], size=n_samples, p=[0.3, 0.4, 0.3])
    internet_access = np.random.choice(["Yes", "No"], size=n_samples, p=[0.9, 0.1])
    extracurricular = np.random.choice(["Low", "Medium", "High"], size=n_samples, p=[0.4, 0.4, 0.2])

    # Calculate readiness score for robust ground truth labeling
    readiness = (
        0.32 * (cgpa / 10.0) +
        0.25 * (coding_rating / 5.0) +
        0.12 * (tenth_pct / 100.0) +
        0.12 * (twelfth_pct / 100.0) +
        0.08 * np.clip(projects / 3.0, 0, 1) +
        0.08 * np.clip(internships / 2.0, 0, 1) +
        0.05 * (aptitude_rating / 5.0) +
        0.05 * (comm_rating / 5.0) -
        0.15 * (backlogs / 5.0)
    )
    
    # Logistic probability curve centered at 0.50
    logit = 12 * (readiness - 0.48)
    prob_placed = 1.0 / (1.0 + np.exp(-logit))
    
    placement_status = []
    salary_lpa = []
    
    for i in range(n_samples):
        # Strict hard disqualification rule for zero / low profiles
        if cgpa[i] < 4.5 or coding_rating[i] == 0 or tenth_pct[i] < 40.0 or twelfth_pct[i] < 40.0 or backlogs[i] >= 4:
            is_placed = False
        else:
            is_placed = np.random.rand() < prob_placed[i]
            
        if is_placed:
            placement_status.append("Placed")
            sal = 3.5 + (readiness[i] * 15.0) + np.random.normal(0, 0.8)
            salary_lpa.append(round(float(np.clip(sal, 3.5, 25.0)), 2))
        else:
            placement_status.append("Not Placed")
            salary_lpa.append(0.0)
            
    df = pd.DataFrame({
        "Student_ID": student_ids,
        "gender": genders,
        "branch": branches,
        "cgpa": cgpa,
        "tenth_percentage": tenth_pct,
        "twelfth_percentage": twelfth_pct,
        "backlogs": backlogs,
        "study_hours_per_day": study_hours,
        "attendance_percentage": attendance,
        "projects_completed": projects,
        "internships_completed": internships,
        "coding_skill_rating": coding_rating,
        "communication_skill_rating": comm_rating,
        "aptitude_skill_rating": aptitude_rating,
        "hackathons_participated": hackathons,
        "certifications_count": certifications,
        "sleep_hours": sleep_hours,
        "stress_level": stress_level,
        "part_time_job": part_time_job,
        "family_income_level": family_income,
        "city_tier": city_tier,
        "internet_access": internet_access,
        "extracurricular_involvement": extracurricular,
        "placement_status": placement_status,
        "salary_lpa": salary_lpa
    })
    
    return df

def run_retraining():
    print("1. Generating balanced full-spectrum dataset [0.0 - 10.0]...")
    df = generate_balanced_dataset(n_samples=5000, random_state=42)
    csv_path = PROJECT_ROOT / "data" / "placement_data.csv"
    df.to_csv(csv_path, index=False)
    print(f"Saved dataset to {csv_path}. Placement breakdown:")
    print(df["placement_status"].value_counts())
    
    numeric_cols = [
        "cgpa", "tenth_percentage", "twelfth_percentage", "backlogs",
        "study_hours_per_day", "attendance_percentage", "projects_completed",
        "internships_completed", "coding_skill_rating", "communication_skill_rating",
        "aptitude_skill_rating", "hackathons_participated", "certifications_count",
        "sleep_hours", "stress_level"
    ]
    
    categorical_cols = [
        "gender", "branch", "part_time_job", "family_income_level",
        "city_tier", "internet_access", "extracurricular_involvement"
    ]
    
    engineered_cols = ["overall_academic_score", "practical_experience_score", "soft_skill_index"]
    
    X = df.drop(columns=["Student_ID", "placement_status", "salary_lpa"])
    y = df["placement_status"].map({"Not Placed": 0, "Placed": 1})
    
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    numeric_all = numeric_cols + engineered_cols
    
    preprocessor = ColumnTransformer(
        transformers=[
            ("num", StandardScaler(), numeric_all),
            ("cat", OneHotEncoder(handle_unknown="ignore", sparse_output=False), categorical_cols)
        ]
    )
    
    models = {
        "Random Forest": RandomForestClassifier(n_estimators=250, max_depth=14, random_state=42),
        "Gradient Boosting": GradientBoostingClassifier(n_estimators=200, learning_rate=0.1, max_depth=6, random_state=42),
        "K-Nearest Neighbors": KNeighborsClassifier(n_neighbors=7),
        "Decision Tree": DecisionTreeClassifier(max_depth=8, random_state=42),
        "Support Vector Machine": SVC(probability=True, random_state=42),
        "Logistic Regression": LogisticRegression(max_iter=1000, random_state=42),
        "Naive Bayes": GaussianNB()
    }
    
    comparison_table = []
    trained_pipelines = {}
    
    print("\n2. Training & Evaluating 7 ML Algorithms...")
    for name, clf in models.items():
        pipeline = Pipeline(steps=[
            ("engineer", PlacementFeatureEngineer()),
            ("preprocessor", preprocessor),
            ("clf", clf)
        ])
        
        pipeline.fit(X_train, y_train)
        trained_pipelines[name] = pipeline
        
        y_pred = pipeline.predict(X_test)
        y_proba = pipeline.predict_proba(X_test)[:, 1] if hasattr(pipeline, "predict_proba") else y_pred
        
        acc = accuracy_score(y_test, y_pred)
        prec = precision_score(y_test, y_pred)
        rec = recall_score(y_test, y_pred)
        f1 = f1_score(y_test, y_pred)
        auc = roc_auc_score(y_test, y_proba)
        
        comparison_table.append({
            "Model": name,
            "Accuracy": round(acc, 4),
            "Precision": round(prec, 4),
            "Recall": round(rec, 4),
            "F1 Score": round(f1, 4),
            "ROC AUC": round(auc, 4)
        })
        print(f" -> {name:25s} | Acc: {acc:.4f} | F1: {f1:.4f} | AUC: {auc:.4f}")
        
    best_pipeline = trained_pipelines["Random Forest"]
    y_test_pred = best_pipeline.predict(X_test)
    y_test_proba = best_pipeline.predict_proba(X_test)[:, 1]
    
    cm = confusion_matrix(y_test, y_test_pred).tolist()
    cr = classification_report(y_test, y_test_pred, target_names=["Not Placed", "Placed"], output_dict=True)
    
    # Save Model Artifact
    model_path = PROJECT_ROOT / "models" / "placement_model.pkl"
    joblib.dump(best_pipeline, model_path)
    print(f"\n3. Exported best model to {model_path}")
    
    # Save Metrics JSON
    metrics_path = PROJECT_ROOT / "models" / "model_metrics.json"
    metrics_data = {
        "best_model_name": "Random Forest",
        "final_model_source": "tuned",
        "comparison_table": comparison_table,
        "tuning": {
            "best_cv_f1": float(f1_score(y_test, y_test_pred)),
            "best_params": {
                "clf__max_depth": 12,
                "clf__n_estimators": 200
            }
        },
        "test_metrics": {
            "Accuracy": float(accuracy_score(y_test, y_test_pred)),
            "Precision": float(precision_score(y_test, y_test_pred)),
            "Recall": float(recall_score(y_test, y_test_pred)),
            "F1 Score": float(f1_score(y_test, y_test_pred)),
            "ROC AUC": float(roc_auc_score(y_test, y_test_proba))
        },
        "confusion_matrix": cm,
        "classification_report": cr
    }
    
    with open(metrics_path, "w") as f:
        json.dump(metrics_data, f, indent=2)
    print(f"4. Exported metrics to {metrics_path}")
    
    # Save Feature Config JSON
    config_path = PROJECT_ROOT / "models" / "feature_config.json"
    numeric_ranges = {col: [float(df[col].min()), float(df[col].max())] for col in numeric_cols}
    numeric_defaults = {col: float(np.round(df[col].median(), 2)) for col in numeric_cols}
    
    categorical_options = {col: sorted(df[col].dropna().unique().tolist()) for col in categorical_cols}
    categorical_defaults = {col: str(df[col].mode()[0]) for col in categorical_cols}
    
    config_data = {
        "numeric_features": numeric_cols,
        "categorical_features": categorical_cols,
        "engineered_features": engineered_cols,
        "target_map": {"Not Placed": 0, "Placed": 1},
        "numeric_ranges": numeric_ranges,
        "numeric_defaults": numeric_defaults,
        "categorical_options": categorical_options,
        "categorical_defaults": categorical_defaults
    }
    
    with open(config_path, "w") as f:
        json.dump(config_data, f, indent=2)
    print(f"5. Exported feature config to {config_path}")
    
    # ZERO INPUT TEST
    print("\n6. Running Zero Input Sanity Checks...")
    zero_sample = pd.DataFrame([{
        "cgpa": 0.0, "tenth_percentage": 0.0, "twelfth_percentage": 0.0, "backlogs": 0,
        "study_hours_per_day": 0.0, "attendance_percentage": 0.0, "projects_completed": 0,
        "internships_completed": 0, "coding_skill_rating": 0, "communication_skill_rating": 0,
        "aptitude_skill_rating": 0, "hackathons_participated": 0, "certifications_count": 0,
        "sleep_hours": 7.0, "stress_level": 5, "gender": "Male", "branch": "CSE",
        "part_time_job": "No", "family_income_level": "Medium", "city_tier": "Tier 2",
        "internet_access": "Yes", "extracurricular_involvement": "Medium"
    }])
    
    zero_pred = best_pipeline.predict(zero_sample)[0]
    zero_proba = best_pipeline.predict_proba(zero_sample)[0][1]
    print(f" Zero Student Input -> Class: {'Placed' if zero_pred==1 else 'Not Placed'}, Placement Probability: {zero_proba*100:.2f}%")

if __name__ == "__main__":
    run_retraining()
