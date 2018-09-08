import express from "express";
import MongoDb from "mongodb";
import { getDb } from "../../util/database";

const api = express.Router();

api.get("/balance/:googleId", (req, res, next) => {
    const googleId = req.params.googleId;
    
    const userDb = getDb().collection("userData");
    userDb.find({"googleId": googleId}).toArray(function(err, result) {
        const balance = result[0].balance;
        const userBalance = {
            userId: googleId,
            balance: balance
        };
        res.send(userBalance);
    });
});

api.post("/balance/:googleId/:increaseAmount", (req, res, next) => {
    console.log("post req");
    const googleId = req.params.googleId;
    const balanceIncrease = req.params.increaseAmount;

    const userDb = getDb().collection("userData");

    userDb.find({"googleId": googleId}).toArray(function(err, result) {
        const newBalance = parseInt(result[0].balance) + parseInt(balanceIncrease);
        userDb.updateOne({"googleId": googleId}, {
            $set: {balance: newBalance},
            $currentDate: { lastModified: true }
        }, function(err, result) {            
            res.send({message: "Updated to " + newBalance});
        });
    });    
});

export default api;

