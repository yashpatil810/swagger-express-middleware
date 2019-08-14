"use strict";
const MongoClient = require("mongodb").MongoClient;
const assert = require("assert");

function MongoDao (mongoUri, dbname) {
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

MongoDao.prototype.insertDocument = function (collectionName, doc, callback) {
  //   let _this = this;
  this.dbConnection.collection(collectionName).insertOne(doc, (err, result) => {
    assert.equal(null, err);
    // console.log(result);

    console.log(" Below doc inserted successfully");
    // _this.printDocument(collectionName, doc, callback);
  });
};
module.exports = MongoDao;
