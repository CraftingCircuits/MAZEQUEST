"""
MazeQuest — ML Pipeline Automated Unit Test Suite
ML Module — Phase 8C Implementation
"""

import os
import unittest
import numpy as np
import pandas as pd

from ml.training.preprocessing import load_and_validate_dataset, create_model_pipelines, APPROVED_FEATURE_COLUMNS, TARGET_COLUMN, TARGET_LEAKAGE_COLUMNS
from ml.training.train_models import investigate_knn_k, run_cross_validation, train_all_models
from ml.training.evaluate_models import evaluate_models_on_test_set

class TestMLPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.csv_path = 'data/ml/dataset.csv'
        cls.df, cls.train_df, cls.test_df, cls.X_train, cls.y_train, cls.X_test, cls.y_test = load_and_validate_dataset(cls.csv_path)

    def test_1_dataset_loading_and_rows(self):
        """Verify dataset row count is 2000, train is 1600, test is 400."""
        self.assertEqual(len(self.df), 2000)
        self.assertEqual(len(self.train_df), 1600)
        self.assertEqual(len(self.test_df), 400)

    def test_2_exact_five_features_in_X(self):
        """Verify X contains exactly 5 spatial features."""
        self.assertEqual(len(APPROVED_FEATURE_COLUMNS), 5)
        self.assertEqual(list(self.X_train.columns), APPROVED_FEATURE_COLUMNS)
        self.assertEqual(list(self.X_test.columns), APPROVED_FEATURE_COLUMNS)

    def test_3_target_column_and_classes(self):
        """Verify target column is difficulty with ternary classes {0, 1, 2}."""
        self.assertEqual(TARGET_COLUMN, 'difficulty')
        self.assertEqual(set(self.y_train.unique()), {0, 1, 2})
        self.assertEqual(set(self.y_test.unique()), {0, 1, 2})

    def test_4_zero_target_leakage_in_X(self):
        """Verify no target leakage column is present in feature vector X."""
        for col in TARGET_LEAKAGE_COLUMNS:
            self.assertNotIn(col, APPROVED_FEATURE_COLUMNS)

    def test_5_knn_k_investigation_uses_training_cv_only(self):
        """Verify K investigation evaluates K in [3, 5, 7, 9] on training set only."""
        k_results, best_k = investigate_knn_k(self.X_train, self.y_train, k_range=[3, 5, 7, 9])
        self.assertIn(best_k, [3, 5, 7, 9])
        self.assertEqual(set(k_results.keys()), {3, 5, 7, 9})

    def test_6_pipelines_and_prediction_output(self):
        """Verify trained models output exact predictions of size 400 with classes {0, 1, 2}."""
        pipelines = create_model_pipelines(knn_k=7)
        trained = train_all_models(pipelines, self.X_train, self.y_train)
        eval_res, preds = evaluate_models_on_test_set(trained, self.X_test, self.y_test)

        for name, pred in preds.items():
            self.assertEqual(len(pred), 400)
            self.assertTrue(set(np.unique(pred)).issubset({0, 1, 2}))

        for name, res in eval_res.items():
            self.assertEqual(np.array(res['confusion_matrix']).shape, (3, 3))
            self.assertGreaterEqual(res['accuracy'], 0.0)
            self.assertLessEqual(res['accuracy'], 1.0)

if __name__ == '__main__':
    unittest.main()
