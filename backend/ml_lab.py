import pandas as pd
import numpy as np
import os
from sklearn.model_selection import train_test_split, cross_val_score, learning_curve
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.pipeline import make_pipeline
from sklearn.linear_model import LogisticRegression, LinearRegression, Perceptron
from sklearn.tree import DecisionTreeClassifier, _tree
from sklearn.naive_bayes import MultinomialNB
from sklearn.neighbors import KNeighborsClassifier
from sklearn.svm import SVC
from sklearn.neural_network import MLPClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, confusion_matrix, roc_curve, auc, precision_recall_curve

ML_LAB_CACHE = {}

def load_datasets_individually():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    data_dir = os.path.join(os.path.dirname(base_dir), "data", "training")
    datasets = {}
    
    # 1. SMS
    try:
        sms = pd.read_csv(os.path.join(data_dir, "sms_spam_uci.csv"), sep='\t', names=['label', 'text'], encoding='latin-1', on_bad_lines='skip').dropna()
        sms['label'] = sms['label'].map({'ham': 0, 'spam': 1}).astype(int)
        datasets['SMS'] = sms
    except Exception as e: 
        print(f"Error loading SMS: {e}")
        datasets['SMS'] = pd.DataFrame(columns=['label', 'text'])

    # 2. Validation
    try:
        val = pd.read_csv(os.path.join(data_dir, "phishing_validation.csv"), encoding='utf-8', on_bad_lines='skip')
        val = val.rename(columns={'Email Text': 'text', 'Email Type': 'label'})
        val['label'] = val['label'].str.strip().map({'Safe Email': 0, 'Phishing Email': 1}).astype(int)
        datasets['Validation'] = val[['label', 'text']].dropna()
    except Exception as e: 
        print(f"Error loading Validation: {e}")
        datasets['Validation'] = pd.DataFrame(columns=['label', 'text'])

    # 3. NLP (Handle both CSV and XLSX)
    try:
        nlp_csv = os.path.join(data_dir, "phishing_nlp.csv")
        nlp_xlsx = os.path.join(data_dir, "phishing_nlp.xlsx")
        
        if os.path.exists(nlp_csv):
            multi = pd.read_csv(nlp_csv, encoding='utf-8', on_bad_lines='skip', header=None)
        elif os.path.exists(nlp_xlsx):
            multi = pd.read_excel(nlp_xlsx, header=None)
        else:
            raise FileNotFoundError("Neither phishing_nlp.csv nor phishing_nlp.xlsx found.")
            
        def parse_row(row):
            text_val = str(row.iloc[0]).strip()
            malicious = ['Phishing', 'Malware', 'Scareware', 'Baiting', 'Pretexting']
            safe = ['NOT-Malicious']
            for lbl in malicious:
                if text_val.endswith(lbl): return pd.Series([1, text_val[:-len(lbl)].strip()])
            for lbl in safe:
                if text_val.endswith(lbl): return pd.Series([0, text_val[:-len(lbl)].strip()])
            return pd.Series([0, text_val])
            
        multi[['label', 'text']] = multi.apply(parse_row, axis=1)
        datasets['NLP'] = multi[['label', 'text']].dropna()
    except Exception as e: 
        print(f"Error loading NLP: {e}")
        datasets['NLP'] = pd.DataFrame(columns=['label', 'text'])
    
    return datasets

def get_tree_structure(tree_model, feature_names):
    tree_ = tree_model.tree_
    def recurse(node):
        if tree_.feature[node] != _tree.TREE_UNDEFINED:
            name = feature_names[tree_.feature[node]]
            threshold = tree_.threshold[node]
            return {
                "name": f"{name} <= {threshold:.3f}",
                "attributes": {"type": "split", "feature": name, "threshold": float(threshold), "samples": int(tree_.n_node_samples[node]), "impurity": float(tree_.impurity[node])},
                "children": [recurse(tree_.children_left[node]), recurse(tree_.children_right[node])]
            }
        else:
            val = tree_.value[node][0]
            return {
                "name": f"Predict: {'Spam' if val[0] < val[1] else 'Safe'}",
                "attributes": {"type": "leaf", "samples": int(tree_.n_node_samples[node]), "impurity": float(tree_.impurity[node]), "class_counts": [int(val[0]), int(val[1])]}
            }
    return recurse(0)

def evaluate_model(model, X_train, y_train, X_test, y_test):
    def get_metrics(X, y):
        preds = model.predict(X)
        return {
            "accuracy": float(accuracy_score(y, preds)), "precision": float(precision_score(y, preds, zero_division=0)),
            "recall": float(recall_score(y, preds, zero_division=0)), "f1": float(f1_score(y, preds, zero_division=0))
        }
    test_preds = model.predict(X_test)
    cm = confusion_matrix(y_test, test_preds, labels=[0, 1]).tolist()
    return {"train": get_metrics(X_train, y_train), "test": get_metrics(X_test, y_test), "confusion_matrix": cm}

def train_and_cache_models():
    datasets = load_datasets_individually()
    combined = pd.concat(datasets.values(), ignore_index=True).dropna()
    combined = combined.drop_duplicates(subset=['text'])

    X_text = combined['text'].astype(str)
    y = combined['label'].astype(int)
    
    X_train_text, X_test_text, y_train, y_test = train_test_split(X_text, y, test_size=0.2, random_state=42, stratify=y)
    
    vectorizer = TfidfVectorizer(max_features=2000, stop_words='english')
    X_train = vectorizer.fit_transform(X_train_text)
    X_test = vectorizer.transform(X_test_text)
    feature_names = vectorizer.get_feature_names_out()
    
    results = {"dataset_info": {"total": len(combined), "train": X_train.shape[0], "test": X_test.shape[0], "features": X_train.shape[1]}}
    
    lin_reg = LinearRegression().fit(X_train, y_train)
    results['linear'] = {"predictions": lin_reg.predict(X_test[:5]).tolist(), "actuals": y_test[:5].tolist(), "mse": float(np.mean((lin_reg.predict(X_test) - y_test) ** 2))}

    log_reg = LogisticRegression(max_iter=1000, random_state=42).fit(X_train, y_train)
    results['logistic'] = evaluate_model(log_reg, X_train, y_train, X_test, y_test)
    
    pipeline = make_pipeline(TfidfVectorizer(max_features=2000, stop_words='english'), LogisticRegression(max_iter=1000, random_state=42))
    results['logistic']['kfold'] = cross_val_score(pipeline, X_text, y, cv=5, scoring='f1').tolist()
    
    probs = log_reg.predict_proba(X_test)[:, 1]
    results['logistic']['test_probs'] = probs.tolist()
    results['logistic']['test_actuals'] = y_test.tolist()
    
    # --- FIXED CURVES (ROC & PR) ---
    fpr, tpr, _ = roc_curve(y_test, probs)
    precision, recall, _ = precision_recall_curve(y_test, probs)
    
    results['curves'] = {
        "roc": {"fpr": fpr.tolist(), "tpr": tpr.tolist(), "auc": float(auc(fpr, tpr))},
        "pr": {"precision": precision.tolist(), "recall": recall.tolist()}
    }

    models = {
        'knn': KNeighborsClassifier(n_neighbors=5), 'bayes': MultinomialNB(),
        'svm': SVC(kernel='rbf', probability=True, random_state=42), 'perceptron': Perceptron(max_iter=1000, random_state=42),
        'ensemble': RandomForestClassifier(n_estimators=100, max_depth=8, random_state=42)
    }
    for key, model in models.items():
        model.fit(X_train, y_train)
        results[key] = evaluate_model(model, X_train, y_train, X_test, y_test)
        ML_LAB_CACHE[key] = model

    mlp = MLPClassifier(hidden_layer_sizes=(64, 32), max_iter=200, random_state=42).fit(X_train, y_train)
    results['mlp'] = evaluate_model(mlp, X_train, y_train, X_test, y_test)
    results['mlp']['loss_curve'] = mlp.loss_curve_
    ML_LAB_CACHE['mlp'] = mlp

    tree = DecisionTreeClassifier(max_depth=6, random_state=42).fit(X_train, y_train)
    results['tree'] = evaluate_model(tree, X_train, y_train, X_test, y_test)
    results['tree']['json'] = get_tree_structure(tree, feature_names)
    ML_LAB_CACHE['tree'] = tree

    svd = TruncatedSVD(n_components=2).fit_transform(X_train)
    results['pca'] = [{"x": float(pt[0]), "y": float(pt[1]), "label": int(lbl)} for pt, lbl in zip(svd, y_train)]

    train_sizes, train_scores, test_scores = learning_curve(LogisticRegression(max_iter=1000), X_train, y_train, cv=3, train_sizes=np.linspace(0.1, 1.0, 5))
    results['pac'] = {"sizes": train_sizes.tolist(), "train": train_scores.mean(axis=1).tolist(), "test": test_scores.mean(axis=1).tolist()}

    ML_LAB_CACHE['vectorizer'] = vectorizer
    ML_LAB_CACHE['results'] = results
    ML_LAB_CACHE['logistic'] = log_reg
    ML_LAB_CACHE['lin_reg'] = lin_reg
    
    return results

def analyze_datasets():
    datasets = load_datasets_individually()
    stats = {}
    for name, df in datasets.items():
        stats[name] = {"total": len(df), "spam": int(df['label'].sum()), "safe": int(len(df) - df['label'].sum())}
    
    combined = pd.concat(datasets.values(), ignore_index=True)
    stats['Combined'] = {
        "total": len(combined), "spam": int(combined['label'].sum()), "safe": int(len(combined) - combined['label'].sum()),
        "duplicates": int(combined.duplicated(subset=['text']).sum()), "imbalance_ratio": float(combined['label'].mean())
    }

    def evaluate_cross(train_names, test_name):
        train_df = pd.concat([datasets[n] for n in train_names], ignore_index=True)
        test_df = datasets[test_name]
        
        if len(train_df) == 0 or len(test_df) == 0: 
            return {"error": "Dataset empty"}
            
        pipeline = make_pipeline(TfidfVectorizer(max_features=1000, stop_words='english'), LogisticRegression(max_iter=1000))
        pipeline.fit(train_df['text'].astype(str), train_df['label'].astype(int))
        
        preds = pipeline.predict(test_df['text'].astype(str))
        return {
            "train": " + ".join(train_names), "test": test_name,
            "accuracy": float(accuracy_score(test_df['label'].astype(int), preds)),
            "f1": float(f1_score(test_df['label'].astype(int), preds, zero_division=0))
        }

    experiments = [
        evaluate_cross(['SMS', 'Validation'], 'NLP'),
        evaluate_cross(['SMS', 'NLP'], 'Validation'),
        evaluate_cross(['Validation', 'NLP'], 'SMS')
    ]

    return {"stats": stats, "experiments": experiments}

def get_ml_lab_results():
    return ML_LAB_CACHE.get('results') or train_and_cache_models()

def predict_message(message: str, algorithm: str):
    if not ML_LAB_CACHE.get('vectorizer'): train_and_cache_models()
    vec, model = ML_LAB_CACHE['vectorizer'], ML_LAB_CACHE.get(algorithm)
    if not model: return {"error": "Model not found"}
        
    X_vec = vec.transform([message])
    if algorithm == 'linear': return {"prediction": float(model.predict(X_vec)[0]), "is_probability": False}
    
    pred = model.predict(X_vec)[0]
    prob = model.predict_proba(X_vec)[0][1] if hasattr(model, "predict_proba") else float(pred)
    response = {"prediction": "Spam" if pred == 1 else "Safe", "probability": float(prob), "is_probability": True}
    
    feature_names, non_zero_indices = vec.get_feature_names_out(), X_vec.nonzero()[1]

    if algorithm == 'logistic':
        coefs = model.coef_[0]
        contributions = [{"word": feature_names[idx], "impact": float(X_vec[0, idx] * coefs[idx])} for idx in non_zero_indices]
        contributions.sort(key=lambda x: abs(x['impact']), reverse=True)
        response['contributions'] = contributions[:5]

    if algorithm == 'tree':
        tree, node_indicator, leaf_id = model.tree_, model.decision_path(X_vec), model.apply(X_vec)
        path = []
        node_index = node_indicator.indices[node_indicator.indptr[0]:node_indicator.indptr[1]]
        for node_id in node_index:
            if leaf_id[0] == node_id: path.append({"node": int(node_id), "rule": "Leaf Node (Prediction)"})
            else: path.append({"node": int(node_id), "rule": f"{feature_names[tree.feature[node_id]]} <= {tree.threshold[node_id]:.3f}"})
        response['decision_path'] = path

    if algorithm in ['ensemble', 'mlp', 'svm', 'knn', 'bayes', 'perceptron'] and hasattr(model, "predict_proba"):
        contributions = []
        for idx in non_zero_indices:
            X_temp = X_vec.copy()
            X_temp[0, idx] = 0 
            contributions.append({"word": feature_names[idx], "impact": float(prob - model.predict_proba(X_temp)[0][1])})
        contributions.sort(key=lambda x: abs(x['impact']), reverse=True)
        response['contributions'] = contributions[:5]

    return response