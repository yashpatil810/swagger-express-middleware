"use strict";

module.exports = {
  GET: queryResource,
  HEAD: queryResource,
  OPTIONS: queryResource
};

const util = require("../helpers/util");
const ono = require("ono");
const Resource = require("../data-store/resource");

/**
 * Returns the REST resource at the URL.
 * If there's no resource that matches the URL, then a 404 error is returned.
 *
 * @param   {Request}   req
 * @param   {Response}  res
 * @param   {function}  next
 * @param   {DataStore} dataStore
 */
function queryResource (req, res, next, dataStore) {
  util.log("Mock --- queryResource");
  let resource = new Resource(req.path);

  dataStore.get(resource, (err, result) => {
    if (err) {
      next(err);
    }
    else if (!result) {
      let defaultValue = getDefaultValue(res);

      if (defaultValue === undefined) {
        util.debug("ERROR! 404 - %s %s does not exist", req.method, req.path);
        err = ono({ status: 404 }, "%s Not Found", resource.toString());
        next(err);
      }
      else {
        // There' a default value, so use it instead of sending a 404
        util.debug(
          "%s %s does not exist, but the response schema defines a fallback value.  So, using the fallback value",
          req.method,
          req.path
        );
        res.swagger.lastModified = new Date();
        res.body = defaultValue;
        next();
      }
    }
    else {
      res.swagger.lastModified = result.modifiedOn;

      // Set the response body (unless it's already been set by other middleware)
      res.body = res.body || result.data;
      next();
    }
  });
}

/**
 * Returns the default/example value for this request.
 */
function getDefaultValue (res) {
  // console.log(res.swagger.schema.default);
  // console.log('####', res.swagger.schema.example)
  
  util.log("Mock --- getDefaultValue");

  if (res.body) {
    return res.body;
  }
  else if (res.swagger.schema) {
    return res.swagger.schema.default || res.swagger.schema.example;
  }
}
