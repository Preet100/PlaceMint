export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export interface PredictionResult {
  prediction: "Placed" | "Not Placed";
  placed_probability: number;
  not_placed_probability: number;
  confidence: number;
  composite_scores?: {
    academic_score: number;
    practical_score: number;
    soft_index: number;
  };
  input_features: Record<string, any>;
  suggestions: Array<{
    type: "improve" | "strength";
    text: string;
    feature: string;
  }>;
}

export interface ModelMetrics {
  comparison_table: Array<{
    Model: string;
    Accuracy: number;
    Precision: number;
    Recall: number;
    "F1 Score": number;
    "ROC-AUC": number;
    CV_Accuracy_Mean: number;
  }>;
  confusion_matrix: {
    TN: number;
    FP: number;
    FN: number;
    TP: number;
  };
  roc_curve: {
    fpr: number[];
    tpr: number[];
    auc: number;
  };
  feature_importance: Array<{
    Feature: string;
    Importance: number;
  }>;
}

export interface ConfigData {
  config: {
    numeric_features: string[];
    categorical_features: string[];
    numeric_defaults: Record<string, number>;
    categorical_defaults: Record<string, string>;
    dropdown_options: Record<string, string[]>;
    slider_ranges: Record<string, { min: number; max: number; step: number }>;
    placed_cohort_stats: Record<string, any>;
  };
  branch_labels: Record<string, string>;
  feature_display_names: Record<string, string>;
}

export async function getHealth(): Promise<{ status: string; app_name: string; model_ready: boolean }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/health`, { cache: "no-store" });
    if (!res.ok) return { status: "degraded", app_name: "PlaceMint AI", model_ready: false };
    return await res.json();
  } catch (e) {
    return { status: "offline", app_name: "PlaceMint AI", model_ready: false };
  }
}

export async function getConfig(): Promise<ConfigData | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/config`, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function getMetrics(): Promise<ModelMetrics | null> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/metrics`, { cache: "force-cache" });
    if (!res.ok) return null;
    return await res.json();
  } catch (e) {
    return null;
  }
}

export async function predictPlacement(features: Record<string, any>): Promise<PredictionResult> {
  const res = await fetch(`${API_BASE_URL}/api/predict`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ features }),
  });
  if (!res.ok) {
    throw new Error(`Prediction failed with status ${res.status}`);
  }
  return await res.json();
}

export async function parseResume(file: File): Promise<any> {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch(`${API_BASE_URL}/api/resume/parse`, {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Upload failed" }));
    throw new Error(err.detail || "Resume parsing failed");
  }
  return await res.json();
}

export async function buildResume(resumeData: Record<string, any>): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/resume/build`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ resume_data: resumeData }),
  });

  if (!res.ok) {
    throw new Error(`Build failed with status ${res.status}`);
  }
  return await res.json();
}
