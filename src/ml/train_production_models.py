import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier, AdaBoostClassifier
from sklearn.neural_network import MLPClassifier
from sklearn.svm import SVC
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split, cross_val_score, StratifiedKFold
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, roc_auc_score
import joblib
import os
import logging
from datetime import datetime

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

try:
    import xgboost as xgb
    XGBOOST_AVAILABLE = True
except ImportError:
    XGBOOST_AVAILABLE = False
    logger.warning("XGBoost not available")

try:
    import lightgbm as lgb
    LIGHTGBM_AVAILABLE = True
except ImportError:
    LIGHTGBM_AVAILABLE = False
    logger.warning("LightGBM not available")

try:
    import catboost as cb
    CATBOOST_AVAILABLE = True
except ImportError:
    CATBOOST_AVAILABLE = False
    logger.warning("CatBoost not available")

try:
    import shap
    SHAP_AVAILABLE = True
except ImportError:
    SHAP_AVAILABLE = False
    logger.warning("SHAP not available")

class ProductionMLTrainer:
    def __init__(self, min_samples=10000):
        self.min_samples = min_samples
        self.models = {}
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.feature_names = None
        self.explainer = None
    
    def load_data(self, features_path):
        logger.info(f"Loading data from {features_path}...")
        df = pd.read_csv(features_path)
        
        if len(df) < self.min_samples:
            logger.warning(f"Only {len(df)} samples available (minimum: {self.min_samples})")
        
        logger.info(f"Loaded {len(df)} samples")
        return df
    
    def prepare_features(self, df):
        logger.info("Preparing features...")
        
        feature_cols = [col for col in df.columns if col not in 
                       ['accident_id', 'severity', 'is_hotspot', 'cluster_id']]
        
        X = df[feature_cols].values
        
        if 'is_hotspot' in df.columns:
            y = df['is_hotspot'].values
        else:
            logger.error("No 'is_hotspot' column found")
            return None, None, None
        
        self.feature_names = feature_cols
        logger.info(f"Features: {len(feature_cols)}")
        logger.info(f"Samples: {len(X)}")
        logger.info(f"Hotspots: {y.sum()} ({y.sum()/len(y)*100:.1f}%)")
        
        return X, y, feature_cols
    
    def create_models(self):
        logger.info("Creating models...")
        
        # 1. Random Forest
        self.models['random_forest'] = RandomForestClassifier(
            n_estimators=300,
            max_depth=20,
            min_samples_split=20,
            min_samples_leaf=10,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        
        # 2. Gradient Boosting
        self.models['gradient_boosting'] = GradientBoostingClassifier(
            n_estimators=200,
            learning_rate=0.05,
            max_depth=10,
            min_samples_split=20,
            random_state=42
        )
        
        # 3. XGBoost
        if XGBOOST_AVAILABLE:
            self.models['xgboost'] = xgb.XGBClassifier(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=10,
                scale_pos_weight=1,
                random_state=42,
                use_label_encoder=False,
                eval_metric='logloss'
            )
        
        # 4. LightGBM
        if LIGHTGBM_AVAILABLE:
            self.models['lightgbm'] = lgb.LGBMClassifier(
                n_estimators=200,
                learning_rate=0.05,
                max_depth=10,
                class_weight='balanced',
                random_state=42,
                verbose=-1
            )
        
        # 5. CatBoost (NEW - Often best for tabular data)
        if CATBOOST_AVAILABLE:
            self.models['catboost'] = cb.CatBoostClassifier(
                iterations=200,
                learning_rate=0.05,
                depth=10,
                auto_class_weights='Balanced',
                random_state=42,
                verbose=False
            )
        
        # 6. Neural Network (NEW - Good for complex patterns)
        self.models['neural_network'] = MLPClassifier(
            hidden_layer_sizes=(128, 64, 32),
            activation='relu',
            solver='adam',
            alpha=0.001,
            batch_size=256,
            learning_rate='adaptive',
            max_iter=300,
            random_state=42,
            early_stopping=True,
            validation_fraction=0.1
        )
        
        # 7. AdaBoost (NEW - Ensemble method)
        self.models['adaboost'] = AdaBoostClassifier(
            n_estimators=100,
            learning_rate=0.5,
            random_state=42
        )
        
        # 8. Logistic Regression (NEW - Fast baseline)
        self.models['logistic_regression'] = LogisticRegression(
            max_iter=1000,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        
        # 9. SVM (NEW - Good for classification, but slower)
        self.models['svm'] = SVC(
            kernel='rbf',
            C=1.0,
            gamma='scale',
            class_weight='balanced',
            probability=True,
            random_state=42
        )
        
        logger.info(f"Created {len(self.models)} models")
    
    def train_models(self, X, y):
        logger.info("Training models...")
        
        X_scaled = self.scaler.fit_transform(X)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y, test_size=0.2, random_state=42, stratify=y
        )
        
        results = {}
        
        for name, model in self.models.items():
            logger.info(f"\nTraining {name}...")
            
            try:
                model.fit(X_train, y_train)
                
                train_pred = model.predict(X_train)
                test_pred = model.predict(X_test)
                
                train_acc = accuracy_score(y_train, train_pred)
                test_acc = accuracy_score(y_test, test_pred)
                precision = precision_score(y_test, test_pred, zero_division=0)
                recall = recall_score(y_test, test_pred, zero_division=0)
                f1 = f1_score(y_test, test_pred, zero_division=0)
                
                # Calculate ROC-AUC if model supports predict_proba
                try:
                    test_proba = model.predict_proba(X_test)[:, 1]
                    roc_auc = roc_auc_score(y_test, test_proba)
                except:
                    roc_auc = 0.0
                
                skf = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
                cv_scores = cross_val_score(model, X_train, y_train, cv=skf, scoring='accuracy')
                
                results[name] = {
                    'train_accuracy': train_acc,
                    'test_accuracy': test_acc,
                    'precision': precision,
                    'recall': recall,
                    'f1_score': f1,
                    'roc_auc': roc_auc,
                    'cv_mean': cv_scores.mean(),
                    'cv_std': cv_scores.std()
                }
                
                logger.info(f"  Train Accuracy: {train_acc:.4f}")
                logger.info(f"  Test Accuracy:  {test_acc:.4f}")
                logger.info(f"  Precision:      {precision:.4f}")
                logger.info(f"  Recall:         {recall:.4f}")
                logger.info(f"  F1-Score:       {f1:.4f}")
                logger.info(f"  ROC-AUC:        {roc_auc:.4f}")
                logger.info(f"  CV Score:       {cv_scores.mean():.4f} (+/- {cv_scores.std():.4f})")
                
            except Exception as e:
                logger.error(f"  Failed to train {name}: {e}")
                continue
        
        best_model_name = max(results, key=lambda x: results[x]['test_accuracy'])
        logger.info(f"\n🏆 Best model: {best_model_name} (Test Acc: {results[best_model_name]['test_accuracy']:.4f})")
        
        if SHAP_AVAILABLE:
            try:
                logger.info("Creating SHAP explainer...")
                self.explainer = shap.TreeExplainer(self.models[best_model_name])
                logger.info("SHAP explainer created")
            except Exception as e:
                logger.warning(f"Could not create SHAP explainer: {e}")
        
        return results, X_test, y_test
    
    def save_models(self, output_dir='models/production'):
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        
        model_data = {
            'models': self.models,
            'scaler': self.scaler,
            'feature_names': self.feature_names,
            'explainer': self.explainer,
            'timestamp': timestamp
        }
        
        model_path = os.path.join(output_dir, 'ensemble_model.pkl')
        joblib.dump(model_data, model_path)
        logger.info(f"Saved ensemble model to {model_path}")
        
        backup_path = os.path.join(output_dir, f'ensemble_model_{timestamp}.pkl')
        joblib.dump(model_data, backup_path)
        logger.info(f"Saved backup to {backup_path}")
        
        return model_path

class SeverityPredictor:
    def __init__(self):
        self.model = RandomForestClassifier(
            n_estimators=200,
            max_depth=15,
            class_weight='balanced',
            random_state=42,
            n_jobs=-1
        )
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
    
    def train(self, X, y_severity):
        logger.info("\nTraining Severity Predictor...")
        
        y_encoded = self.label_encoder.fit_transform(y_severity)
        
        X_scaled = self.scaler.fit_transform(X)
        
        X_train, X_test, y_train, y_test = train_test_split(
            X_scaled, y_encoded, test_size=0.2, random_state=42, stratify=y_encoded
        )
        
        self.model.fit(X_train, y_train)
        
        train_acc = self.model.score(X_train, y_train)
        test_acc = self.model.score(X_test, y_test)
        
        logger.info(f"  Train Accuracy: {train_acc:.4f}")
        logger.info(f"  Test Accuracy:  {test_acc:.4f}")
        
        return train_acc, test_acc
    
    def save_model(self, output_dir='models/production'):
        os.makedirs(output_dir, exist_ok=True)
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'label_encoder': self.label_encoder
        }
        
        model_path = os.path.join(output_dir, 'severity_model.pkl')
        joblib.dump(model_data, model_path)
        logger.info(f"Saved severity model to {model_path}")
        
        return model_path

if __name__ == "__main__":
    logger.info("="*60)
    logger.info("PRODUCTION ML MODEL TRAINING")
    logger.info("="*60)
    
    features_path = 'data/processed/indian_features.csv'
    accidents_path = 'data/processed/indian_accidents.csv'
    
    if not os.path.exists(features_path):
        logger.error(f"Features file not found: {features_path}")
        logger.info("Run: python src/data_processing/process_indian_data.py")
        exit(1)
    
    trainer = ProductionMLTrainer(min_samples=10000)
    
    df = trainer.load_data(features_path)
    
    X, y, feature_cols = trainer.prepare_features(df)
    
    if X is None:
        logger.error("Failed to prepare features")
        exit(1)
    
    trainer.create_models()
    
    results, X_test, y_test = trainer.train_models(X, y)
    
    model_path = trainer.save_models()
    
    if os.path.exists(accidents_path):
        accidents_df = pd.read_csv(accidents_path)
        if 'severity' in accidents_df.columns:
            severity_predictor = SeverityPredictor()
            severity_predictor.train(X, accidents_df['severity'].values)
            severity_predictor.save_model()
    
    logger.info("\n" + "="*60)
    logger.info("TRAINING COMPLETE")
    logger.info("="*60)
    logger.info(f"\nModel saved to: {model_path}")
    logger.info(f"Total samples: {len(X)}")
    logger.info(f"Features: {len(feature_cols)}")
    logger.info("\n📊 Model Performance Summary:")
    logger.info("-" * 60)
    
    # Sort by test accuracy
    sorted_results = sorted(results.items(), key=lambda x: x[1]['test_accuracy'], reverse=True)
    
    for name, metrics in sorted_results:
        logger.info(f"\n{name}:")
        logger.info(f"  Test Accuracy: {metrics['test_accuracy']:.4f}")
        logger.info(f"  Precision:     {metrics['precision']:.4f}")
        logger.info(f"  Recall:        {metrics['recall']:.4f}")
        logger.info(f"  F1-Score:      {metrics['f1_score']:.4f}")
        logger.info(f"  ROC-AUC:       {metrics['roc_auc']:.4f}")
