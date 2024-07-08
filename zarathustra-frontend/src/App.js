import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [models, setModels] = useState([]);
  const [liveModels, setLiveModels] = useState([]);
  const [pastContributions, setPastContributions] = useState([]);
  const [pastEarnings, setPastEarnings] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [signer, setSigner] = useState(null);
  const [provider, setProvider] = useState(null);

  const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":false,"internalType":"string","name":"originalModelHash","type":"string"},{"indexed":false,"internalType":"string","name":"contributorModelHash","type":"string"}],"name":"ContributorModelSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"submitter","type":"address"},{"indexed":false,"internalType":"string","name":"pinataHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"submissionFee","type":"uint256"}],"name":"ModelSubmitted","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllModels","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"internalType":"struct ModelSubmissionContract.Model[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getModelCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_start","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getModelsPaginated","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"internalType":"struct ModelSubmissionContract.Model[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_modelIndex","type":"uint256"}],"name":"markModelAsProcessed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"models","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"string","name":"_pinataHash","type":"string"}],"name":"submitModelByContributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_pinataHash","type":"string"}],"name":"submitModelByOwner","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  const ethers = require("ethers");

  const contractAddress = '0xA2679365bB048Bd6d471813410714862faa0EB58';

  const fetchLiveModels = async () => {
    if (!walletAddress) return;
  
    try {
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
  
      // First, get the model count
      const modelCount = await contractInstance.getModelCount();
      console.log('Model count:', modelCount.toString());
  
      if (modelCount.eq(0)) {
        console.log('No models found');
        setLiveModels([]);
        return;
      }
  
      // If there are models, fetch them
      const response = await contractInstance.getAllModels();
      console.log('Raw response from getAllModels:', response);
  
      // Check if the response is an array
      if (!Array.isArray(response)) {
        console.log('Response is not an array:', response);
        setLiveModels([]);
        return;
      }
  
      const formattedModels = response.map(modelData => {
        // Check if modelData is an object with the expected properties
        if (typeof modelData === 'object' && modelData !== null) {
          return {
            id: modelData.id ? modelData.id.toString() : 'N/A',
            owner: modelData.owner || 'N/A',
            pinataHash: modelData.pinataHash || 'N/A',
            updatedPinataHash: modelData.updatedPinataHash || 'N/A',
            timestamp: modelData.timestamp ? modelData.timestamp.toString() : 'N/A',
            submissionFee: modelData.submissionFee ? ethers.utils.formatEther(modelData.submissionFee) : 'N/A',
            isProcessed: modelData.isProcessed !== undefined ? modelData.isProcessed : 'N/A'
          };
        } else {
          console.log('Unexpected model data format:', modelData);
          return null;
        }
      }).filter(model => model !== null);
  
      console.log('Formatted models:', formattedModels);
      setLiveModels(formattedModels);
    } catch (error) {
      console.error('Error fetching live models:', error);
      // You might want to set an error state here to display to the user
      setLiveModels([]);
    }
  };

  const connectWallet = async () => {
    if (typeof window.ethereum !== 'undefined') {
      try {
        await window.ethereum.request({ method: 'eth_requestAccounts' });

        const provider = new ethers.BrowserProvider(window.ethereum);
        setProvider(provider);
        const signer = await provider.getSigner();
        setSigner(signer);
        const address = await signer.getAddress();

        setWalletAddress(address);
        fetchLiveModels();
      } catch (error) {
        console.error("User denied account access or an error occurred:", error);
      }
    } else {
      alert('Please install a Web3 wallet like MetaMask or Rainbow Wallet');
    }
  };

  useEffect(() => {

    const dummyModels = [];
    for (let i = 1; i <= 10; i++) {
      dummyModels.push(`Model ${i}`);
    }

    const dummyContributions = [];
    for (let i = 1; i <= 10; i++) {
      dummyContributions.push(`Contribution ${i}`);
    }

    const dummyEarnings = [];
    for (let i = 1; i <= 10; i++) {
      dummyEarnings.push(`Earning ${i}`);
    }

    setModels(dummyModels);
    setPastContributions(dummyContributions);
    setPastEarnings(dummyEarnings);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="Title">Zarathustra AI ❤️</h1>

        <button className={`ConnectWalletButton ${walletAddress ? 'connected' : ''}`} onClick={connectWallet}>
        {walletAddress ? `${walletAddress}` : 'Connect Wallet'}
         </button>

        <button className="NewModel">Submit New Model</button>

        <h1 className="ModelListTitle">Models to Train</h1>
        <div className="ModelList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

        <h1 className="OwnerListTitle">Your Live Models</h1>
        <div className="OwnerList">
          {liveModels.map((model, index) => (
            <div key={index} className="Model">
              <p>ID: {model.id}</p>
              <p>Owner: {model.owner}</p>
              <p>Pinata Hash: {model.pinataHash}</p>
              <p>Updated Pinata Hash: {model.updatedPinataHash}</p>
              <p>Timestamp: {model.timestamp}</p>
              <p>Submission Fee: {model.submissionFee}</p>
              <p>Processed: {model.isProcessed ? 'Yes' : 'No'}</p>
            </div>
          ))}
        </div>

        <h1 className="TrainingListTitle">Your Past Contributions</h1>
        <div className="PerformerList">
          {pastContributions.map((pastContributions, index) => (
            <div key={index} className="Model">{pastContributions}</div>
          ))}
        </div>

        <h1 className="AttestationListTitle">Your Earnings</h1>
        <div className="AttestationList">
          {pastEarnings.map((pastEarnings, index) => (
            <div key={index} className="Model">{pastEarnings}</div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;