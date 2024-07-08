"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const validatorService = require("./validator.service");
const { ethers } = require('ethers');

const router = Router()

// This method is called automatically by the task performer through Othentic CLI
router.post("/validate", async (req, res) => {
    // get the proof of Taks, here the result of the RSQUARED
    var proofOfTask = req.body.proofOfTask;
    // GET THE CID from Owner and submitter and the architechture
    console.log("Request Body Data", (req.body.data).toString())
    //var { arg1, arg2, arg2 } = req.body.data
    const args = ethers.AbiCoder.defaultAbiCoder().decode(['string', 'string', 'string'], req.body.data.toString());
    console.log(`Validate task: proof of task: ${proofOfTask} against Owner and submitter Data as well: ${args[0]}, ${args[1]}, ${args[2]}`);
    try {
        const result = await validatorService.validate({proofOfTask, pinataHashSubmitter:args[0], pinataHashOwner:args[1], pinataHashArchitecture: args[2]});
        console.log('Vote:', result ? 'Approve' : 'Not Approved');
        // this sends via the CLI the result of the validation to the Aggregator.
        // This result can be captured in the before and After task perform (To be verified)
        return res.status(200).send(new CustomResponse(result));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})

module.exports = router
