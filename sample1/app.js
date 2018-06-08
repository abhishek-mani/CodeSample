var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var CampaignMailController = require('./controller/campaignMailCotroller');
var UserController = require('./controller/userController');
var http = require('http');
// var cron = require('node-cron');
var CronJob = require('cron').CronJob;
var app = express();
var nodemailer = require('nodemailer');
var morgan = require('morgan')

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended: false}));
app.use(bodyParser.json()); // Body parser use JSON data
app.use(morgan('combined'))

var port = normalizePort(process.env.PORT || '3050');
app.set('port', port);
var server = http.createServer(app);

var mailAccountUser = '*****@******.com';
var mailAccountPassword = '*********';

var transport = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,//465,
    secure: false,
    tls: {rejectUnauthorized: false},
    //service: 'gmail',
    auth: {
        user: mailAccountUser,
        pass: mailAccountPassword
    }
    , logger: true
});

var mysql = require('mysql');
var constantData = require('./constants/connection');
var query = require('./bl_manager/query');
var pool = new mysql.createPool(constantData.dbConnection);

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);


function onListening() {
    var addr = server.address();
    var bind = typeof addr === 'string'
        ? 'pipe ' + addr
        : 'port ' + addr.port;
    console.error("Server started on port", addr.port, addr.address);

}

function onError() {
    console.error("Unable to start server");
}

function normalizePort(val) {
    var port = parseInt(val, 10);

    if (isNaN(port)) {
        return val;
    }
    if (port >= 0) {
        return port;
    }
    return false;
}
//
var job = new CronJob({
    cronTime: '00 00 21 * * *',// '00 30 11 * * 1-5', .//00 01 23 * * *
    onTick: function (req, res) {

        UserController.getUserAccount( function (userAccountResponse) {
            if (userAccountResponse.length > 0) {
                let i = 1;
                userAccountResponse.forEach((user) => {
                    console.log(user);

                    // req.body.user = user;
                    setTimeout(() => {
                        CampaignMailController.getReport(user, res);
                    }, i++ * 10000)
                })
            }
        });

    },
    start: false
});
job.start();

var job1 = new CronJob({
    cronTime: '00 00 22 * * *',// '00 30 11 * * 1-5', .//00 01 23 * * *
    onTick: function (req, res) {
        CampaignMailController.getReportFile(req, res);
    },
    start: false
});
job1.start();




// job.stop();
//

// let task = cron.schedule('* * * * *', function (req, res) {
//     console.log("<---- Cron Execution Started * */60 * * * running after 1 minute ---->");
//     UserController.getUserAccount(function (err, userAccountResponse) {
//         userAccountResponse.forEach((user) => {
//             req.body.user = user;
//             setTimeout(() => {
//                 CampaignMailController.getReport(req, res);
//             }, 100000)
//         })
//
//     })
// });
//
// task.stop();

app.use(function (req, res, next) { // new changes
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept,Token");
    next();
});

app.all('/*', function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});

// app.get('/report', function (req, res) {
//     CampaignMailController.getReportFile(req, res);
// });

// app.get('/campaign-report', function (req, res) {
//     CampaignMailController.getReport(req, res);
// });

app.get('/', function (req, res) {
    return res.json({"hello": "hey i m running..."});
});

app.get('/dataCount', function (req, res) {
    query.dataCount(pool, req, res);
});

app.post('/user', function (req, res) {
    UserController.addUser(req, res);
});

app.post('/update-user', function (req, res) {
    UserController.updateUser(req, res);
});

app.get('/user', function (req, res) {
    UserController.getUser(req, res);
});

app.delete('/user/:id/:pwd', function (req, res) {
    UserController.removeUser(req, res);
});

app.post('/getReportData', function (req, res) {
    console.log("getReportData calling");
    query.getReportData(pool, req, res);
});

app.post('/search', function (req, res) {
    query.search(pool, req, res);
});

app.post('/searchResultCount', function (req, res) {
    query.searchResultCount(pool, req, res);
});

app.post('/importData', function (req, res) {
    query.importData(pool, req, res);
});

app.get("/sendEmail", function (req, res) {
    query.sendEmail(pool, req, res, transport);
});








