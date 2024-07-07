require('dotenv').config();
const axios = require("axios");

var ipfsHost=''; // Pinate host

function init() {
  ipfsHost = process.env.IPFS_HOST;
}


async function getIPfsTask(cid) {
    const { data } = await axios.get(ipfsHost + cid);
    return {
        rSquaredSubmitter: data.rSquaredSubmitter
    };
}

async function queryPinata(hash) {
    const response = await axios.get(`https://gateway.pinata.cloud/ipfs/${hash}`);
    return response.data;
}
  
module.exports = {
  init,
  getIPfsTask,
  queryPinata
}