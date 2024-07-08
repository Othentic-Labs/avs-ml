const tf = require('@tensorflow/tfjs-node');
const pinataSDK = require('@pinata/sdk');

// Initialize Pinata client
const pinata = new pinataSDK({ pinataApiKey: 'YOUR_API_KEY', pinataSecretApiKey: 'YOUR_SECRET_API_KEY' });

// Function to create and save the model architecture
async function createAndSaveArchitecture() {
    const model = tf.sequential();
    model.add(tf.layers.dense({units: 5, activation: 'relu', inputShape: [1]}));
    model.add(tf.layers.dense({units: 10, activation: 'relu'}));
    model.add(tf.layers.dense({units: 1, activation: 'linear'}));

    const modelJSON = model.toJSON();
    const architectureHash = await pinJSONToIPFS(modelJSON, 'model_architecture.json');
    console.log('Model architecture saved to IPFS. Hash:', architectureHash);
    return architectureHash;
}

// Helper function to pin JSON to IPFS
async function pinJSONToIPFS(json, name) {
    const result = await pinata.pinJSONToIPFS(json, {
        pinataMetadata: { name }
    });
    return result.IpfsHash;
}