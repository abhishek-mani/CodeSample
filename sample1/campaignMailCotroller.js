var express = require('express');
var router = express.Router();
var fs = require('fs'), fileStream;
const download = require('download');
const csv = require('csvtojson');
var converter = require('json-2-csv');
const empty = require('empty-folder');
const APP_CONSTANT = require('../constants/constants');
var Promise = require('promise');
var query = require('../bl_manager/query');
var mysql = require('mysql');
var constantData = require('../constants/connection');
var pool = new mysql.createPool(constantData.dbConnection);


// /* GET users listing. */
module.exports = {

    getReport: function (req, res) {
        var queryDate = getRequestDate();

        var Imap = require('imap'),
            inspect = require('util').inspect;

        var imap = new Imap({
            user: req.email,
            password: req.password,
            host: APP_CONSTANT.HOSTNAME,
            port: APP_CONSTANT.PORT_NUMBER,
            tls: true
        });

        function openInbox(cb) {
            imap.openBox("GMass Reports/[CAMPAIGNS]", true, cb);
        }

        imap.once('ready', function () {
            openInbox(function (err, box) {
                if (err) throw err;
                imap.search(['ALL', ['SINCE', queryDate], ['SUBJECT', 'GMass Campaign Report']], function (err, results) {
                    if (err) throw err;
                    if (results.length < 1) {
                        return;
                    }
                    var f = imap.fetch(results, {bodies: ''});
                    f.on('message', function (msg, seqno) {
                        msg.on('body', function (stream, info) {
                            stream.pipe(fs.createWriteStream('mails/' + 'msg-' + seqno + '-body.txt'));
                        });

                        msg.once('end', function () {

                        });
                    });
                    f.once('error', function (err) {
                        console.log('Fetch error: ' + err);
                    });
                    f.once('end', function () {
                        console.log('Done fetching all messages!');
                        // createCSVFile();
                        imap.end();

                    });
                });
            });
        });


        imap.once('error', function (err) {
            // console.log("*************************");
            console.log(err);
            // console.log("*************************");
        });

        imap.once('end', function () {
            // console.log('Connection ended');
        });

        imap.connect();

    },
    getReportFile: function (req, res) {
        createCSVFile();
    }
}


function getJSONFromCSV(file, callback) {
    var arr = [];
    csv().fromFile(file)
        .on('json', (jsonObj) => {
            arr.push(jsonObj);
        })
        .on('done', (error) => {
            console.log(error);
            console.log("done");
            callback(arr);
        });
}

function getParsedJSONFromCSV(file, callback) {
    var parsedArray = [];
    csv().fromFile('./Downloads/' + file)
        .on('json', (jsonObj) => {
            var id = file.match(/\d/g);
            id = parseInt(id.join(""));

            var dataObj = jsonObj;
            dataObj = Object.assign({'campaignId': id}, dataObj);
            parsedArray.push(dataObj);
        })
        .on('done', (error) => {
            console.log("done");
            callback(parsedArray);
        });
}

function downloadFile(docURL) {
    return download(docURL, 'Downloads').then((data) => {
        console.log('<---- Downloads Completed! ---->');
        return true;
    }, (err) => {
        console.log('<---- Not Downloaded ! ---->', err);
        return false;
    });
}

function getDecodedUrl(httpIndex, decodedString, callback) {
    var docURL = "";
    // for (var i = httpIndex + 1; i < decodedString.length; i++) {
    for (var i = httpIndex; i < decodedString.length; i++) {
        if (decodedString[i] != "'") {
            docURL += decodedString[i];
        }
        else
            break;
    }
    callback(docURL);
}

function getRequestDate() {
    /**********************************
     * Getting current date to query mails
     **********************************/
    var monthNames = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
    var currentDate = new Date();
    var primaryDate = monthNames[currentDate.getMonth()] + " " + currentDate.getDate() + ", " + currentDate.getFullYear();
    // console.log("primaryDate--------------------------------------------------->", primaryDate);
    var query = 'APR 5, 2018';
    console.log("queryDate--------------------------------------------------->", primaryDate);
    // return primaryDate;

    return query;
}

function readFile(filename, enc) {
    return new Promise(function (fulfill, reject) {
        fs.readFile(filename, enc, function (err, res) {
            if (err) {
                console.log(err);
                reject(err);
            }
            else {
                fulfill(res);
                // console.log(res);
            }
        });
    });
}

function writeFile(filename, content) {
    return new Promise(function (fulfill, reject) {
        fs.writeFile(filename, content, function (err, res) {
            if (err) reject(err);
            else fulfill(res);
        });
    });
}

function appenFile(filename, content) {
    return new Promise(function (fulfill, reject) {
        fs.appendFile(filename, content, function (err, res) {
            if (err) reject(err);
            else fulfill(res);
        });
    });
}

function emptyDirectory(dirName) {
    return new Promise(function (fulfill, reject) {
        empty('./' + dirName, false, function (err, res) {
            if (err)
                reject(false);
            else
                fulfill(true);
        });
    });
}

function readDirectory(dirName) {
    return new Promise(function (fulfill, reject) {
        fs.readdir('./' + dirName, function (err, files) {
            if (err)
                reject(err);
            else
                fulfill(files);
        });
    });
}

function removeComma() {
    readDirectory('Downloads').then(readDirectorySuccessCallback, readDirectoryFailureCallback);
}

function readDirectorySuccessCallback(files) {
    console.log(files)
    var dataArray = [], dArray;
    var contentArray = [];
    var count = 0;
    // getJSONFromCSV('./Output/Campaign-Report.csv', function (err, res) {
    //     console.log(res + "res");
    //     if (err) {
    //         dataArray = [];
    //     } else
    //         dataArray = [];
    dataArray = [];
    var finalArr = [];
    // console.log(typeof err + "***********dataArray");
    // console.log(err + "***********dataArray");
    // console.log(res + "***********res");
    files.forEach(function (file) {
        // console.log("NUMBER OF FILE" + files);

        readFile('./Downloads/' + file, 'UTF-8').then((fileContent) => {

            var parseFileData = fileContent.toString();

            /**Replacing all comma(,) from sentence**/
            parseFileData = parseFileData.replace(/, /g, '|');

            writeFile('./Downloads/' + file, parseFileData).then((data) => {
                console.log("Written Completed");
                // console.log(data);

                getParsedJSONFromCSV(file, function (jsonArray) {

                    // console.log(jsonArray)
                    dataArray = dataArray.concat(jsonArray);

                    // dataArray.reverse();
                    dArray = dataArray.filter(function (a) {
                        var key = a.emailaddress + '|' + a.campaignId;
                        if (!this[key]) {
                            this[key] = true;
                            return true;
                        }
                    }, Object.create(null));
                    // contentArray = contentArray.concat(dArray);
                    count++;
                    // console.log(dArray);
                    console.log("count" + count);
                    // finalArr.concat(dArray);
                    dataArray.concat(dArray);
                    if (count == files.length) {

                        // converter.json2csv(JSON.stringify(dataArray), function (err, res) {
                        //     fs.writeFile('./Output/Campaign.csv', res, function (err, res) {
                        //             // res.send(dataArray)
                        //
                        //     });
                        // });
                        // res.send(dataArray);
                        console.log(dataArray);
                        query.insertReportData(pool, dataArray);
                        // console.log(dataArray)

                    }
                });

            }, (err) => {
                console.log(err)
            });
        }, (err) => {
            console.log(err);
        })

    }, (err) => {
        console.log(err)
    });
    // });
}


function readDirectoryFailureCallback(err) {
    console.log(err);
}


function createCSVFile() {
    // getJSONFromCSV('Campaign-Report.csv', function (err, res) {
    //     if (err)
    //         global.dataArray = [];
    //
    //     global.dataArray = res;
    emptyDirectory('./Downloads').then(successCallback, successCallback);
    // });
}

function successCallback() {
    readDirectory('./mails').then(
        function (mailFiles) {
            var downloadedFiles = 0;
            mailFiles = mailFiles.filter(function (val) {
                return val.indexOf("body") > 0
            })
            var i = 0;
            console.log("mailFiles--->>>", mailFiles.length)
            // for (var i = 0; i < mailFiles.length; i++) {
            var intervalId = setInterval(function () {
                readFile('./mails/' + mailFiles[i++], 'UTF-8').then(function (decodedString) {

                    var httpIndex = decodedString.toString().indexOf("https");
                    // console.log("http index ->>>>>>>>>>>", httpIndex)
                    var campaignIndexStart = decodedString.toString().indexOf("GMass Campaign ID:");
                    var campaignIndexEnd = decodedString.toString().indexOf("(Sent");
                    decodedString = decodedString.toString();

                    var campaignID = decodedString.substr(campaignIndexStart, campaignIndexEnd - campaignIndexStart + 1);
                    campaignID = campaignID.match(/\d/g);
                    campaignID = campaignID.join("");
                    // console.log("campaignID==-=-=-=-=-=-=->>", campaignID)

                    getDecodedUrl(httpIndex, decodedString, function (docURL) {
                        console.log(docURL);
                        downloadFile(docURL).then((result) => {
                            console.log(result);
                            downloadedFiles++;
                            console.log(downloadedFiles, "mailFiles.length++++++++++", mailFiles.length);
                            removeComma();
                            if (downloadedFiles == mailFiles.length) {
                                console.log("Interval cleared")
                                clearInterval(intervalId);

                            }
                        }, (err) => {
                            console.log(err);
                        });
                    });
                });
            }, 8000)
            // }
        },
        function (err) {
            console.log(err);
        });
}