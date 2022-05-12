const { Schema, model, Types } = require("mongoose");
const schema = new Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  // information: { type: String },
  date: { type: Date },
});

module.exports = model("Client", schema);
