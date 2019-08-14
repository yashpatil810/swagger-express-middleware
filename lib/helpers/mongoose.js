"use strict";
const mongoose = require("mongoose");

exports.connect = ({ url }) =>
  mongoose.connect(url, {
    useNewUrlParser: true,
    useCreateIndex: true
  });
