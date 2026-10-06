const mongoose = require("mongoose");

const validateMongoDb = (id) => {
  const isvalid = mongoose.Types.ObjectId.isValid(id);
  if (!isvalid) throw new Error("Invalid mongodb id");
};

module.exports = validateMongoDb;
