import json
import numpy as np
from sklearn.metrics import accuracy_score
from sklearn.model_selection import train_test_split

# JSON representation of the model
model_json = """
{
    "model": "DecisionTreeClassifier",
    "parameters": {
        "criterion": "gini",
        "splitter": "best",
        "max_depth": 2
    },
    "tree_structure": {
        "node": "root",
        "feature": "feature_1",
        "threshold": 0.5,
        "left": {
            "node": "leaf",
            "value": "class_0"
        },
        "right": {
            "node": "leaf",
            "value": "class_1"
        }
    }
}
"""

# Load model from JSON
model = json.loads(model_json)

# Generate a mock dataset
np.random.seed(42)
X = np.random.rand(100, 2)  # 100 samples, 2 features
y = np.where(X[:, 0] > 0.5, 1, 0)  # Class 1 if feature_1 > 0.5, else Class 0

# Split the dataset into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# Define the simple decision tree classifier based on the JSON model structure
class SimpleDecisionTreeClassifier:
    def __init__(self, tree_structure):
        self.tree_structure = tree_structure
    
    def predict(self, X):
        predictions = []
        for sample in X:
            predictions.append(self._predict_sample(sample))
        return np.array(predictions)
    
    def _predict_sample(self, sample):
        node = self.tree_structure
        while node["node"] != "leaf":
            feature = int(node["feature"].split("_")[1]) - 1
            if sample[feature] <= node["threshold"]:
                node = node["left"]
            else:
                node = node["right"]
        return int(node["value"].split("_")[1])

# Instantiate the model and make predictions
simple_tree = SimpleDecisionTreeClassifier(model["tree_structure"])
y_pred = simple_tree.predict(X_test)

# Evaluate the model performance
accuracy = accuracy_score(y_test, y_pred)
print(f"Accuracy: {accuracy * 100:.2f}%")
