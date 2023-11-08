const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: String,
  email: String,
  password: String,
  phone: Number,
  gender: String,
  DOB: Date,
  addressProof: Number,
  image: String,
  FrontView: String,
  BackView: String,
  video_verfication:String,
});
const UserModel = mongoose.model("users", UserSchema);
module.exports = UserModel;
