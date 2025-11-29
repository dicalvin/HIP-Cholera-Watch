import joblib
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
RF_MODEL_PATH = os.path.join(BASE_DIR, 'random_forest_model.pkl')

try:
    model = joblib.load(RF_MODEL_PATH)
    print(f"Model type: {type(model)}")
    print(f"Expected features: {getattr(model, 'n_features_in_', 'unknown')}")
    
    # Try to see feature names if available
    if hasattr(model, 'feature_names_in_'):
        print(f"Feature names: {model.feature_names_in_}")
    
    print("Model loaded successfully!")
except Exception as e:
    print(f"Error: {e}")
    import traceback
    traceback.print_exc()

