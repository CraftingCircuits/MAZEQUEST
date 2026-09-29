# MAZEQUEST — ML MODULE DIRECTORY

This directory contains the machine learning data pipeline modules for **MazeQuest**.

---

## Directory Structure

```text
ml/
├── features/
│   ├── mazeFeatureExtractor.js       # Reusable spatial feature & search benchmark extractor
│   └── mazeFeatureExtractor.test.js  # Feature extractor unit tests
│
├── dataset/
│   ├── datasetGenerator.js           # 2,000 synthetic maze generator & quantile labeler
│   ├── datasetValidator.js           # Dataset schema validator & summary stats reporter
│   ├── datasetGenerator.test.js      # Dataset generator unit tests
│   └── runDatasetPipeline.js         # Master dataset generation runner
│
└── README.md                         # ML module overview
```

---

## Data Exports Directory

The generated synthetic dataset files are saved in `data/ml/`:
- `data/ml/dataset.csv`: Authoritative CSV dataset ($N = 2,000$)
- `data/ml/dataset.json`: Authoritative JSON dataset ($N = 2,000$)
