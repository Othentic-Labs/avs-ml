require('dotenv').config();
const axios = require("axios");


  // I think X and Y should be fixed and provided by the initial Marketplace in pinata.
 // s the challenge

function rSquared(x, y, coefficients) {

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
    getPrice,
    rSquared
  }




/*async function getPrice(pair) {
  var res = null;
  try {
    const result = await axios.get(`https://api.binance.com/api/v3/ticker/price?symbol=${pair}`);
    res = result.data;

  } catch (err) {
    console.error("binance api:" + err)
  }
  return res;
}*/
