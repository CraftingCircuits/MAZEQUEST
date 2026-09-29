"""
MazeQuest — Full ML Training & Evaluation Pipeline Executable
ML Module — Phase 8C Implementation

Runs the end-to-end training, cross-validation, test set evaluation, model serialization,
and results JSON export pipeline for Phase 8C.
"""

import os
import json
import joblib
import pandas as pd
import numpy as np
import sklearn
import matplotlib

from ml.training.preprocessing import load_and_validate_dataset, create_model_pipelines, APPROVED_FEATURE_COLUMNS, TARGET_COLUMN
from ml.training.train_models import investigate_knn_k, run_cross_validation, train_all_models, extract_model_interpretability
from ml.training.evaluate_models import evaluate_models_on_test_set, generate_and_save_confusion_matrices, perform_error_analysis, analyze_wall_density_impact

def run_pipeline(csv_path='data/ml/dataset.csv', output_base='ml'):
    """
    Executes the full Phase 8C ML Training and Evaluation Pipeline.
    """
    print("====================================================")
    print("   MAZEQUEST — PHASE 8C ML MODEL TRAINING PIPELINE  ")
    print("====================================================\n")

    # 1. Load and Validate Dataset
    df, train_df, test_df, X_train, y_train, X_test, y_test = load_and_validate_dataset(csv_path)
    print(f"[Dataset] Loaded {len(df)} records. Training: {len(train_df)} records, Testing: {len(test_df)} records.")
    print(f"[Dataset] Feature Vector X ({len(APPROVED_FEATURE_COLUMNS)} features): {APPROVED_FEATURE_COLUMNS}")
    print(f"[Dataset] Target y: {TARGET_COLUMN} (Classes: {sorted(y_train.unique().tolist())})\n")

    # 2. KNN K Investigation (Training Split CV Only)
    print("[Training] Investigating KNN hyperparameter K in [3, 5, 7, 9] via 5-Fold Stratified CV...")
    knn_results, best_k = investigate_knn_k(X_train, y_train, k_range=[3, 5, 7, 9])
    for k_val, res in knn_results.items():
        print(f"  - K = {k_val}: Mean CV Acc = {res['mean_accuracy']:.4f} (+/- {res['std_accuracy']:.4f}), Weighted F1 = {res['mean_f1_weighted']:.4f}")
    print(f"[Training] Selected K = {best_k} for KNN pipeline based on Training CV accuracy.\n")

    # 3. Create Pipelines & Perform 5-Fold Stratified Cross-Validation
    pipelines = create_model_pipelines(knn_k=best_k, random_state=42)
    print("[Training] Executing 5-Fold Stratified Cross-Validation on Training set (1,600 records)...")
    cv_results = run_cross_validation(pipelines, X_train, y_train)

    for name, cv_data in cv_results.items():
        print(f"  - {name}: Mean CV Acc = {cv_data['mean_cv_accuracy']:.4f} (+/- {cv_data['std_cv_accuracy']:.4f}), Weighted F1 = {cv_data['mean_cv_f1']:.4f}")

    # 4. Train Models on Full Training Set
    print("\n[Training] Fitting models on full Training set (1,600 records)...")
    trained_models = train_all_models(pipelines, X_train, y_train)

    # 5. Evaluate Models on Untouched Test Set
    print("\n[Evaluation] Evaluating models on untouched Test set (400 records)...")
    eval_results, predictions_dict = evaluate_models_on_test_set(trained_models, X_test, y_test)

    print("\n--- FACTUAL MODEL TEST EVALUATION TABLE ---")
    print(f"{'Model':<22} | {'Test Acc':<8} | {'Prec (W)':<8} | {'Recall (W)':<10} | {'F1 (W)':<8} | {'CV Acc':<8} | {'CV Std':<8}")
    print("-" * 85)
    for name in pipelines.keys():
        t_acc = eval_results[name]['accuracy']
        t_prec = eval_results[name]['weighted_precision']
        t_rec = eval_results[name]['weighted_recall']
        t_f1 = eval_results[name]['weighted_f1']
        c_acc = cv_results[name]['mean_cv_accuracy']
        c_std = cv_results[name]['std_cv_accuracy']
        print(f"{name:<22} | {t_acc:.4f}   | {t_prec:.4f}   | {t_rec:.4f}     | {t_f1:.4f}   | {c_acc:.4f}   | {c_std:.4f}")

    # 6. Confusion Matrices
    cm_dir = os.path.join(output_base, 'evaluation', 'confusion_matrices')
    generate_and_save_confusion_matrices(eval_results, cm_dir)
    print(f"\n[Evaluation] Confusion matrix PNGs saved to {cm_dir}/")

    # 7. Model Interpretability & Error Analysis & Wall Density Analysis
    interpretability = extract_model_interpretability(trained_models)
    error_analysis = perform_error_analysis(trained_models, X_test, y_test, test_df)
    wall_density_obs = analyze_wall_density_impact(df, trained_models)

    # 8. Model Serialization
    models_dir = os.path.join(output_base, 'models')
    os.makedirs(models_dir, exist_ok=True)
    joblib.dump(trained_models['Decision Tree'], os.path.join(models_dir, 'decision_tree.joblib'))
    joblib.dump(trained_models['K-Nearest Neighbors'], os.path.join(models_dir, 'knn_pipeline.joblib'))
    joblib.dump(trained_models['Logistic Regression'], os.path.join(models_dir, 'logistic_regression_pipeline.joblib'))
    print(f"[Models] Serialized trained pipelines to {models_dir}/")

    # 9. Save Machine-Readable Results JSON
    results_json_path = os.path.join(output_base, 'evaluation', 'results.json')
    os.makedirs(os.path.dirname(results_json_path), exist_ok=True)

    master_results = {
        'problem_type': 'Supervised Multiclass Classification',
        'dataset': {
            'total_records': len(df),
            'train_records': len(train_df),
            'test_records': len(test_df),
            'features': APPROVED_FEATURE_COLUMNS,
            'target': TARGET_COLUMN,
            'classes': [0, 1, 2]
        },
        'environment_versions': {
            'python': str(os.sys.version.split()[0]),
            'pandas': pd.__version__,
            'numpy': np.__version__,
            'scikit_learn': sklearn.__version__,
            'matplotlib': matplotlib.__version__,
            'joblib': joblib.__version__
        },
        'knn_hyperparameter_investigation': {
            'evaluated_k': [3, 5, 7, 9],
            'selected_k': best_k,
            'k_cv_results': knn_results
        },
        'cross_validation_5fold_train': cv_results,
        'test_set_evaluation': eval_results,
        'model_interpretability': interpretability,
        'error_analysis': error_analysis,
        'wall_density_observation': wall_density_obs,
        'random_seeds': {
            'dataset_split_seed': 42,
            'cross_validation_seed': 42,
            'model_random_state': 42
        }
    }

    with open(results_json_path, 'w', encoding='utf-8') as f:
        json.dump(master_results, f, indent=2)

    print(f"[Results] Machine-readable results saved to {results_json_path}\n")
    print("====================================================")
    print("   PHASE 8C ML TRAINING & EVALUATION COMPLETE       ")
    print("====================================================\n")

    return master_results

if __name__ == '__main__':
    run_pipeline()
