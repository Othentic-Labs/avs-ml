import React, { useState, useEffect } from 'react';
import './App.css';
import ConnectWallet from './connect-wallet.js';

function App() {
  const [models, setModels] = useState([]);
  const [liveModels, setLiveModels] = useState([]);
  const [pastContributions, setPastContributions] = useState([]);
  const [pastEarnings, setPastEarnings] = useState([]);

  useEffect(() => {
    const dummyModels = [];
    for (let i = 1; i <= 10; i++) {
      dummyModels.push(`Model ${i}`);
    }

    const dummyLiveModels = [];
    for (let i = 1; i <= 10; i++) {
      dummyLiveModels.push(`My Model ${i}`);
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
    setLiveModels(dummyLiveModels);
    setPastContributions(dummyContributions);
    setPastEarnings(dummyEarnings);
  }, []);

  return (
    <div className="App">
      <header className="App-header">
        <h1 className="Title">Zarathustra AI</h1>

        <ConnectWallet />

        <button className="NewModel">Submit New Model</button>

        <h1 className="ModelListTitle">Models to Train</h1>
        <div className="ModelList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

        <h1 className="OwnerListTitle">Your Live Models</h1>
        <div className="OwnerList">
          {liveModels.map((liveModels, index) => (
            <div key={index} className="Model">{liveModels}</div>
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
