const tf = require('@tensorflow/tfjs-node');
const axios = require('axios');

// Function to load the model and test it
async function loadAndTestModel(architectureHash, weightsHash) {
    // Load model architecture
    const modelJSON = await getJSONFromIPFS(architectureHash);
    const model = await tf.models.modelFromJSON(modelJSON);

    // Load model weights
    const weightsData = await getBufferFromIPFS(weightsHash);
    const weightSpecs = modelJSON.weightsManifest[0].weights;
    const weightData = new ArrayBuffer(weightsData.length);
    new Uint8Array(weightData).set(new Uint8Array(weightsData));
    const loaded = await tf.io.loadWeights(weightSpecs, '', weightData);
    model.loadWeights(loaded);

    console.log('Model loaded');

    // Test the model with several inputs
    const inputs = tf.tensor2d([-1, -0.5, 0, 0.5, 1], [5, 1]);
    const predictions = model.predict(inputs);
    const actuals = inputs.square();

    // Calculate custom performance score
    const squaredDifferences = tf.sub(predictions, actuals).square();
    const meanSquaredError = tf.mean(squaredDifferences);
    const maxPossibleError = tf.scalar(1);
    const performanceScore = tf.sub(maxPossibleError, meanSquaredError).div(maxPossibleError).mul(tf.scalar(100));

    const score = await performanceScore.data();
    console.log(`Performance Score: ${score[0].toFixed(2)}`);

    tf.dispose([inputs, predictions, actuals, squaredDifferences, meanSquaredError, maxPossibleError, performanceScore]);
}

// Helper function to get JSON from IPFS
async function getJSONFromIPFS(hash) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
}

// Helper function to get buffer from IPFS
async function getBufferFromIPFS(hash) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`, {
        responseType: 'arraybuffer'
    });
    return response.data;
}
