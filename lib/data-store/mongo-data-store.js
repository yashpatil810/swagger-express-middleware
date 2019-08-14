"use strict";
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

function MongoDataStore (mongoUri, dbname) {
  let _this = this;
  let options = { useNewUrlParser: true };
  _this.mongoClient = new MongoClient(mongoUri, options);

  return new Promise((resolve, reject) => {
    _this.mongoClient.connect((err, client) => {
      assert.equal(err, null);
      console.log("mongo client successfully connected \n");
      _this.dbConnection = _this.mongoClient.db(dbname);
      resolve(_this);
    });
  });
}

MongoDataStore.prototype.readCollection = function (collectionName) {
  return this.dbConnection.collection(collectionName).find();
};
MongoDataStore.prototype.readDocument = async function (
  collectionName,
  _id,
  callback
) {
  const a = await this.dbConnection.collection(collectionName).findOne({ _id });
  console.log("one doc", a);
  return a;
};

MongoDataStore.prototype.printDocument = function (
  collectionName,
  doc,
  callback
) {
  this.dbConnection
    .collection(collectionName)
    .find({})
    .filter(doc)
    .toArray((err, docs) => {
      console.log(docs[0]);
      console.log("\n");
      callback();
    });
};

MongoDataStore.prototype.insertDocument = async function (
  collectionName,
  doc,
  callback
) {
  let _this = this;
  this.dbConnection
    .collection(collectionName)
    .insertOne(doc, async (err, result) => {
      assert.equal(null, err);
      console.log(" Below doc inserted successfully");
      console.log(result.insertedId);

      const document = await _this.readDocument(
        collectionName,
        result.insertedId,
        callback
      );
      callback(err, document);
    });
};

MongoDataStore.prototype.updateDocument = function (
  collectionName,
  doc,
  updateDocument,
  callback
) {
  let _this = this;
  this.dbConnection
    .collection(collectionName)
    .updateMany(doc, updateDocument, (err, result) => {
      assert.equal(null, err);
      console.log(result.result.ok + " document updated successfully");
      _this.printDocument(collectionName, doc, callback);
      callback();
    });
};

MongoDataStore.prototype.deleteDocument = function (
  collectionName,
  doc,
  callback
) {
  this.dbConnection.collection(collectionName).deleteOne(doc, (err, result) => {
    assert.equal(null, err);
    console.log(result.result.ok + " document deleted successfully");
    callback();
  });
};
module.exports = MongoDataStore;
