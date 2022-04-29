const { Schema, model, Types } = require("mongoose");
const schema = new Schema({
  _id: { type: Types.ObjectId },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  name: { type: String, required: true },
  lastName: { type: String, required: true },
});

module.exports = model("User", schema);
