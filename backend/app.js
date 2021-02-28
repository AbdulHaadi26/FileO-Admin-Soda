//To get process env variables
require('dotenv').config();

const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const https = require('https');
const http = require('http');
const fs = require('fs');
const compression = require('compression');

//Middleware functions
app.use(express.json({ limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
app.use(cors());
app.use(compression({ filter: shouldCompress }));

function shouldCompress(req, res) {
    if (req.headers["x-no-compression"]) return false;
    return compression.filter(req, res);
}

//Routes
require('./routes')(app);
require('./middlewares/cronJobs');

//Set Two Servers
var options = {
    key: fs.readFileSync(__dirname + '/keys/private.key'),
    cert: fs.readFileSync(__dirname + '/keys/certificate.crt'),
    ca: fs.readFileSync(__dirname + '/keys/ca_bundle.crt'),
};

//var http_server = http.createServer(async function (req, res) {
   // res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
   // res.end();
//}).listen(80, function (err) { });

//https.createServer(options, app).listen(443);

http.createServer(app).listen(80);