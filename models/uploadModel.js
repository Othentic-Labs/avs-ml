const fs = require('fs');
const axios = require('axios');
const FormData = require('form-data');
const path = require('path');
const ethers = require('ethers');

// Replace with your actual Pinata JWT
const pinataJWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiJlYTFjNjM4Ny05MTk3LTQzN2ItODRkYS1jZmQxZmNkZTI0OGMiLCJlbWFpbCI6ImduYW5hQHN0YXJrbmV0Lm9yZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImlkIjoiRlJBMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfSx7ImlkIjoiTllDMSIsImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxfV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiIyMmFlMDUwNjA3YzRjNWNmOTc0MyIsInNjb3BlZEtleVNlY3JldCI6IjhiOTFkNzU3MjFlOWVkZjkyZDM1N2JiMGU2ZjZhNmExOTI4MmE4NzUxY2M3MWNjNjMwZDFlZTk2NjJiMzM3ZTciLCJpYXQiOjE3MjAyMTcxNjR9.LYjM6jKQ-JIXsUXGs13asEGSp0Kok4noqSxhC4IqgC8';
const privateKey = '8fa19b16325ed12f5e7e76c94de262208d269092d7a6461949ac270c80273db0';
const contractAddress = '0xe448Fb9eF7bf7B1b5c32f9611350f44942d22151';
const providerUrl = 'https://sepolia.infura.io/v3/608e87db7c0140dd9ea0b61107d1b25e';

// Read the ABI from a file
const contractABI = JSON.parse(fs.readFileSync('../Smart_Contracts/contractABI.json', 'utf-8'));

async function uploadJSONToPinata(filePath, index) {
    const url = `https://api.pinata.cloud/pinning/pinJSONToIPFS`;

    const fileContent = fs.readFileSync(filePath, 'utf-8');
    const jsonContent = JSON.parse(fileContent);
    console.log("Index is: ", index);
    const data = {
        pinataContent: jsonContent,
        pinataMetadata: {
            name: path.basename(filePath),
        },
        pinataOptions: {
            cidVersion: 1
        }
    };

    const config = {
        method: 'post',
        url: url,
        headers: {
            'Authorization': `Bearer ${pinataJWT}`,
            'Content-Type': 'application/json'
        },
        data: JSON.stringify(data)
    };

    try {
        const response = await axios(config);
        return response.data.IpfsHash;
    } catch (error) {
        console.error('Error uploading JSON to Pinata:', error.response ? error.response.data : error.message);
        throw error;
    }
}

async function storeCidOnBlockchain(num, cid) {
    // Connect to the Ethereum network
    const provider = new ethers.providers.JsonRpcProvider(providerUrl);
    const wallet = new ethers.Wallet(privateKey, provider);
    const contract = new ethers.Contract(contractAddress, contractABI, wallet);

    // Call the storeCid function
    try {
        let tx;
        if(num == -1){
            console.log("Trying to call submit by owner function");
            tx = await contract.submitModelByOwner(cid, {
                gasLimit: 300000
            });
        }
        else {
            console.log("Trying to call submit by contributor function");
            tx = await contract.submitModelByContributor(num, cid, {
                gasLimit: 300000
            });
        }
        
        await tx.wait();
        console.log('Transaction successful:', tx.hash);
    } catch (error) {
        console.error('Error storing CID on blockchain:', error);
        throw error;
    }
}

const filePath = process.argv[2];
const index = process.argv[3];

if (!filePath) {
    console.error('Please provide a path to the JSON file.');
    process.exit(1);
}

uploadJSONToPinata(filePath, index)
    .then(cid => {
        console.log('File uploaded successfully. CID:', cid);
        return storeCidOnBlockchain(index, cid);
        
    })
    .catch(error => {
        console.error('Failed to upload file:', error);
    });



