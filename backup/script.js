/** @type {import("express").RequestHandler} */
const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
const { ObjectId } = require('bson');
const { json } = require('express');
const { zip } = require('zip-a-folder');


var fs = require('fs');
const { promisify } = require('util')
const readFileAsync = promisify(fs.readFile)
const writeFileAsync = promisify(fs.writeFile)
var dateFormat = require('dateformat');
const mongoose = require('mongoose')
const Stopwatch = require('statman-stopwatch');
const sw = new Stopwatch();


var dir = './backup_data';

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

process.env["NTBA_FIX_350"] = 1;
const TelegramBot = require('node-telegram-bot-api');
const token = '5142760554:AAHSV0PlGOqq5Sp1qAxSt8FWi0Q4F_24FvU';
const bot = new TelegramBot(token);
var cid="-715253453"

//cron
var cron = require('node-cron');
var MongoClient = require('mongodb').MongoClient;
mongourl="mongodb://developer:rxnrbeib5657rtgTHrthrn4@97.74.86.91:27017/hibi?authSource=admin&readPreference=primary&appname=MongoDB%20Compass&ssl=false"



cron.schedule('47 0-23 * * *', () => {
  console.log('running a task every 30 minute');
  databackup()
})

myRouter.use(bodyParser.json());
//calendar badge
myRouter.route('/backup').post(async (req, res) => {
    //
    databackup()
});
var randimoji=['😁','😑','😘','😵','🥴','🥰','😝','😎','😋','😵']
function databackup(){
    sw.start();
    console.log('backup called')
MongoClient.connect(mongourl,async function(err, dbo) {
    if (err) throw err;
    var db = dbo.db("upfolio");
    var dt=dateFormat(new Date(), "yyyy-mm-dd_h_MM_ss");
      var dir = `./backup_data/${dt}`;
      if (!fs.existsSync(dir)){
          fs.mkdirSync(dir);
      }
      //
      var collnames = await db.listCollections().toArray();
      //console.log(collnames)
      for(var i in collnames){
          console.log(collnames[i].name)
          coll = collnames[i].name;
          //
          var count = await db.collection(coll).count();
          console.log(`${coll} count: ${count}`)
          if(count>10000){
              //bot.sendMessage(cid,`backup info: splitting data of ${coll} to smaller packs since its too large`)
              //generate parts
              var isize=10000
              for(i=1;i<=1000;i++){
                var skp=i*isize;
                if(skp<count){
                    var itemsox = await db.collection(coll).find().skip(skp).limit(isize).toArray()
                    var json = JSON.stringify(itemsox);
                    fs.writeFile(`./backup_data/${dt}/${coll}${i}.json`, json, 'utf8',()=>{});
                }
              }
          }
          else{
            var data = await db.collection(coll).find({}).toArray();
            var json = JSON.stringify(data);
            fs.writeFile(`./backup_data/${dt}/${coll}.json`, json, 'utf8',()=>{});
          }
         
      }
      console.log("backup success")
      //zip folder
      await zip(`./backup_data/${dt}`, `./backup_data/upfolio_${dt}.zip`);
      await bot.sendDocument(cid,`./backup_data/upfolio_${dt}.zip`)
      sw.stop();
      const delta = sw.read();
      bot.sendMessage(cid,`upfolio backup finished in ${delta/1000} seconds man 😵`)
      fs.rmdirSync(`./backup_data/${dt}`, { recursive: true, force: true });
  });
}
//restrore

myRouter.route('/restore/:folder').post(async (req, res) => {
    //
    var db = req.db;
    //await db.dropDatabase()
    console.log(req.params.folder)
    fs.readdir(`./backup_data/${req.params.folder}`, (err, files) => {
       files.forEach(file => {
          console.log(file);
          //read file
          fs.readFile(`./backup_data/${req.params.folder}/${file}`, 'utf8', async function readFileCallback(err, data){
            if (err){
                console.log(err);
            } else {
            obj = JSON.parse(data); //now it an object
            //objectid manipulation
            var j=[];
            for(var i in obj){
                var item=obj[i]
                for (const [key, value] of Object.entries(item)) {
                    if(key.includes("id") && key!="appid" && value.toString().length===24){
                        if(mongoose.Types.ObjectId.isValid(value.toString())){
                            item[key]=ObjectId(value.toString())
                        }
                        else{
                            console.log(`key: ${key}, value ${value}`)
                            item[key] = value
                        }
                        
                    }else{item[key]=value}
                }
                j.push(item)
            }
            
            //
            
            collname=file.split(".")[0]
            console.log(collname)
            await db.collection(collname).insertMany(j)
            
        }});
        });
      });
      res.send('success')
      
});
module.exports = myRouter