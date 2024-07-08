import React, { useState, useEffect } from 'react';
import './App.css';

function App() {
  const [models, setModels] = useState([]);
  const [liveModels, setLiveModels] = useState([]);
  const [pastContributions, setPastContributions] = useState([]);
  const [pastEarnings, setPastEarnings] = useState([]);
  const [walletAddress, setWalletAddress] = useState('');
  const [pinataAddress, setPinataAddress] = useState('');
  const [signer, setSigner] = useState(null);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [isTrainPopupOpen, setIsTrainPopupOpen] = useState(false);
  const [provider, setProvider] = useState(null);

  const contractABI = [{"inputs":[],"stateMutability":"nonpayable","type":"constructor"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"uint256","name":"taskId","type":"uint256"},{"indexed":false,"internalType":"string","name":"originalModelHash","type":"string"},{"indexed":false,"internalType":"string","name":"contributorModelHash","type":"string"}],"name":"ContributorModelSubmitted","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"internalType":"address","name":"submitter","type":"address"},{"indexed":false,"internalType":"string","name":"pinataHash","type":"string"},{"indexed":false,"internalType":"uint256","name":"timestamp","type":"uint256"},{"indexed":false,"internalType":"uint256","name":"submissionFee","type":"uint256"}],"name":"ModelSubmitted","type":"event"},{"inputs":[],"name":"admin","outputs":[{"internalType":"address","name":"","type":"address"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getAllModels","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"internalType":"struct ModelSubmissionContract.Model[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[],"name":"getModelCount","outputs":[{"internalType":"uint256","name":"","type":"uint256"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_start","type":"uint256"},{"internalType":"uint256","name":"_limit","type":"uint256"}],"name":"getModelsPaginated","outputs":[{"components":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"internalType":"struct ModelSubmissionContract.Model[]","name":"","type":"tuple[]"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"_modelIndex","type":"uint256"}],"name":"markModelAsProcessed","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"","type":"uint256"}],"name":"models","outputs":[{"internalType":"uint256","name":"id","type":"uint256"},{"internalType":"address","name":"owner","type":"address"},{"internalType":"string","name":"pinataHash","type":"string"},{"internalType":"string","name":"updatedPinataHash","type":"string"},{"internalType":"uint256","name":"timestamp","type":"uint256"},{"internalType":"uint256","name":"submissionFee","type":"uint256"},{"internalType":"bool","name":"isProcessed","type":"bool"}],"stateMutability":"view","type":"function"},{"inputs":[{"internalType":"uint256","name":"index","type":"uint256"},{"internalType":"string","name":"_pinataHash","type":"string"}],"name":"submitModelByContributor","outputs":[],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"string","name":"_pinataHash","type":"string"}],"name":"submitModelByOwner","outputs":[],"stateMutability":"payable","type":"function"},{"inputs":[],"name":"withdrawFees","outputs":[],"stateMutability":"nonpayable","type":"function"}];

  const ethers = require("ethers");

  const contractAddress = '0xA2679365bB048Bd6d471813410714862faa0EB58';

  const fetchLiveModels = async () => {
    if (!walletAddress) return;
  
    try {
      const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
  
      const modelCount = await contractInstance.getModelCount();
      console.log('Model count:', modelCount.toString());

      const response = await contractInstance.getAllModels();
      console.log('Raw response from getAllModels:', response);
      
      const formattedModels = response.map(modelData => {

        if (typeof modelData === 'object' && modelData !== null) {
          return {
            id: modelData.id ? modelData.id.toString() : 'N/A',
            owner: modelData.owner || 'N/A',
            pinataHash: modelData.pinataHash || 'N/A',
            updatedPinataHash: modelData.updatedPinataHash || 'N/A',
            timestamp: modelData.timestamp ? modelData.timestamp.toString() : 'N/A',
            submissionFee: modelData.submissionFee ? ethers.formatEther(modelData.submissionFee) : 'N/A',
            isProcessed: modelData.isProcessed !== undefined ? modelData.isProcessed : 'N/A'
          };
        } else {
          console.log('Unexpected model data format:', modelData);
          return null;
        }
      }).filter(model => model !== null);
  
      console.log('Formatted models:', formattedModels);
      setModels(formattedModels);
    } catch (error) {
      console.error('Error fetching live models:', error);
      setModels([]);
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

      } catch (error) {
        console.error("User denied account access or an error occurred:", error);
      }
    } else {
      alert('Please install a Web3 wallet like MetaMask or Rainbow Wallet');
    }
  };

  const submitNewModel = async () => {
    setIsPopupOpen(true);
  };

  const trainNewModel = async () => {
    setIsTrainPopupOpen(true);
  };

  const handleModelSubmission = async () => {
    if (signer && pinataAddress) {
      try {
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contractInstance.submitModelByOwner(pinataAddress, { value: ethers.parseEther("0.1") });
        setIsPopupOpen(false);
        await tx.wait();
        const allModels = await contractInstance.getAllModels();
        setModels(allModels);
        setPinataAddress('');
      } catch (error) {
        console.error("Error submitting new model:", error);
      }
    }
  };

  const handleModelTrain = async () => {
    if (signer && pinataAddress) {
      try {
        const contractInstance = new ethers.Contract(contractAddress, contractABI, signer);
        const tx = await contractInstance.submitModelByContributor(1, pinataAddress);
        setIsPopupOpen(false);
        await tx.wait();
        const allModels = await contractInstance.getAllModels();
        setModels(allModels);
        setIsPopupOpen(false);
        setPinataAddress('');
      } catch (error) {
        console.error("Error training new model:", error);
      }
    }
  };

  useEffect(() => {
    if (walletAddress) {
      fetchLiveModels();
    }
  }, [walletAddress]);

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

    setLiveModels(dummyModels);
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

        {isPopupOpen && (
          <div className="Popup">
            <h3>Enter Pinata Address</h3>
            <input
              className="inputField"
              type="text"
              value={pinataAddress}
              onChange={(e) => setPinataAddress(e.target.value)}
            />
            <button className="SubmitButton" onClick={handleModelSubmission}>Submit</button>
            <button className="CancelButton" onClick={() => setIsPopupOpen(false)}>Cancel</button>
          </div>
        )}

        {isTrainPopupOpen && (
                  <div className="Popup">
                    <h3>Enter Pinata Address</h3>
                    <input
                      className="inputField"
                      type="text"
                      value={pinataAddress}
                      onChange={(e) => setPinataAddress(e.target.value)}
                    />
                    <button className="SubmitButton" onClick={handleModelTrain}>Submit</button>
                    <button className="CancelButton" onClick={() => setIsTrainPopupOpen(false)}>Cancel</button>
                  </div>
                )}
  
        <button className="NewModel" onClick={submitNewModel}>Submit New Model</button>
  
        <h1 className="ModelListTitle">Models to Train</h1>
        <div className={`ModelList ${walletAddress ? '' : 'blurred'}`}>
          {models.map((model, index) => (
            <div key={index} className="Model">
              <p><strong>ID:</strong> {model.id}</p>
              <p><strong>Pinata Hash:</strong> {model.pinataHash}</p>
              <button className="TrainButton" onClick={trainNewModel}>Train</button>
            </div>
          ))}
        </div>
  
        <h1 className="OwnerListTitle">Your Live Models</h1>
        <div className={`OwnerList ${walletAddress ? '' : 'blurred'}`}>
        {liveModels.map((contribution, index) => (
            <div key={index} className="Model">{contribution}</div>
          ))}
        </div>
  
        <h1 className="TrainingListTitle">Your Past Contributions</h1>
        <div className={`PerformerList ${walletAddress ? '' : 'blurred'}`}>
          {pastContributions.map((contribution, index) => (
            <div key={index} className="Model">{contribution}</div>
          ))}
        </div>
  
        <h1 className="AttestationListTitle">Your Earnings</h1>
        <div className={`AttestationList ${walletAddress ? '' : 'blurred'}`}>
          {pastEarnings.map((earning, index) => (
            <div key={index} className="Model">{earning}</div>
          ))}
        </div>
      </header>
    </div>
  );
}

export default App;