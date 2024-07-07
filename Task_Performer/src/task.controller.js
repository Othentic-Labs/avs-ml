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

// Listen for the event, this triggers the whole
contract.events.ModelSubmitted({
    fromBlock: 'latest'
})
.on('data', async (event) => {
    const pinataHashOwner = event.returnValues.pinataHashOwner;
    const pinataHashSubmitter = event.returnValues.pinataHashSubmitter;
    const pinataHashArchitecture = event.returnValues.pinataHashArchitechture;

    if (pinataHashOwner && pinataHashSubmitter && pinataHashArchitecture) {
        try {
            // Query Pinata for the datas
            const pinataDataOwner = await dalService.queryPinata(pinataHashOwner);
            const pinataDataSubmitter = await dalService.queryPinata(pinataHashSubmitter);
            const pinataDataArchitecture = await dalService.queryPinata(pinataHashArchitecture);
            // Process the data (e.g., execute the model)
            await processModelData({ pinataHashOwner,pinataDataOwner,pinataHashSubmitter, pinataDataSubmitter, pinataHashArchitecture, pinataDataArchitecture} );
        } catch (error) {
            console.error('Error processing model:', error);
        }
    }
})
.on('error', console.error);


async function processModelData({pinataHashOwner,pinataDataOwner,pinataHashSubmitter, pinataDataSubmitter, pinataHashArchitecture, pinataDataArchitecture}) {
    // Implement your model processing logic here

    console.log('Processing model data from owner and submitter', pinataDataOwner,pinataDataSubmitter );
    // The data input as parameters are the data to be passed to our model and get a RSQuared result.
    const rSquaredSubmitter = oracleService.rSquared(pinataDataSubmitter, pinataDataArchitecture, {})
    // Now we need to send the information to the Attestator.
    // Ideally we send the CID of owner and Submitter and the result of our experiment,
    // so they can test against it
    const proofOfTask = await dalService.publishJSONToIpfs(rSquaredSubmitter);// result of performer computation
    const data = {pinataHashOwner, pinataHashSubmitter, pinataHashArchitecture} // data of
    // send the RPC task to attestators
    await dalService.sendTask(proofOfTask, data,0);

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
        // how to we propagate this ?
        return res.status(200).send(new CustomResponse({proofOfTask: proofOfTask, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error);
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
});

module.exports = router;
