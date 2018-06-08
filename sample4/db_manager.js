const mysql = require('mysql');


const con = mysql.createPool({
    host: process.env.HOST ,
    port: process.env.DB_PORT,
    user: process.env.USERNAME ,
    password: process.env.PASSWORD ,
    database: process.env.DBNAME ,
    connectionLimit: 10,
    multipleStatements: true
});

module.exports = {

    getMailById: function (reqObj, callback) {
        console.log(reqObj);
        const query = "Select dmail_compose.* from dmail_compose where revoke_status = 0 and (expires_at is null or expires_at >= '"+reqObj.currentdate+"') and encrypt_key ='" + reqObj.id + "'";
        console.log(query);
        con.getConnection(function (err, connection) {
            connection.query(query, function (error, results, fields) {
                connection.release();
                if (error) {
                    console.log("error :----------------------", error);
                    callback(error);
                } else {
                    callback(results)
                }
            });
        });
    },
    revokeMailData: function (reqObj, callback) {

        var query = "UPDATE dmail_compose SET revoke_status = " + reqObj.revoke_status + " where encrypt_key = '" + reqObj.id + "'";

        con.getConnection(function (err, connection) {
            connection.query(query, function (error, results, fields) {
                connection.release();
                if (error) {
                    callback(error);
                } else {
                    var query = "Select * from dmail_compose where encrypt_key ='" + reqObj.id + "'";
                    con.getConnection(function (err, connection) {
                        connection.query(query, function (error, results, fields) {
                            connection.release();
                            if (error) {
                                callback(error);
                            } else {
                                callback(results);
                            }
                        });
                    });
                }
            });
        });
    },

    saveMailData: function (requestObj, callback) {
        con.getConnection(function (err, connection) {
            var query = 'INSERT INTO dmail_compose SET ?';

            connection.query(query, requestObj, function (error, results, fields) {
                connection.release();
                // Handle error after the release.
                if (error) {
                    callback(error);
                } else {
                    callback(results);
                }
            });
        });
    }
}
