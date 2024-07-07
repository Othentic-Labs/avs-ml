"use strict";
const { Router } = require("express");
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");
const Web3 = require('web3');
const axios = require('axios');

const router = Router();

// Initialize Web3 and connect to your Ethereum network
const web3 = new Web3('YOUR_ETHEREUM_NODE_URL');

// ABI and address of your smart contract
const contractABI = [/* Your contract ABI here */];
const contractAddress = 'YOUR_CONTRACT_ADDRESS';

const contract = new web3.eth.Contract(contractABI, contractAddress);

// Listen for the event
contract.events.ModelSubmitted({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    const submissionFee = event.returnValues.submissionFee;
    const pinataHash = event.returnValues.pinataHash;

    if (submissionFee > 0) {
        try {
            // Query Pinata for the data
            const pinataData = await queryPinata(pinataHash);
            // Process the data (e.g., execute the model)
            await processModelData(pinataData);
        } catch (error) {
            console.error('Error processing model:', error);
        }
    }
})
.on('error', console.error);

async function queryPinata(hash) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
}

async function processModelData(data) {
    // Implement your model processing logic here
    console.log('Processing model data:', data);
}

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        const taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const coefficients = req.body.coefficients;
        const rSquared = oracleService.rSquared(coefficients);
        const proofOfTask = await dalService.publishJSONToIpfs(rSquared);
        const data = coefficients;

        await dalService.sendTask(proofOfTask, data, taskDefinitionId);

        return res.status(200).send(new CustomResponse({proofOfTask: proofOfTask, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error);
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
});

module.exports = router;