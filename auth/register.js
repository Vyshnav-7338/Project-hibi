const express = require("express");
const bodyParser = require("body-parser");
const myRouter = express.Router();
const User = require("../models/User");
const futils = require("../utils/fileutils");
const utils = require("../utils/utils");
myRouter.use(bodyParser.json());

myRouter.route("/api/register/").post(async (req, res, next) => {
  console.log("user register called");
  var body = req.body;
  let files = req.files;
  const videoFile = req.files.video_verification;
  const fileName = videoFile.name_video_verification;
  if (files["idProof_back"] == null) {
    res
      .status(400)
      .send({ status: "error", message: "id proof back required" });
    return;
  }
  if (files["video_verification" == null]) {
    return res.status(400).send("No files were uploaded.");
  }

  if (body["password"] != null) {
    if (utils.CheckPasswordStrong(body["password"]) === true) {
      if (files != null) {
        if (files["idProof"] != null) {
          body["idProof"] = await futils.getFileObject(files["idProof"]);
          if (files["idProof_back"] != null)
            body["idProof_back"] = await futils.getFileObject(
              files["idProof_back"]
            );
          if (files["photo"] != null)
            body["photo"] = await futils.getFileObject(files["photo"]);
          user_register(body, res, next);
        } else {
          res
            .status(400)
            .send({ status: "error", message: "id proof required" });
        }
      } else {
        res.status(400).send({ status: "error", message: "id proof required" });
      }
    } else {
      res.status(400).send({
        status: "error",
        message: utils.CheckPasswordStrong(body["password"]),
      });
    }
  } else {
    res.status(400).send({ status: "error", message: "password required" });
  }
});

async function user_register(body, res, next) {
  body["role"] = "user";
  var user = new User(body);
  await user
    .save()
    .catch((err) => {
      console.log(err);

      next(err);
    })
    .then(async (val) => {
      res.send("success");
      console.log("user registered in succesfully");
    });
}

const handleErrors = require("../middlewares/HandleError");
const { password } = require("../config");
myRouter.use(handleErrors);
module.exports = myRouter;
