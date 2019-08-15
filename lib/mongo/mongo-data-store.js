"use strict";

module.exports = MongoDataStore;
const util = require("../helpers/util");
const DataStore = require("./index");
const Resource = require("./../data-store/resource");

// Inheritance
MongoDataStore.prototype = Object.create(DataStore.prototype);
MongoDataStore.prototype.constructor = MongoDataStore;

/**
 * An in-memory data store for REST resources.
 *
 * @constructor
 * @extends DataStore
 */
function MongoDataStore () {
  util.log("MongoDataStore");
  DataStore.call(this);

  /**
   * This implementation of DataStore uses an in-memory array.
   * @type {Resource[]}
   * @private
   */
  this.__resourceStore = [];
}

/**
 * Overrides {@link DataStore#__openDataStore} to return data from an in-memory array.
 *
 * @protected
 */
MongoDataStore.prototype.__openDataStore = function (collection, callback) {
  util.log("MongoDataStore --- MongoDataStore.prototype.__openDataStore");

  setImmediate(callback, null, this.__resourceStore);
};

/**
 * Overrides {@link DataStore#__saveDataStore} to store data in an in-memory array.
 *
 * @protected
 */
MongoDataStore.prototype.__saveDataStore = function (
  collection,
  resources,
  callback
) {
  util.log("MongoDataStore --- MongoDataStore.prototype.__saveDataStore");

  try {
    this.__resourceStore = Resource.parse(resources);
    setImmediate(callback);
  }
  catch (e) {
    callback(e);
  }
};
