"use strict";
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

function MongoDAO (mongoUri, dbname) {
  let _this = this;
  let options = { useNewUrlParser: true };
  _this.mongoClient = new MongoClient(mongoUri, options);

  return new Promise((resolve, reject) => {
    _this.mongoClient.connect((err, client) => {
      assert.equal(err, null);
      console.log("======================================");
      console.log("mongo client successfully connected");
      console.log("=======================================");
      _this.dbConnection = _this.mongoClient.db(dbname);
      resolve(_this);
    });
  });
}

MongoDAO.prototype.readCollection = async function (collectionName, callback) {
  await this.dbConnection
    .collection(collectionName)
    .find()
    .toArray((err, documents) => {
      callback(err, documents);
    });
};

MongoDAO.prototype.readOne = async function (collectionName, name, callback) {
  await this.dbConnection
    .collection(collectionName)
    .findOne({ name }, (err, document) => {
      console.log("one doc on read one", document);
      callback(err, document);
    });
};

MongoDAO.prototype.readDocument = async function (
  collectionName,
  _id,
  callback
) {
  const document = await this.dbConnection
    .collection(collectionName)
    .findOne({ _id });
  console.log("one doc", document);
  return document;
};

MongoDAO.prototype.printDocument = function (collectionName, doc, callback) {
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

MongoDAO.prototype.insertDocument = async function (
  collectionName,
  doc,
  callback
) {
  console.log("=======================================");

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

MongoDAO.prototype.updateDocument = function (
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

MongoDAO.prototype.deleteDocument = function (collectionName, name, callback) {
  console.log("daaaaaaaaaaaaaaaaaaaaaaoooooooooooooooooooooo");
  console.log(collectionName);
  console.log(name);

  this.dbConnection
    .collection(collectionName)
    .deleteOne({ name }, (err, result) => {
      assert.equal(null, err);
      console.log(result.result.ok + " document deleted successfully");
      callback(err, result.result);
    });
};
module.exports = MongoDAO;
