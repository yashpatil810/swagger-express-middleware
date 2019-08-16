"use strict";

module.exports = DataStore;

const _ = require("lodash");
const ono = require("ono");
const util = require("../helpers/util");
const Resource = require("./../data-store/resource");
const MongoDAO = require("./mongo-dao");
require("./../data-store/buffer-polyfill");

let mongoDAO;
const url = "mongodb://localhost:27017/swagger";
const dbName = "swagger";

/**
 * An abstract base class for data-storage of REST resources.
 *
 * @constructor
 */
function DataStore () {
  util.log("MongoDataStore");
  async function main () {
    mongoDAO = await new MongoDAO(url, dbName);
  }
  main();
  /**
   * The Express Application or Router that's used to determine case-sensitivity and/or strict matching
   * of collection paths and resource names.
   *
   * @type {express#Router}
   * @protected
   */
  this.__router = {};
}

/**
 * Returns the given resource.
 *
 * @param   {Resource|string}  resource - The resource (path) or Resource object to be retrieved
 * @param   {function}  callback
 * - An error-first callback.  The second parameter is the {@link Resource} object,
 * or undefined if no match was found.
 */
DataStore.prototype.get = function (resource, callback) {
  util.log("MongoDataStore -- DataStore.prototype.get");
  // let self = this;
  console.log("lllllllllllllllllllllllllllll");
  console.log(resource);

  if (_.isString(resource)) {
    resource = new Resource(resource);
  }
  console.log(resource);

  const name = resource.name.substring(1);
  console.log(name);

  mongoDAO.readOne(resource.collection, name, (err, res) => {
    console.log(err);

    console.log("res ", res);
    const Resources = {
      collection: "",
      name: "",
      // modifiedOn: "2019-08-15T17:07:50.193Z",
      // createdOn: "2019-08-15T17:07:50.193Z",
      data: res
    };
    callback(err, Resources);
  });
};

// noinspection JSClosureCompilerSyntax
/**
 * Saves the given resource(s) to the data store.
 * If any of the resources already exist, the new data is merged with the existing data.
 *
 * @param   {...Resource|Resource[]}   resources
 * - The resource(s) or array of resources to be saved
 *
 * @param   {function}  [callback]
 * - An error-first callback.  The second parameter is the {@link Resource} object
 * or array of {@link Resource} objects that were saved.
 */
DataStore.prototype.save = function (resources, callback) {
  util.log("MongoDataStore -- DataStore.prototype.save");

  call(this, save, arguments);
};

/**
 * Removes the given resource from the data store.
 *
 * @param   {...Resource|Resource[]}    resources
 * - The resource(s) or array of resources to be removed
 *
 * @param   {function}  [callback]
 * - An error-first callback.  The second parameter is the {@link Resource} object
 * or array of {@link Resource} objects that were removed.
 */
DataStore.prototype.delete = DataStore.prototype.remove = function (
  resources,
  callback
) {
  util.log("MongoDataStore -- DataStore.prototype.delete");
  call(this, remove, arguments);
};

/**
 * Returns all resources in the given collection.
 *
 * @param   {string}    collection
 * - The collection path (e.g. "/", "/users", "/users/jdoe/orders/")
 *
 * @param   {function}  callback
 * - An error-first callback.  The second parameter is the array of {@link Resource} objects in the collection.
 * If there are no resources for the given collection, then the array is empty.
 */
DataStore.prototype.getCollection = function (collection, callback) {
  util.log("MongoDataStore -- DataStore.prototype.getCollection");
  // console.log(collection);

  mongoDAO.readCollection(collection, (err, res) => {
    // console.log(res);

    // const Resources = {
    //   collection: "",
    //   name: "",
    //   modifiedOn: "2019-08-15T17:07:50.193Z",
    //   // createdOn: "2019-08-15T17:07:50.193Z",
    //   data: res
    // };
    callback(err, res);
  });
};

/**
 * Removes all resources in the given collection.
 *
 * @param   {string}        collection
 * - The collection path (e.g. "/", "/users", "/users/jdoe/orders/")
 *
 * @param   {function}      callback
 * - An error-first callback.  The second parameter is the array of {@link Resource} objects that were deleted.
 * If nothing was deleted, then the array is empty.
 */
DataStore.prototype.deleteCollection = DataStore.prototype.removeCollection = function (
  collection,
  callback
) {
  util.log("MongoDataStore -- DataStore.prototype.deleteCollection");

  let self = this;

  openCollection(self, collection, (err, collection, resources) => {
    if (err) {
      doCallback(callback, err);
    }
    else {
      // Remove all resources in the collection
      let removed = _.remove(resources, collection.filter(self.__router, true));

      if (removed.length > 0) {
        // Normalize the collection name
        let collectionName = collection.valueOf(self.__router, true);

        // Save the changes
        self.__saveDataStore(collectionName, resources, err => {
          if (err) {
            doCallback(callback, err);
          }
          else {
            doCallback(callback, null, removed);
          }
        });
      }
      else {
        doCallback(callback, null, []);
      }
    }
  });
};

/* istanbul ignore next: abstract method */
/**
 * Opens the underlying data-store and returns its data.
 * Depending on the implementation, this may be the contents of a flat file, a database query, etc. instead.
 *
 * @param   {string}    collection
 * - The Resource collection that is being operated upon.
 * Some DataStore implementations may use this to determine which data to return.
 *
 * @param   {function}  callback
 * - An error-first callback.  The second parameter is an array of {@link Resource} objects
 * that correspond to the given `collection` and `name`.
 *
 * @protected
 */
DataStore.prototype.__openDataStore = function (collection, callback) {};

/* istanbul ignore next: abstract method */
/**
 * Persists changes to the underlying data-store.
 * Depending on the implementation, this may write to a flat file, a database, etc. instead.
 *
 * @param   {string}      collection
 * - The Resource collection that is being operated upon.
 * Some DataStore implementations may use this to determine which data to persist/overwrite.
 *
 * @param   {Resource[]}  resources
 * - An array of {@link Resource} objects that should be persisted to the underlying data-store.
 *
 * @param   {function}    callback
 * - An error-first callback.  Called when the data has been persisted, or an error occurs.
 *
 * @protected
 */
DataStore.prototype.__saveDataStore = function (
  collection,
  resources,
  callback
) {};

/**
 * Saves the given resources to the data store.
 * If any of the resources already exist, the new data is merged with the existing data.
 *
 * @param   {DataStore}     dataStore      - The DataStore to operate on
 * @param   {string}        collectionName - The collection that all the resources belong to
 * @param   {Resource[]}    resources      - The Resources to be saved
 * @param   {function}      callback       - Callback function
 */
function save (dataStore, collectionName, resources, callback) {
  util.log("MongoDataStore -- save");

  console.log(resources);
  // let now = Date.now();
  // resources.createdOn = new Date(now);
  // resources.modifiedOn = new Date(now);
  mongoDAO.insertDocument(resources[0].name, resources[0].data, (err, res) => {
    console.log(res);
    // console.log("res ", res);

    callback(err, [res]);
  });
}

/**
 * Removes the given resource from the data store.
 *
 * @param   {DataStore}     dataStore      - The DataStore to operate on
 * @param   {string}        collectionName - The collection that all the resources belong to
 * @param   {Resource[]}    resources      - The Resources to be removed
 * @param   {function}      callback       - Callback function
 */
function remove (dataStore, collectionName, resources, callback) {
  util.log("MongoDataStore -- remove");
  console.log(dataStore);
  console.log(collectionName);
  console.log(resources);
  const name = resources[0].name.substring(1);
  console.log(name);
  mongoDAO.deleteDocument(collectionName, name, (err, res) => {
    callback(err, res);
  });
}

/**
 * Opens the given collection.
 *
 * @param   {DataStore}         dataStore  - The DataStore to operate on
 * @param   {string|Resource}   collection - The collection path or a Resource object
 * @param   {function}          callback   - Called with Error, collection Resource, and Resource array
 */
function openCollection (dataStore, collection, callback) {
  util.log("MongoDataStore -- openCollection");

  if (_.isString(collection)) {
    collection = new Resource(collection, "", "");
  }
  else if (!(collection instanceof Resource)) {
    throw ono(
      "Expected a string or Resource object. Got a %s instead.",
      typeof collection
    );
  }

  // Normalize the collection name
  let collectionName = collection.valueOf(dataStore.__router, true);

  // Open the data store
  dataStore.__openDataStore(collectionName, (err, resources) => {
    callback(err, collection, resources);
  });
}

/**
 * Calls the given callback with the given arguments, if the callback is defined.
 *
 * @param   {function|*}    callback
 * @param   {Error|null}    err
 * @param   {*}             arg
 */
function doCallback (callback, err, arg) {
  util.log("MongoDataStore -- doCallback");
  console.log(arg);

  if (_.isFunction(callback)) {
    callback(err, arg);
  }
}

/**
 * Calls the given function with normalized parameters:
 * the DataStore, collection name, an array of {@link Resource} objects, and a callback function.
 *
 * The given function might be called multiple times.  Each time it is called, the array of resources
 * will all belong to the same collection.
 *
 * @param   {DataStore} dataStore - The DataStore to operate on
 * @param   {function}  fn        - The function to be called
 * @param   {arguments} args      - The non-normalized arguments (one resource, multiple resources, a resource array, a callback)
 */
function call (dataStore, fn, args) {
  util.log("MongoDataStore -- call");

  let resources, callback;

  // If only a single resource was passed-in, then only a single resource will be passed-back
  let singleResource =
    _.first(args) instanceof Resource &&
    (args.length === 0 || _.isFunction(args[1]));

  // Normalize the arguments
  if (_.isFunction(_.last(args))) {
    resources = _.flatten(_.initial(args), true);
    callback = _.last(args);
  }
  else {
    resources = _.flatten(args, true);
    callback = _.noop;
  }

  // Group the resources into collections
  let collections = {};
  for (let i = 0; i < resources.length; i++) {
    let resource = resources[i];
    if (!(resource instanceof Resource)) {
      throw ono(
        "Expected a Resource object, but parameter %d is a %s.",
        i + 1,
        typeof resource
      );
    }

    let collectionName = resource.valueOf(dataStore.__router, true);
    let collection =
      collections[collectionName] || (collections[collectionName] = []);
    collection.push(resource);
  }

  // Call the function for each collection of resources
  let collectionNames = Object.keys(collections);
  let collectionIndex = 0,
      processedResources = [];
  processNextCollection();

  function processNextCollection (err, resources) {
    if (err) {
      // An error occurred, so abort.
      finished(err);
      return;
    }

    if (resources) {
      // Add the resources to the list of processed resources
      processedResources = processedResources.concat(resources);
    }

    if (collectionIndex >= collectionNames.length) {
      // We're done processing all collections, so return the results
      finished(null, processedResources);
    }
    else {
      // Process the next collection
      let collectionName = collectionNames[collectionIndex++];
      fn(
        dataStore,
        collectionName,
        collections[collectionName],
        processNextCollection
      );
    }
  }

  function finished (err, resources) {
    util.log("MongoDataStore -- finished");
    const Resources = {
      collection: "",
      name: "",
      data: resources[0]
    };
    console.log(resources);

    if (err) {
      callback(err);
    }
    else {
      // Call the callback with a single resource or an array of resources
      // callback(null, singleResource ? resources[0] : resources);
      callback(null, Resources);
    }
  }
}
