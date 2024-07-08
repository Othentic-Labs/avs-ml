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


// async function processModelData({pinataHashOwner,pinataHashSubmitter,pinataHashArchitecture }) {
//     // Implement your model processing logic here
//     const pinataDataOwner = await dalService.queryPinata(pinataHashOwner);
//     const pinataDataSubmitter = await dalService.queryPinata(pinataHashSubmitter);
//     const pinataDataArchitecture = await dalService.queryPinata(pinataHashArchitecture);
//     console.log('Processing model data from owner and submitter', pinataDataOwner,pinataDataSubmitter );
//     // The data input as parameters are the data to be passed to our model and get a RSQuared result.
//     const rSquaredSubmitter = oracleService.rSquared(pinataDataSubmitter, pinataDataArchitecture, false)
//     // Now we need to send the information to the Attestator.
//     // Ideally we send the CID of owner and Submitter and the result of our experiment,
//     // so they can test against it
//     const resultJson= JSON.stringify({rSquaredSubmitter})
//     const proofOfTask = await dalService.publishJSONToIpfs(resultJson);// result of performer computation
//     const data = {pinataHashOwner, pinataHashSubmitter, pinataHashArchitecture} // data of
//     // send the RPC task to attestators
//     await dalService.sendTask(proofOfTask, data,0);
//     return proofOfTask;

// }

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    try {
        
        const { arg1, arg2 } = req.body;
        console.log(`Received arguments: arg1 = ${arg1}, arg2 = ${arg2}`);
        const pinataDataOwner = await dalService.queryPinata(arg1);
        const pinataDataSubmitter = await dalService.queryPinata(arg2);
        const pinataDataArchitecture = await dalService.queryPinata(arg2);
        console.log('Processing model data from owner and submitter', pinataDataOwner,pinataDataSubmitter);
        // The data input as parameters are the data to be passed to our model and get a RSQuared result.
        const rSquaredSubmitter = oracleService.rSquared(pinataDataSubmitter, pinataDataArchitecture, false)
        // Now we need to send the information to the Attestator.
        // Ideally we send the CID of owner and Submitter and the result of our experiment,
        // so they can test against it
        // console.log(rSquaredSubmitter)
        // let rString = rSquaredSubmitter.toString()
        const resultJson= {"rSquaredSubmitter": "2"};
        console.log(resultJson, typeof(resultJson))
        const proofOfTask = await dalService.publishJSONToIpfs(resultJson);// result of performer computation
        const data = ethers.AbiCoder.defaultAbiCoder().encode(["string", "string", "string"], [arg1, arg2, arg2]);
        console.log("Data after encoding", data)
        //Ethers ABI Encoder
        // send the RPC task to attestators
        //console.log("Data from sendTask", data)
        await dalService.sendTask(proofOfTask, data, 0);
        return res.status(200).send(new CustomResponse({proofOfTask: proofOfTask, data: data, taskDefinitionId: 0}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }

});

module.exports = router;
