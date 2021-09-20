const express = require('express')
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
require('dotenv').config()


const id = '1028639473281-qko262tv42jaaogvmcis13s43hcangf4.apps.googleusercontent.com';
const secret = '8FmUhuRJcjvFu56MCEaIyBRO';
const rtoken = '1//04Fw6ROK7OW7MCgYIARAAGAQSNwF-L9Ir--nzn1V1SyQhxS1sdn-ssXFlJObZHoEDr4_hY-ZfJ6HkFEnhdtDk0w-T_Pg4gcWcC2M';

const { google } = require("googleapis");
const OAuth2 = google.auth.OAuth2;
const oauth2Client = new OAuth2(
  id,
  secret, // Client Secret
  "https://developers.google.com/oauthplayground" // Redirect URL
  
);
oauth2Client.setCredentials({
  refresh_token: rtoken
});
const accessToken = oauth2Client.getAccessToken()


const app = express()
app.use(bodyParser.urlencoded({ extended: true }));


const port = 5000
  
const { createCanvas, loadImage, rsvgVersion } = require('canvas')
// const canvas = createCanvas(794, 1123)
// const ctx = canvas.getContext('2d')

// ctx.font = '20px Impact'


// var text = ctx.measureText('123')
// ctx.strokeStyle = 'rgba(0,0,0,0.5)'
// ctx.beginPath()
// ctx.lineTo(50, 102)
// ctx.lineTo(50 + text.width, 102)
// ctx.stroke()
var names=[],transporter,testAccount

var busy=0,count=0;


function delay(i,image) { 
  return new Promise((resolve,reject)=>{       
      setTimeout(async function() {   
        //load image to canvas and write to canvas
        try{
        var canvas = createCanvas(794, 1123)
        var ctx = canvas.getContext('2d')

        ctx.font = '20px Sans'


        var text = ctx.measureText('123')
        ctx.strokeStyle = 'rgba(0,0,0,0.5)'
        ctx.beginPath()
        ctx.lineTo(50, 102)
        ctx.lineTo(50 + text.width, 102)
        ctx.stroke()
        ctx.drawImage(image, 0, 0, 794, 1123)
        ctx.fillText('123', 380, 430)
        ctx.font = '40px Sans'
        var newname = names[i]
        console.log(newname+' '+i)
        ctx.fillText(newname,180,550)
        ctx.font = '20px Sans'
        ctx.fillText('Cyber Security', 80, 660)
        var d= new Date();
        ctx.fillText(d.toISOString().slice(0,10), 80, 730)
        //to write canvas to image
        const fs = require('fs')
        const out = fs.createWriteStream(__dirname + `/test${i}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () =>  console.log('The file was created.'))
        resolve();}catch(e){console.log(e)}
      }, 2000)
    });
}

async function sendMail(i){
  return new Promise(async(resolve,reject)=>{
    setTimeout(async function() {
      try{  
      var img = require("fs").readFileSync(__dirname + `/test${i}.png`);
      var attachment = [{
        'filename': `test${i}.png`,
        'content': new Buffer(img)
        }]
        // send mail with defined transport object
        let info = await transporter.sendMail({
        from: "aseem.abhyast@gmail.com", // sender address
        to: emails[i], // list of receivers
        // to:"nachaparty@gmail.com",
        subject: `Your event certificate is here ${names[i]} !  ✔`, // Subject line
        attachments: attachment,
        text: "Thank You for attending the webinar", // plain text body
        html: "<b> We hope you had a great learning experience with us.<br> Thank You for attending the webinar.</b>", // html body
      });

      console.log("Message sent: %s", info.messageId);
      console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
      resolve();}catch(e){console.log(e)}
    }, 2000)
    });
}


async function removeFiles(i){
  return new Promise(async(resolve,reject)=>{
    setTimeout(async function() {  
      try{
      // var img = require("fs").readFileSync(__dirname + `/test${i}.png`);
      const fs = require("fs")

      const  pathToFile = __dirname + `/test${i}.png`

      fs.unlink(pathToFile, function(err) {
        if (err) {
          throw err
        } else {
          console.log("Successfully deleted the file.")
        }
      })
      
      resolve();}catch(e){console.log(e)}
    }, 2000)
    });
}



async function write(){

  return new Promise(async(resolve,reject)=>{
    setTimeout(async function() { 
          try{
          transporter = nodemailer.createTransport( {
          service: 'gmail',
          // port: 587,
          // secure: false, // true for 465, false for other ports
          auth: {
              // user: '',//process.env.EMAIL,
              // pass: ''//process.env.password
              type: "OAuth2",
              user: "aseem.abhyast@gmail.com", 
              clientId: id,              
              clientSecret: secret,
              refreshToken: rtoken,
              accessToken: accessToken
          },
          tls: {
            rejectUnauthorized: false
          }
      });
            loadImage('Slide1.jpg').then(async(image) => {
              for(var i=0;i<names.length;i++){
                await delay(i,image)
                await sendMail(i); 
                await removeFiles(i)
                if(i==names.length-1){
                  busy=0
                }
              }  })
              
    resolve();}catch(e){console.log(e)}
  }, 0)
  });          
}


app.get('/', (req, res) => {
   
    //res.sendFile(__dirname + '/test.png');
    res.send("Please send a Post Request instead. Thank You for Using the service.")
})


app.post('/get-cert', (req, res) => {
  console.log('just inside app.post')
  console.log(busy)
  // count++;
  // console.log(count)
  try{
        if(busy==0)
        {
              busy=1
              names=[]
              emails=[]
              var k=0;
              //console.log(JSON.parse(req.body.data))
              f = JSON.parse(req.body.data)
              //console.log(f.p1.name)
              for (var key in f) {
                if (f.hasOwnProperty(key)) {
                    console.log(key + " -> " + f[key].username);
                    names[k]=f[key].username
                    emails[k]=f[key].email
                    k++
                }
                
            }
            console.log(names.length)
            for(var i=0;i<names.length;i++)
            console.log(names[i]+' '+emails[i])
            
            write()
            
            res.send('Success. Certificates will be generated and delivered shortly');
        }
      
        else{
          res.send('Server Busy, please try again later')
        }
      }
      catch(e){
          console.log(e)
          busy=0
          res.send('Wrong syntax')
      }
});




app.listen(process.env.PORT || port, () => {
    console.log(`Example app listening`)
  })