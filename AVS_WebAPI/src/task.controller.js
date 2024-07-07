"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const validatorService = require("./validator.service");

const router = Router()

// This method is called automatically by the task performer through Othentic CLI
router.post("/validate", async (req, res) => {
    // get the proof of Taks, here the result of the RSQUARED
    var proofOfTask = req.body.proofOfTask;
    // GET THE CID from Owner and submitter and the architechture
    var { pinataHashOwner, pinataHashSubmitter, pinataHashArchitecture } = req.body.data
    console.log(`Validate task: proof of task: ${proofOfTask} against Owner and submitter Data as well: ${ pinataHashOwner, pinataHashSubmitter, pinataHashArchitecture}`);
    try {
        const result = await validatorService.validate({proofOfTask, pinataHashSubmitter, pinataHashOwner, pinataHashArchitecture});
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
