const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var auth = require('../auth/authenticate');
var randomstring = require("randomstring");
var fs = require('fs');
var xlsx = require('node-xlsx').default
//models dude😁
const User = require("../models/User");
const config = require('../config');


myRouter.use(bodyParser.json());
//export registered candidates data of an event
myRouter.post(`/api/user/export/excel`,auth.verifyUser, async (req, res) => {
    console.log("get registered userlist called")//
    var items = await User.find().sort({ name: 1 }).exec()
    //res.send(items)
    //console.log(event)
    const data = [
        ['SI No', 'Name','_id','phone','email',
      'gender','dob','document_id','verified'
    ],
      ];

      for (var index in items) {
          var i=items[index]
          const sino = parseInt(index)+1;
        data.push([sino, 
            i['name']!=null?i['name']:'none',
          i['id'],
          i['phone']!=null?i['phone']:'none',
          i['email']!=null?i['email']:'none',
          i['gender']!=null?i['gender']:'none',
          i['dob']!=null?i['dob']:'none',
          i['document_id']!=null?i['document_id']:'null',
          i['verified']!=null?i['verified']==1?'true':'false':'false'
        ])
      }
    var buffer = xlsx.build([{name: 'Sheet1', data: data}]); // Returns a buffer
      //
      var fileContents = Buffer.from(buffer, "base64");
      var fileName=randomstring.generate(10);
      var cdndir = config.live==true?config.cdndir_live:config.cdndir_local;
      var savedFilePath = cdndir+fileName+".xls"; // in some convenient temporary file folder
      fs.writeFile(savedFilePath, fileContents, function() {
        res.status(200).download(savedFilePath, fileName);
      });
})



module.exports = myRouter