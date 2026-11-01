import numpy as np
import pandas as pd

def generate_synthetic_dataset(num_samples=10000, random_state=42):
    np.random.seed(random_state)
    
    # 6 Target Pattern Classes & corresponding UI Adaptations
    patterns = [
        ("Targeting difficulty", "larger_buttons"),
        ("Cognitive overload", "simplify_ui"),
        ("Navigation difficulty", "simplify_navigation"),
        ("Sensory sensitivity", "reduce_animation"),
        ("Information processing difficulty", "step_by_step_guidance"),
        ("Low discoverability", "improve_feature_visibility")
    ]
    
    data = []
    
    for _ in range(num_samples):
        # Pick a random target pattern class
        pattern_idx = np.random.choice(len(patterns))
        pattern_name, ui_adaptation = patterns[pattern_idx]
        
        # Generate correlated behavioral feature distributions per class
        if pattern_name == "Targeting difficulty":
            misclicks = np.random.randint(4, 12)
            completion_time = np.random.uniform(20, 50)
            backtracks = np.random.randint(0, 3)
            help_requests = np.random.randint(0, 2)
            feature_usage = np.random.randint(2, 8)
            sensory_proxy = np.random.uniform(0.1, 0.5)
            
        elif pattern_name == "Cognitive overload":
            misclicks = np.random.randint(1, 4)
            completion_time = np.random.uniform(70, 150)
            backtracks = np.random.randint(2, 6)
            help_requests = np.random.randint(2, 6)
            feature_usage = np.random.randint(1, 4)
            sensory_proxy = np.random.uniform(0.4, 0.9)
            
        elif pattern_name == "Navigation difficulty":
            misclicks = np.random.randint(0, 3)
            completion_time = np.random.uniform(40, 90)
            backtracks = np.random.randint(5, 12)
            help_requests = np.random.randint(0, 3)
            feature_usage = np.random.randint(3, 7)
            sensory_proxy = np.random.uniform(0.2, 0.6)
            
        elif pattern_name == "Sensory sensitivity":
            misclicks = np.random.randint(0, 2)
            completion_time = np.random.uniform(15, 45)
            backtracks = np.random.randint(0, 2)
            help_requests = np.random.randint(0, 1)
            feature_usage = np.random.randint(2, 6)
            sensory_proxy = np.random.uniform(0.8, 1.0)
            
        elif pattern_name == "Information processing difficulty":
            misclicks = np.random.randint(1, 4)
            completion_time = np.random.uniform(60, 120)
            backtracks = np.random.randint(1, 4)
            help_requests = np.random.randint(3, 8)
            feature_usage = np.random.randint(1, 4)
            sensory_proxy = np.random.uniform(0.3, 0.7)
            
        else:  # Low discoverability
            misclicks = np.random.randint(0, 2)
            completion_time = np.random.uniform(30, 70)
            backtracks = np.random.randint(2, 5)
            help_requests = np.random.randint(0, 2)
            feature_usage = np.random.randint(0, 2)
            sensory_proxy = np.random.uniform(0.1, 0.5)

        data.append({
            "misclick_count": misclicks,
            "task_completion_time_sec": round(completion_time, 2),
            "backtrack_count": backtracks,
            "help_requests": help_requests,
            "feature_usage_count": feature_usage,
            "sensory_load_proxy": round(sensory_proxy, 2),
            "pattern": pattern_name,
            "ui_adaptation": ui_adaptation
        })

    df = pd.DataFrame(data)
    df.to_csv("neuroease_synthetic_interactions_10000.csv", index=False)
    print(f"Successfully generated 10,000 synthetic interaction records -> neuroease_synthetic_interactions_10000.csv")

if __name__ == "__main__":
    generate_synthetic_dataset()





import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score
from sklearn.model_selection import train_test_split

FEATURES = [
    "misclick_count",
    "task_completion_time_sec",
    "backtrack_count",
    "help_requests",
    "feature_usage_count",
    "sensory_load_proxy"
]

def train_pattern_recognition_model(csv_file="neuroease_synthetic_interactions_10000.csv"):
    df = pd.read_csv(csv_file)

    X = df[FEATURES]
    y = df["pattern"]

    # Map pattern names to UI adaptations for fast lookup
    pattern_to_adaptation = (
        df.groupby("pattern")["ui_adaptation"].first().to_dict()
    )

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = RandomForestClassifier(n_estimators=100, random_state=42)
    model.fit(X_train, y_train)

    # Evaluate
    y_pred = model.predict(X_test)
    acc = accuracy_score(y_test, y_pred)

    print("=" * 60)
    print(f"Model Training Complete. Accuracy: {acc * 100:.2f}%\n")
    print("Classification Report:")
    print(classification_report(y_test, y_pred))
    print("=" * 60)

    # Save artifact containing model and adaptation mapping
    artifact = {
        "model": model,
        "features": FEATURES,
        "pattern_to_adaptation": pattern_to_adaptation,
    }
    joblib.dump(artifact, "neuroease_pattern_model.pkl")
    print("Saved trained model to 'neuroease_pattern_model.pkl'")


def predict_ui_adaptation(event_data, model_path="neuroease_pattern_model.pkl"):
    """
    Receives interaction features from backend and returns predicted pattern & UI adaptation JSON.
    """
    artifact = joblib.load(model_path)
    model = artifact["model"]
    features = artifact["features"]
    mapping = artifact["pattern_to_adaptation"]

    # Convert dictionary input to DataFrame matching feature order
    input_df = pd.DataFrame([event_data])[features]

    predicted_pattern = model.predict(input_df)[0]
    probabilities = model.predict_proba(input_df)[0]
    confidence = float(max(probabilities))
    recommended_ui = mapping.get(predicted_pattern, "default_ui")

    return {
        "status": "success",
        "predicted_pattern": predicted_pattern,
        "recommended_ui_adaptation": recommended_ui,
        "confidence": round(confidence, 4),
    }


if __name__ == "__main__":
    train_pattern_recognition_model()

    # Quick test inference
    sample_event = {
        "misclick_count": 6,
        "task_completion_time_sec": 35.5,
        "backtrack_count": 1,
        "help_requests": 0,
        "feature_usage_count": 4,
        "sensory_load_proxy": 0.2,
    }

    result = predict_ui_adaptation(sample_event)
    print("\nSample Backend Inference Output:")
    print(result)