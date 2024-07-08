const tf = require('@tensorflow/tfjs-node');
const pinataSDK = require('@pinata/sdk');
const axios = require('axios');

// Initialize Pinata client
const pinata = new pinataSDK({ pinataApiKey: 'YOUR_API_KEY', pinataSecretApiKey: 'YOUR_SECRET_API_KEY' });

// Function to load architecture, train model, and save weights
async function trainAndSaveModel(architectureHash) {
    // Load model architecture
    const modelJSON = await getJSONFromIPFS(architectureHash);
    const model = await tf.models.modelFromJSON(modelJSON);

    // Generate training data for f(x) = x^2
    const X_train = tf.linspace(-1, 1, 100).reshape([100, 1]);
    const y_train = X_train.square();

    // Compile the model with an optimizer
    model.compile({optimizer: 'adam', loss: 'meanSquaredError'});

    // Train the model
    await model.fit(X_train, y_train, {
        epochs: 500,
        verbose: 0
    });
    console.log('Model trained');

    // Save model weights
    const weights = await model.getWeights();
    const weightsData = await tf.io.encodeWeights(weights);
    const weightsHash = await pinBufferToIPFS(weightsData.data, 'model_weights.buf');
    console.log('Model weights saved to IPFS. Hash:', weightsHash);

    return weightsHash;
}

// Helper function to get JSON from IPFS
async function getJSONFromIPFS(hash) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
}


// Helper function to pin buffer to IPFS
async function pinBufferToIPFS(buffer, name) {
    const result = await pinata.pinFileToIPFS(buffer, {
        pinataMetadata: { name }
    });
    return result.IpfsHash;
}