require('dotenv').config();
const axios = require("axios");


// Here we should input our NN model

// This function takes the output of the Neural network model and computes the RSquare.
function rSquared( x, y, owner = true) {
    // some model magic in here.
    if(owner){
        return 1
    }else{
        return 2
    }
}



module.exports = {
    rSquared
}
