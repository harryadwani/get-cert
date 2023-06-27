const express = require('express')
const bodyParser = require('body-parser');
const nodemailer = require("nodemailer");
const capitalize_first_letters = require('./helper_functions');
require('dotenv').config()

const id = process.env.ID;
const secret = process.env.SECRET;
const rtoken = process.env.RTOKEN;

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

const port = 5001

const { createCanvas, loadImage, rsvgVersion } = require('canvas')

var transporter;
eventName = 'Cloud Computing'
var busy = 0;


function delay(i, image, names, emails) {
  return new Promise((resolve, reject) => {
    setTimeout(async function () {

      try {  //load image to canvas and write to canvas
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
        ctx.fillText('365', 380, 430)
        ctx.font = '40px Sans'
        var newname = capitalize_first_letters(names[i])
        console.log(newname + ' ' + i)
        ctx.fillText(newname, 180, 550)
        ctx.font = '20px Sans'
        ctx.fillText(eventName, 80, 660)
        var d = new Date();
        ctx.fillText(d.toISOString().slice(0, 10), 80, 730)
        //to write canvas to image
        const fs = require('fs')
        const out = fs.createWriteStream(__dirname + `/test${i}.png`)
        const stream = canvas.createPNGStream()
        stream.pipe(out)
        out.on('finish', () => console.log('The file was created' + `/test${i}.png`))
        resolve();
      } catch (e) { console.log(e) }
    }, 2000)
  });
}

async function sendMail(i, names, emails) {
  return new Promise(async (resolve, reject) => {
    setTimeout(async function () {
      try {
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
        resolve();
      } catch (e) { console.log(e) }
    }, 2000)
  });
}


async function removeFiles(i, names, emails) {
  return new Promise(async (resolve, reject) => {
    setTimeout(async function () {
      try {
        // var img = require("fs").readFileSync(__dirname + `/test${i}.png`);
        const fs = require("fs")

        const pathToFile = __dirname + `/test${i}.png`

        fs.unlink(pathToFile, function (err) {
          if (err) {
            throw err
          } else {
            console.log("Successfully deleted the file" + `/test${i}.png`)
          }
        })

        resolve();
      } catch (e) { console.log(e) }
    }, 2000)
  });
}


async function write(names, emails) {

  return new Promise(async (resolve, reject) => {
    setTimeout(async function () {
      try {
        transporter = nodemailer.createTransport({
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
        loadImage('Slide1.jpg').then(async (image) => {
          for (var i = 0; i < names.length; i++) {
            await delay(i, image, names, emails)
            await sendMail(i, names, emails);
            await removeFiles(i, names, emails)
            if (i == names.length - 1) {
              // busy=0
              //handling the queue
              if (!queue.isEmpty()) {
                console.log('clearing q');
                let dd = drivers_driver(queue.dequeue(), 1);
                if (dd == 1)
                  console.log('Success. Certificates will be generated and delivered shortly');
                else if (dd == 0)
                  console.log('Wrong syntax')
                else if (dd == -1)
                  console.log("Empty JSON")
              }
              else {
                busy = 0
              }
            }
          }
        })

        resolve();
      } catch (e) { console.log(e) }
    }, 0)
  });
}

class Queue {
  constructor() {
    this.items = [];
  }

  // add element to the queue
  enqueue(element) {
    return this.items.push(element);
  }

  // remove element from the queue
  dequeue() {
    if (this.items.length > 0) {
      return this.items.shift();
    }
  }

  // view the last element
  peek() {
    return this.items[this.items.length - 1];
  }

  // check if the queue is empty
  isEmpty() {
    return this.items.length == 0;
  }

  // the size of the queue
  size() {
    return this.items.length;
  }

  // empty the queue
  clear() {
    this.items = [];
  }
}

let queue = new Queue();

function isEmpty(obj) {
  for (var key in obj) {
    if (obj.hasOwnProperty(key))
      return false;
  }
  return true;
}

function drivers_driver(data, src) {
  try {
    busy = 1
    let names = []
    let emails = []
    let k = 0;
    if (isEmpty(JSON.parse(data))) {
      console.log('empty Json')
      if (src == 0)
        busy = 0
      return -1
    }

    f = JSON.parse(data)
    for (var key in f) {
      if (f.hasOwnProperty(key)) {
        if (key == "eventName") {
          console.log(f[key], 'has event name')
          eventName = f[key]
          continue;
        }
        console.log(key + " -> " + f[key].username);
        names[k] = f[key].username
        emails[k] = f[key].email
        k++
      }

    }
    console.log(names.length)
    for (var i = 0; i < names.length; i++)
      console.log(names[i] + ' ' + emails[i])

    write(names, emails)
    return 1;
  }
  catch (e) {
    if (src == 0)
      busy = 0;
    return 0;
  }
}



app.get('/', (req, res) => {
  res.send("Please send a Post Request instead. Thank You for Using the service.")
})

app.post('/get-cert', (req, res) => {
  console.log('just inside app.post')
  console.log(busy)
  try {
    if (busy == 0) {
      let dd = drivers_driver(req.body.data, 0);
      if (dd == 1)
        res.send('Success. Certificates will be generated and delivered shortly');
      else if (dd = 0)
        res.send('Wrong syntax')
      else if (dd = -1)
        res.send("Empty JSON")
    }
    else {
      queue.enqueue(req.body.data)
      console.log('New entry in q')
      res.send('Request has been placed.')
    }
  }
  catch (e) {
    console.log(e)
    busy = 0
    res.send('Error ')
  }
});

app.listen(process.env.PORT || port, () => {
  console.log(`Example app listening`)
})