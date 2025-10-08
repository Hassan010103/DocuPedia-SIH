import os
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report

from utility.dataset import build_synthetic_dataset
from utility.featurizer import Featurizer
from utility.persistence import save_classifier_and_meta, save_pipeline_sklearn, load_pipeline

def train_pipeline(df, featurizer):
    X = df["text"].tolist()
    y = df["label"].values

    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=123, stratify=y)

    print("[main] Featurizing training data...")
    X_train_vec = featurizer.fit_transform(X_train)
    print("[main] Featurizing test data...")
    X_test_vec = featurizer.transform(X_test)

    clf = LogisticRegression(max_iter=1000, multi_class="multinomial", solver="saga")
    print("[main] Training Logistic Regression (demo classifier)...")
    clf.fit(X_train_vec, y_train)

    y_pred = clf.predict(X_test_vec)
    print("\n=== Demo classification report (synthetic data) ===")
    print(classification_report(y_test, y_pred, zero_division=0))

    if not featurizer.use_transformer:
        from sklearn.pipeline import Pipeline
        pipeline = Pipeline([
            ("tfidf", featurizer.tfidf),
            ("clf", clf)
        ])
    else:
        pipeline = {"clf": clf, "featurizer": featurizer}

    return pipeline

def demo_run():
    os.makedirs("data", exist_ok=True)
    os.makedirs("models", exist_ok=True)

    print("[main] Building synthetic dataset...")
    df = build_synthetic_dataset(n_per_class=120)
    dataset_path = os.path.join("data", "synthetic_docs.csv")
    df.to_csv(dataset_path, index=False)
    print(f"[main] Synthetic dataset saved to {dataset_path}")
    print("\nSample rows:")
    print(df.sample(5).to_dict(orient="records"))

    print("\n[main] Initializing featurizer...")
    featurizer = Featurizer()  

    pipeline = train_pipeline(df, featurizer)

    # Save artifacts
    if isinstance(pipeline, dict) and "clf" in pipeline:
        # transformer path
        save_classifier_and_meta(pipeline["clf"], featurizer, artifact_dir="models")
    else:
        # sklearn pipeline path
        save_pipeline_sklearn(pipeline, artifact_dir="models")

    # Demo predictions
    try:
        print("\n[main] Loading saved pipeline for demo inference...")
        loaded = load_pipeline("models")
    except Exception as e:
        print("[main] Failed to load saved pipeline:", e)
        loaded = pipeline

    new_docs = [
        "Invoice: INV-999, Vendor: RapidParts, Amount: INR 1,10,000. Please process payment within 45 days.",
        "Emergency drill schedule for depot A on 2025-10-12. All staff must participate.",
        "Proposal for new signaling algorithm to reduce headway by 20% across corridor.",
        "Commissioner directive: please submit monthly safety compliance report before month end.",
        "Legal contract amendment regarding land lease duration extended to 30 years."
    ]

    def predict_texts(pipeline_obj, texts):
        if isinstance(pipeline_obj, dict) and "clf" in pipeline_obj and "featurizer" in pipeline_obj:
            featurizer_local = pipeline_obj["featurizer"]
            clf_local = pipeline_obj["clf"]
            X_vec = featurizer_local.transform(texts)
            preds = clf_local.predict(X_vec)
            return preds.tolist()
        else:
            preds = pipeline_obj.predict(texts)
            return preds.tolist()

    print("\n--- Demo: sample predictions for new docs ---")
    preds = predict_texts(loaded, new_docs)
    for d, p in zip(new_docs, preds):
        print(f"[{p}] {d}")

    
    from utility.dataset import synthetic_document
    synthetic_samples = [synthetic_document("Engineering", 999),
                         synthetic_document("Finance", 888),
                         synthetic_document("Safety", 777)]
    print("\n--- Demo: predictions for synthetic samples ---")
    preds2 = predict_texts(loaded, synthetic_samples)
    for d, p in zip(synthetic_samples, preds2):
        print(f"[{p}] {d}")

    print("\n[main] Artifacts saved to ./models and dataset in ./data. Demo complete.")

if __name__ == "__main__":
    demo_run()
