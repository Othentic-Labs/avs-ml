const tf = require('@tensorflow/tfjs-node');
const fs = require('fs');

async function loadAndTestModel() {
    // Load the model
    const model = await tf.loadLayersModel('file://./model/model.json');
    console.log('Model loaded');
    
    // Test the model with several inputs
    const inputs = tf.tensor2d([-1, -0.5, 0, 0.5, 1], [5, 1]);
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
}