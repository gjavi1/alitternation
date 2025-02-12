

const environment = process.env.NODE_ENV || "development";

import * as fs from "fs";
import * as MongoDb from "mongodb";

const litterCollectionName = "litter";
const userCollectionName = "users";

export function viewAllCollections(myDb: MongoDb.Db) {
    myDb.listCollections().toArray(function(err: any, result: any) {
        if (err) throw err;
        console.log("ALL COLLECTIONS");
        console.log(result);
    });
}

export function viewAllDocumentsInCollection(myDb: MongoDb.Db, collectionName: string) {
    myDb.collection(collectionName).find({}).toArray(function(err, result) {
        if (err) throw err;
        console.log("ALL DOCUMENTS IN", collectionName);
        console.log(result);
    });
}

export function createNewCollection(myDb: MongoDb.Db, collectionName: string) {
    myDb.createCollection(collectionName, function(err, res) {
        if (err) throw err;
        console.log("Collection for " + collectionName + " created");
    });
}

export function addCollectionEntry(myDb: MongoDb.Db, collectionName: string, data: any) {
    myDb.collection(collectionName).insertOne(data, function(err, res) {
        if (err) throw err;
        console.log("Collection entry inserted");
    });
}

export async function addAllLitterData(myDb: MongoDb.Db) {
    const filePath = __dirname + "/../../data/litter.json";
    const litterData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const litterDataArray = Object.keys(litterData).map((obj) => litterData[obj]).map((o) => {o.barcode += ''; return o;});

    for (const litter in litterDataArray) {

        await myDb.collection(litterCollectionName).insertOne(litterDataArray[litter]);
    }
    console.log("All litter data added");
}

export function addAllUserData(myDb: MongoDb.Db) {
    console.log("addAllUserData");
    const filePath = __dirname + "/../../data/users.json";
    const userData = JSON.parse(fs.readFileSync(filePath, "utf8"));
    for (const user in userData) {
        myDb.collection(userCollectionName).insertOne(userData[user], function(err, res) {
            if (err) throw err;
        });
    }
    console.log("All user data added");
}

export function findUser(myDb: MongoDb.Db, usernames: string[]) {
    const results: any = [];
    for (let i = 0; i < usernames.length; i++) {
        const query = { username: usernames[i] };
        myDb.collection(userCollectionName).find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log("RESULT");
            console.log(result);
            results.push(result);
        });
    }
    return results;
}

export function findLitter(myDb: MongoDb.Db, tags: string[]) {
    const results: any = [];
    for (let i = 0; i < tags.length; i++) {
        const query = { tags: tags[i] };
        myDb.collection(litterCollectionName).find(query).toArray(function(err, result) {
            if (err) throw err;
            console.log("RESULT");
            console.log(result);
            results.push(result);
        });
    }
    return results;
}
