//AAAAvxQ1LGA:APA91bFD2sqIS-W0-aJgtEZ_yTxLgmGkGCKPfchRJqhmcWcaBFgt2LZGt9_GxO-gNlIg68NUz6quD_Xh4nl6FczQ2y8gSQoCJHjNaQ5gvIIWiSUGQX-jJIbSEMa1kt6DksAIHzPsMpJr 
var FCM = require('fcm-node');
var serverKey = 'AAAAiHJlDh8:APA91bH9x7RqrQ2dwzAkWgiyzDrKlWPtxvAZv1VEDs7E5zJQSdwXXoXK37LqTKVoMc0FjOvQSEbezg4ABI7R85ytB1iDfpGGXNAgGrkEzeqy7velMHOW48DfeYEGluKXHk-xlVkEiQMX'; //put your server key here
var fcm = new FCM(serverKey);
const Faq = require("../models/Notifica")
const method = () => {
    // your method logic
    return suck
 }
 
 const fcmpush = async (mtitle,mbody,topic) => {
    var message = { //this may vary according to the message type (single recipient, multicast, topic, et cetera)
        to: `/topics/${topic}`, 
        //collapse_key: 'your_collapse_key',
        
        notification: {
            title: mtitle, 
            body: mbody
        },
        
        data: {  //you can send only notification or only data(or include both)
            my_key: 'my value',
            my_another_key: 'my another value'
        }
    };
    fcm.send(message, function(err, response){
        if (err) {
            console.log("Something has gone wrong!"+err);
        } else {
            console.log("Successfully sent with response: ", response);
        }
    });
    var postdata={"title":mtitle,"content":mbody==null?"no content":mbody}
    var feed = await new Faq(postdata)
    feed.save().catch((err)=>{
        console.log(err)
    }).then(async (val)=>{
    })
    // your method logic 
 }
 
 module.exports = {
     method, 
     fcmpush,
     // anotherMethod
 };