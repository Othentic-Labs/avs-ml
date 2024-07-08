const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

async function loadModel() {
    // Load the model architecture from the JSON file
    const modelJson = JSON.parse(fs.readFileSync('model_architecture.json'));
    const model = await tf.models.modelFromJSON(modelJson);

    // Load the model weights from the JSON file
    const weightsJson = JSON.parse(fs.readFileSync('model_weights.json'));
    const weightData = weightsJson.map(w => tf.tensor(w.tensor, w.shape, w.dtype));
    model.setWeights(weightData);

    console.log('Model loaded');
    
    return model;
}

loadModel().then(async (model) => {
    // Test the model with several inputs
    const inputs = tf.tensor2d([-1, -0.5, 0, 0.5, 1], [5, 1]);  // Create a 2D tensor with shape [5, 1]
    const predictions = model.predict(inputs);

    // Actual squared values
    const actuals = inputs.square();

    // Calculate RMSE
    const squaredDifferences = tf.sub(predictions, actuals).square();
    const mse = tf.mean(squaredDifferences);
    const rmse = tf.sqrt(mse);

    // Print accuracy
    const rmseValue = await rmse.data();
    console.log(`RMSE: ${rmseValue[0]}`);
});
