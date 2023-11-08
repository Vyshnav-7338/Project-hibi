const express = require('express');
const bodyParser = require('body-parser');
const myRouter = express.Router();
var mailer = require('nodemailer-promise'); 
var config = require("../config")

myRouter.use(bodyParser.json());
//GET ALL
myRouter.post(`/api/emailotp/sendotp`, async (req, res) => {
    console.log("send otp called")//
	var body = req.body;
	console.log(body)
    //
	if(body.email==null){res.status(400).send("Email not specified");return;}
	if(body.email==null){res.status(400).send("Email not specified");return;}

	if(config.emailsend){
		var emailsent = await sendMail(body.email,body.otp)
		if(emailsent)res.status(200).send("Message has been sent")
		//else res.status(500).send("INTERNAL SERVER ERROR")
		else{
			var emailsent2 = await sendAlternate(body.email,body.otp)
			if(emailsent2)res.status(200).send("Message has been sent")
			else{
				var emailsent3 = await sendThird(body.email,body.otp)
				if(emailsent3)res.status(200).send("Message has been sent")
				else res.status(500).send("EMAIL EXPIRED")
			}
		}
	}
	else{
		res.status(200).send("Message has been sent")
	}
	//
})

async function sendMail(target,otp){

		var eid = "hibyeentertainmentsinfo@gmail.com"
		var sendEmail = mailer.config({
		  	host: 'smtp.gmail.com',
		  	auth: {
		  		user: eid,
		  		pass: 'gdajjgrwieeuceoq'
		  	}
		  });  

	  var message = {
		from: eid,
		to: target,
		subject: `[ ${otp} ] OTP for authenticating hibye is`,
		html: `OTP for authenticating hibye is <br><h1><b>${otp}</b></h1>, 
		<br>never share your otp with anyone `
	  };
	  
	var resp = await sendEmail(message).
	catch(function(err){console.log(err);});
	console.log(`RESPO: ${resp}`)
	return resp!=null?true:false;
}
async function sendAlternate(target,otp){
	var eid = "user.hibye.entertainments@gmail.com"
		var sendEmail = mailer.config({
		  	host: 'smtp.gmail.com',
		  	auth: {
		  		user: eid,
		  		pass: 'prbuggotwgfenqns'
		  	}
		  });  
	  var message = {
		from: eid,
		to: target,
		subject: `[ ${otp} ] OTP for authenticating hibye is`,
		html: `OTP for authenticating hibye is <br><h1><b>${otp}</b></h1>, 
		<br>never share your otp with anyone `
	  };
	  
	var resp = await sendEmail(message).
	catch(function(err){console.log(err);});
    //.then(function(info){console.log(info)})   // if successful
    //.catch(function(err){console.log('got error');});
	console.log(`RESPO: ${resp}`)
	return resp!=null?true:false;
}
async function sendThird(target,otp){
	var eid = "hibye.entertainments@gmail.com"
		var sendEmail = mailer.config({
		  	host: 'smtp.gmail.com',
		  	auth: {
		  		user: eid,
		  		pass: 'abfaexbrgqxbduoe'
		  	}
		  });  
	  var message = {
		from: eid,
		to: target,
		subject: `[ ${otp} ] OTP for authenticating hibye is`,
		html: `OTP for authenticating hibye is <br><h1><b>${otp}</b></h1>, 
		<br>never share your otp with anyone `
	  };
	  
	var resp = await sendEmail(message).
	catch(function(err){console.log(err);});
    //.then(function(info){console.log(info)})   // if successful
    //.catch(function(err){console.log('got error');});
	console.log(`RESPO: ${resp}`)
	return resp!=null?true:false;
}
module.exports = myRouter