"""
MazeQuest — ML Model Training & Cross-Validation Module
ML Module — Phase 8C Implementation

Handles:
1. KNN K hyperparameter investigation (K in [3, 5, 7, 9]) via 5-Fold Stratified CV
2. 5-Fold Stratified Cross-Validation on Training data (1,600 records)
3. Model training on full Training split
4. Feature importance and coefficient extraction
"""

import numpy as np
import pandas as pd
from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.neighbors import KNeighborsClassifier
from sklearn.tree import DecisionTreeClassifier
from sklearn.linear_model import LogisticRegression
from ml.training.preprocessing import APPROVED_FEATURE_COLUMNS, create_model_pipelines

def investigate_knn_k(X_train, y_train, k_range=[3, 5, 7, 9], random_state=42):
    """
    Evaluates KNN performance across a range of K values using 5-Fold Stratified CV on Training split.
    Selection is based strictly on Training CV score, keeping Test set untouched.
    """
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    results = {}

    for k in k_range:
        pipeline = Pipeline([
            ('scaler', StandardScaler()),
            ('knn', KNeighborsClassifier(n_neighbors=k))
        ])

        scores = cross_validate(
            pipeline, X_train, y_train,
            cv=cv,
            scoring=['accuracy', 'f1_weighted']
        )

        results[k] = {
            'mean_accuracy': float(np.mean(scores['test_accuracy'])),
            'std_accuracy': float(np.std(scores['test_accuracy'])),
            'mean_f1_weighted': float(np.mean(scores['test_f1_weighted'])),
            'std_f1_weighted': float(np.std(scores['test_f1_weighted']))
        }

    # Select best K based on highest mean CV accuracy
    best_k = max(results.keys(), key=lambda k: results[k]['mean_accuracy'])
    return results, best_k

def run_cross_validation(pipelines, X_train, y_train, random_state=42):
    """
    Executes 5-Fold Stratified Cross-Validation on Training set (1,600 records) for all pipelines.
    """
    cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=random_state)
    cv_results = {}

    for name, pipeline in pipelines.items():
        scores = cross_validate(
            pipeline, X_train, y_train,
            cv=cv,
            scoring=['accuracy', 'precision_weighted', 'recall_weighted', 'f1_weighted']
        )

        cv_results[name] = {
            'fold_accuracies': [float(acc) for acc in scores['test_accuracy']],
            'mean_cv_accuracy': float(np.mean(scores['test_accuracy'])),
            'std_cv_accuracy': float(np.std(scores['test_accuracy'])),
            'mean_cv_precision': float(np.mean(scores['test_precision_weighted'])),
            'mean_cv_recall': float(np.mean(scores['test_recall_weighted'])),
            'mean_cv_f1': float(np.mean(scores['test_f1_weighted'])),
            'std_cv_f1': float(np.std(scores['test_f1_weighted']))
        }

    return cv_results

def train_all_models(pipelines, X_train, y_train):
    """
    Fits all model pipelines on the full Training set (1,600 records).
    """
    trained_models = {}
    for name, pipeline in pipelines.items():
        pipeline.fit(X_train, y_train)
        trained_models[name] = pipeline
    return trained_models

def extract_model_interpretability(trained_models):
    """
    Extracts Decision Tree feature importances and Logistic Regression coefficients.
    """
    interpretability = {}

    # 1. Decision Tree Feature Importances
    dt_model = trained_models['Decision Tree']
    dt_importances = dt_model.feature_importances_
    dt_dict = {feat: float(imp) for feat, imp in zip(APPROVED_FEATURE_COLUMNS, dt_importances)}
    interpretability['decision_tree'] = dt_dict

    # 2. Logistic Regression Coefficients per class
    lr_pipeline = trained_models['Logistic Regression']
    lr_model = lr_pipeline.named_steps['lr']
    lr_coefs = lr_model.coef_ # Shape (3, 5)

    lr_dict = {}
    class_names = ['Easy (0)', 'Medium (1)', 'Hard (2)']
    for i, class_name in enumerate(class_names):
        lr_dict[class_name] = {feat: float(coef) for feat, coef in zip(APPROVED_FEATURE_COLUMNS, lr_coefs[i])}

    interpretability['logistic_regression'] = lr_dict
    interpretability['knn'] = "KNN is an instance-based non-parametric model with no conventional feature importance coefficients."

    return interpretability
