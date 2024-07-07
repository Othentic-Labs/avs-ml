"use strict";
const { Router } = require("express")
const CustomError = require("./utils/validateError");
const CustomResponse = require("./utils/validateResponse");
const oracleService = require("./oracle.service");
const dalService = require("./dal.service");

const router = Router()

router.post("/execute", async (req, res) => {
    console.log("Executing task");

    // What is the purpopse of the task definition ? Is it shared accross ?
    //- just in case they are multiple task different performers can pick in our case just on taks
    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`)
        // he passes his parameter, so his matrix of coefficients from his Liner regression
        // Now we execute the R2
        const coefficients = req.body.coefficients
        // computation of the model. (Here we will have to perfom the NN modrl)
        const rSquared = oracleService.rSquared(coefficients)
        // We might need to publish it to IPFS or something similar
        const proofOfTask =  await dalService.publishJSONToIpfs(rSquared);
        const data = coefficients;
        // We send the infos to the attestors to validate the computation.
        await dalService.sendTask(proofOfTask, data, taskDefinitionId);// (proofOfTask, data, taskDefinitionID) => Sending to the Attestators
        // ; This also propogate the event.
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})



module.exports = router
