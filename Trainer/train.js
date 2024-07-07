const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

// Generate training data for f(x) = x^2
const X_train = tf.linspace(-1, 1, 100).reshape([100, 1]);
const y_train = X_train.square();

// Define a simple model with 2 layers (5 neurons + 10 neurons)
const model = tf.sequential();
model.add(tf.layers.dense({units: 5, activation: 'relu', inputShape: [1]}));
model.add(tf.layers.dense({units: 10, activation: 'relu'}));
model.add(tf.layers.dense({units: 1, activation: 'linear'}));

// Compile the model with an optimizer
model.compile({optimizer: 'adam', loss: 'meanSquaredError'});

// Train the model
async function trainModel() {
    await model.fit(X_train, y_train, {
        epochs: 500,
        verbose: 0
    });
    console.log('Model trained');

    // Serialize the model architecture
    const modelJson = model.toJSON();
    fs.writeFileSync('model_architecture.json', JSON.stringify(modelJson));

    // Serialize the model weights
    const weights = model.getWeights();
    const weightData = await Promise.all(weights.map(async (w) => {
        const tensor = await w.array();
        return {
            tensor,
            shape: w.shape,
            dtype: w.dtype
        };
    }));

    // Save the weights to a JSON file
    fs.writeFileSync('model_weights.json', JSON.stringify(weightData));
    console.log('Model architecture and weights saved');
}

trainModel();
