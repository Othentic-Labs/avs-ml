import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';

function App() {
  const [models, setModels] = useState([]);

  useEffect(() => {
    // Create dummy models
    const dummyModels = [];
    for (let i = 1; i <= 10; i++) {
      dummyModels.push(`Model ${i}`);
    }
    setModels(dummyModels);
  }, []);

  return (
    <div className="App">
      <header className="App-header">

        <h1 className="Title">Decentra AI</h1>

        <h1 className="ModelListTitle">Models to Train</h1>

        <div className="ModelList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

        <h1 className="OwnerListTitle">Your Models</h1>

        <div className="OwnerList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

        <h1 className="TrainingListTitle">Your Trainings</h1>

        <div className="PerformerList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

        <h1 className="AttestationListTitle">Your Attestations</h1>

        <div className="AttestationList">
          {models.map((model, index) => (
            <div key={index} className="Model">{model}</div>
          ))}
        </div>

      </header>
    </div>
  );
}

export default App;
