# 🎓 PlaceMint AI 2.0
### Full-Stack AI Resume Intelligence & Campus Placement Prediction System

<p align="center">
  <img src="https://img.shields.io/badge/Next.js_16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white" alt="FastAPI" />
  <img src="https://img.shields.io/badge/Python-3.11+-blue?style=for-the-badge&logo=python" alt="Python" />
  <img src="https://img.shields.io/badge/Scikit--Learn-96.5%25_Accuracy-F7931E?style=for-the-badge&logo=scikitlearn" alt="Scikit-Learn" />
  <img src="https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white" alt="TailwindCSS" />
  <img src="https://img.shields.io/badge/License-MIT-green?style=for-the-badge" alt="License" />
</p>

<p align="center">
  <b>PlaceMint AI 2.0</b> is an enterprise-grade, full-stack recruitment intelligence platform that combines <b>Supervised Machine Learning</b> and <b>Natural Language Processing</b> to analyze student resumes, calculate 100-point transparent ATS quality scores, predict placement probabilities with <b>96.5% accuracy</b>, and auto-upgrade candidate CVs with actionable career suggestions.
</p>

---

## ✨ Features

- 📄 **Smart ATS Resume PDF Parser**: Structural PDF parsing (`pdfplumber` / `PyPDF2` + optional Groq LLM layer) with accurate academic, project, skill, and certification extraction.
- 📊 **Transparent 100-Point ATS Quality Breakdown**: Explicit scoring across Technical Skills (25pt), Academics (20pt), Projects (25pt), Experience (15pt), Certifications (10pt), and Contact Integrity (5pt).
- 🛠️ **Guided Resume Builder & AI Upgrade**: Enrich CV structure with high-demand industry skills, certifications, and quantifiable project impact metrics while preserving candidate template layout.
- 🎯 **Multi-Feature Placement Predictor Engine**: Real-time prediction engine backed by 22 student profile features with sliders, manual recalculate mode, and real-time gauges.
- 🏆 **7-Algorithm ML Benchmark Leaderboard**: Interactive comparison across Random Forest, Gradient Boosting, Decision Tree, Support Vector Machine, Logistic Regression, Naive Bayes, and K-NN.
- 🎨 **Modern Premium Glassmorphism UI**: Built with Next.js 16, TypeScript, TailwindCSS, custom SVG gauge components, micro-animations, and responsive layouts.

---

## 📊 ML Model Performance Leaderboard

Retrained on a full-spectrum continuous dataset (`5,000` student profiles, `0.0 - 10.0` range) with **zero class imbalance**:

| Model Algorithm | Accuracy | Precision | Recall | F1 Score | ROC-AUC | Status |
| :--- | :---: | :---: | :---: | :---: | :---: | :---: |
| **Random Forest (Production Model)** | **96.50%** | **94.58%** | **98.33%** | **96.42%** | **99.44%** | **ACTIVE** |
| **Gradient Boosting** | **96.30%** | **94.56%** | **97.91%** | **96.21%** | **99.39%** | Verified |
| **Decision Tree** | **95.90%** | **94.51%** | **97.08%** | **95.78%** | **98.27%** | Verified |
| **Support Vector Machine (SVM)** | **95.40%** | **95.20%** | **95.20%** | **95.20%** | **99.08%** | Verified |
| **Logistic Regression** | **93.50%** | **92.95%** | **93.53%** | **93.24%** | **98.38%** | Verified |
| **Naive Bayes** | **92.80%** | **92.48%** | **92.48%** | **92.48%** | **97.58%** | Verified |
| **K-Nearest Neighbors (K-NN)** | **92.70%** | **91.43%** | **93.53%** | **92.47%** | **98.14%** | Verified |

---

## 🏗️ Tech Stack & Architecture

### **Frontend**
- **Framework**: Next.js 16 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS, Glassmorphism UI Design System
- **Icons & Visualization**: Lucide React Icons, Recharts, Custom Animated SVG Gauges

### **Backend & Machine Learning**
- **REST Framework**: FastAPI, Uvicorn Daemon
- **ML Pipeline**: Scikit-Learn (`RandomForestClassifier`), Joblib, NumPy, Pandas
- **PDF Extraction**: `pdfplumber`, `PyPDF2` Heuristic Regex NLP Engine (Optional Groq LLM Layer)

---

## 🚀 Quickstart & Local Setup

### 1. Clone Repository
```bash
git clone https://github.com/Preet100/PlaceMint.git
cd PlaceMint
```

### 2. Start FastAPI Backend (Port 8000)
```bash
# Install Python dependencies
pip install -r requirements.txt

# Start FastAPI server daemon
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Backend API will be running on `http://127.0.0.1:8000`.

### 3. Start Next.js Frontend (Port 3000)
```bash
cd frontend

# Install Node modules
npm install

# Run dev server
npm run dev
```
Frontend Web App will be running on `http://localhost:3000`.

---

## 🌐 Production Deployment

- **Frontend**: Deploy `frontend/` folder to **Vercel** with environment variable `NEXT_PUBLIC_API_URL`.
- **Backend**: Deploy project root to **Render** Web Service with start command `uvicorn backend.main:app --host 0.0.0.0 --port $PORT`.

---

## 📄 License
Distributed under the **MIT License**. See `LICENSE` for details.
