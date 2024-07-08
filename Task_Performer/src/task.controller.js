"use strict";
const { Router } = require("express");
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");
const axios = require('axios');
const { ethers } = require('ethers');
const fs = require('fs');

const router = Router();

// Initialize Web3 and connect to your Ethereum network
const providerUrl = 'https://sepolia.infura.io/v3/608e87db7c0140dd9ea0b61107d1b25e'; 
// ABI and address of your smart contract
//const contractABI = [/* Your contract ABI here */];
// Read the ABI from a file
//const contractABI = JSON.parse(fs.readFileSync('contractABI.json', 'utf-8'));
const contractAddress = '0xA2679365bB048Bd6d471813410714862faa0EB58';

//const contract = new web3.eth.Contract(contractABI, contractAddress);

// Connect to the Ethereum network
//const provider = new ethers.providers.JsonRpcProvider(providerUrl);

// Instantiate the contract
//const contract = new ethers.Contract(contractAddress, contractABI, provider);
console.log("Executing task");

// Set up event listener for ContributorModelSubmitted
// contract.on('ContributorModelSubmitted', (taskId, originalModelHash, contributorModelHash) => {
//     console.log(`ContributorModelSubmitted event detected:
//     Task ID: ${taskId.toString()}
//     Original Model Hash: ${originalModelHash}
//     Contributor Model Hash: ${contributorModelHash}`);
// });

// Keep the script running
console.log('Listening for ContributorModelSubmitted events...');

// // Listen for the event, this triggers the whole
// contract.events.ModelSubmitted({
//     fromBlock: 'latest'
// })
// .on('data', async (event) => {
//     const pinataHashOwner = event.returnValues.pinataHashOwner;
//     const pinataHashSubmitter = event.returnValues.pinataHashSubmitter;
//     const pinataHashArchitecture = event.returnValues.pinataHashArchitechture;

//     if (pinataHashOwner && pinataHashSubmitter && pinataHashArchitecture) {
//         try {
//             // Query Pinata for the datas
//             const pinataDataOwner = await dalService.queryPinata(pinataHashOwner);
//             const pinataDataSubmitter = await dalService.queryPinata(pinataHashSubmitter);
//             const pinataDataArchitecture = await dalService.queryPinata(pinataHashArchitecture);
//             // Process the data (e.g., execute the model)
//             await processModelData({ pinataHashOwner,pinataDataOwner,pinataHashSubmitter, pinataDataSubmitter, pinataHashArchitecture, pinataDataArchitecture} );
//         } catch (error) {
//             console.error('Error processing model:', error);
//         }
//     }
// })
// .on('error', console.error);


async function processModelData({pinataHashOwner,pinataHashSubmitter,pinataHashArchitecture }) {
    // Implement your model processing logic here
    const pinataDataOwner = await dalService.queryPinata(pinataHashOwner);
    const pinataDataSubmitter = await dalService.queryPinata(pinataHashSubmitter);
    const pinataDataArchitecture = await dalService.queryPinata(pinataHashArchitecture);
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
        
        const { arg1, arg2 } = req.body;
        console.log(`Received arguments: arg1 = ${arg1}, arg2 = ${arg2}`);

        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`);

        const result = true;
        const cid = await dalService.publishJSONToIpfs(result);
        const data = "hello";
        await dalService.sendTask(cid, data, taskDefinitionId);
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }

});

module.exports = router;
