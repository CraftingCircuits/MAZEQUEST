"""
MazeQuest — ML Preprocessing & Feature Isolation Module
ML Module — Phase 8C Implementation

Enforces strict separation between:
1. Approved Spatial Input Features X (5 features)
2. Target Variable y (difficulty)
3. Target Leakage Metrics (EXCLUDED from X)
"""

import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.tree import DecisionTreeClassifier
from sklearn.neighbors import KNeighborsClassifier
from sklearn.linear_model import LogisticRegression

# Approved Feature Schema Definitions
APPROVED_FEATURE_COLUMNS = [
    'wall_density',
    'dead_end_ratio',
    'branching_ratio',
    'straight_corridor_ratio',
    'turn_corridor_ratio'
]

TARGET_COLUMN = 'difficulty'

TARGET_LEAKAGE_COLUMNS = [
    'shortest_path_length',
    'manhattan_dist',
    'path_detour_factor',
    'bfs_nodes_explored',
    'search_expansion_ratio',
    'complexity_index_search'
]

EXPECTED_DATASET_FIELDS = [
    'maze_id', 'seed', 'height', 'width', 'total_cells', 'open_cell_count', 'wall_count',
    'wall_density', 'dead_end_count', 'dead_end_ratio', 'branching_point_count', 'branching_ratio',
    'straight_corridor_count', 'straight_corridor_ratio', 'turn_corridor_count', 'turn_corridor_ratio',
    'shortest_path_length', 'manhattan_dist', 'path_detour_factor', 'bfs_nodes_explored',
    'search_expansion_ratio', 'complexity_index_search', 'split', 'difficulty'
]

def load_and_validate_dataset(csv_path='data/ml/dataset.csv'):
    """
    Loads Phase 8B dataset and conducts strict schema and feature isolation checks.
    """
    df = pd.read_csv(csv_path)

    # 1. Dataset Shape & Field Verification
    assert len(df) == 2000, f"Expected 2000 records, found {len(df)}"
    assert list(df.columns) == EXPECTED_DATASET_FIELDS, f"Dataset columns do not match expected 24-field schema"
    assert df.isnull().sum().sum() == 0, "Dataset contains missing values"
    assert not np.isinf(df.select_dtypes(include=np.number)).any().any(), "Dataset contains Infinity"

    # 2. Strict Target Leakage Prevention Check
    for col in TARGET_LEAKAGE_COLUMNS:
        assert col not in APPROVED_FEATURE_COLUMNS, f"CRITICAL ERROR: Target leakage column '{col}' found in feature list X"

    # 3. Split Assignment Verification
    train_df = df[df['split'] == 'train'].copy()
    test_df = df[df['split'] == 'test'].copy()

    assert len(train_df) == 1600, f"Expected 1600 training records, found {len(train_df)}"
    assert len(test_df) == 400, f"Expected 400 testing records, found {len(test_df)}"

    # 4. Extract Feature Vectors X and Target Arrays y
    X_train = train_df[APPROVED_FEATURE_COLUMNS].copy()
    y_train = train_df[TARGET_COLUMN].copy()

    X_test = test_df[APPROVED_FEATURE_COLUMNS].copy()
    y_test = test_df[TARGET_COLUMN].copy()

    assert set(y_train.unique()) == {0, 1, 2}, f"Training target does not contain exact classes {{0, 1, 2}}"
    assert set(y_test.unique()) == {0, 1, 2}, f"Testing target does not contain exact classes {{0, 1, 2}}"

    return df, train_df, test_df, X_train, y_train, X_test, y_test

def create_model_pipelines(knn_k=7, random_state=42):
    """
    Creates model objects/pipelines ensuring scaling is fitted ONLY inside pipelines.
    """
    pipelines = {
        'Decision Tree': DecisionTreeClassifier(
            random_state=random_state,
            criterion='gini'
        ),
        'K-Nearest Neighbors': Pipeline([
            ('scaler', StandardScaler()),
            ('knn', KNeighborsClassifier(n_neighbors=knn_k))
        ]),
        'Logistic Regression': Pipeline([
            ('scaler', StandardScaler()),
            ('lr', LogisticRegression(
                random_state=random_state,
                max_iter=1000
            ))
        ])
    }
    return pipelines
