require('dotenv').config();
const axios = require("axios");


  // Here we should input our NN model

// This function takes the output of the Neural network model and computes the RSquare.
function rSquared( x, y, coefficients) {
  // some model magic in here.
  let regressionSquaredError = 0
  let totalSquaredError = 0

  function yPrediction(x, coefficients) {
    return coefficients[0] + coefficients[1] * x
  }

  let yMean = y.reduce((a, b) => a + b) / y.length

  for (let i = 0; i < x.length; i++) {
    regressionSquaredError += Math.pow(y[i] - yPrediction(x[i], coefficients), 2)
    totalSquaredError += Math.pow(y[i] - yMean, 2)
  }
  let r2= 1 - (regressionSquaredError / totalSquaredError)
  return { r2 }

}


  
  module.exports = {
    rSquared
  }
