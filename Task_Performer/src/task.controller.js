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
    try {

        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`)
        // he passes his parameter, so his matrix of coefficients from his Liner regression
        // Now we execute the R2
        const coefficients = req.body.coefficients
        const rSquared = oracleService.rSquared(coefficients)
        const proofOfTask =  await dalService.publishJSONToIpfs(rSquared);
        const data = coefficients;
        await dalService.sendTask(proofOfTask, data, taskDefinitionId);// (proofOfTask, data, taskDefinitionID)
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})



/*router.post("/execute", async (req, res) => {
    console.log("Executing task");

    // What is the purpopse of the task definition ? Is it shared accross ?
    try {
        var taskDefinitionId = Number(req.body.taskDefinitionId) || 0;
        console.log(`taskDefinitionId: ${taskDefinitionId}`)
        const result = await oracleService.getPrice("ETHUSDT");
        result.price = req.body.fakePrice || result.price;
        const cid = await dalService.publishJSONToIpfs(result);
        const data = "hello";
        await dalService.sendTask(cid, data, taskDefinitionId);// (proofOfTask, data, taskDefinitionID)
        return res.status(200).send(new CustomResponse({proofOfTask: cid, data: data, taskDefinitionId: taskDefinitionId}, "Task executed successfully"));
    } catch (error) {
        console.log(error)
        return res.status(500).send(new CustomError("Something went wrong", {}));
    }
})*/


module.exports = router
