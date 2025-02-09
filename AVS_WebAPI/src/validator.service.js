require('dotenv').config();
const dalService = require("./dal.service");
const oracleService = require("./oracle.service");

async function validate({proofOfTask, pinataHashSubmitter, pinataHashOwner, pinataHashArchitecture}) {

  try {
      //result of the task computed by the Performer, we could also use query pinata.
      const taskResult = await dalService.getIPfsTask(proofOfTask);
      console.log("Task Result ----- \n", taskResult)
      // Get pinata data from the owner and submitter
      const pinataDataOwner = await dalService.queryPinata(pinataHashOwner);
      const pinataDataSubmitter = await dalService.queryPinata(pinataHashSubmitter);
      const pinataDataArchitechture = await dalService.queryPinata(pinataHashArchitecture);

      // 1) Compute the submitter rSquared
      var rSquaredSubmitter = oracleService.rSquared(pinataDataSubmitter, pinataDataArchitechture, false)

      console.log("LHS ------", rSquaredSubmitter, typeof(rSquaredSubmitter))
      console.log("RHS ------", taskResult.rSquaredSubmitter, typeof(taskResult.rSquaredSubmitter))
      if(rSquaredSubmitter === parseInt(taskResult.rSquaredSubmitter)){
          // We continue Validation only if the result of the Submitter computed by the operator is the same result as what the Attestator have.
          // If so we compute the rSQuare of the Owner
          console.log("Inside the validation logic")
          var rSquaredOwner= oracleService.rSquared(pinataDataOwner, pinataDataArchitechture,true)
          let isApproved = false;
          if(rSquaredSubmitter > rSquaredOwner){
              isApproved = true;
          }
          return isApproved

      } else {
          return false;// The Operator is punished or we deny..
      }
    } catch (err) {
      console.error(err?.message);
      return false;
    }
  }
  
  module.exports = {
    validate,
  }