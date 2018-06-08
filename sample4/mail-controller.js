const DBManager = require('../db_manager/db_manager')
const Utility = require('../utility/utility');

module.exports = {

    getAllMailById: function (req, res) {

        if (!req.body)
            return res.send(400);
        const reqObj = {
            currentdate: Utility.currentDate(),
            id: req.body.id
        };

        DBManager.getMailById(reqObj, function (getMailByIdResponse) {
            if (getMailByIdResponse === undefined || getMailByIdResponse.length == 0) {
                return res.send({id: req.body.id, revoke: 1, encrypt_key: req.body.id})
            }
            else {
                var responseObject = {

                    id: getMailByIdResponse[0].id,
                    sender_email: getMailByIdResponse[0].to_email,
                    from_email: getMailByIdResponse[0].from_email,
                    compose_body: Utility.decrypt(getMailByIdResponse[0].encrypt_key, getMailByIdResponse[0].compose_body),
                    encrypt_key: getMailByIdResponse[0].encrypt_key,
                    revoke: getMailByIdResponse[0].revoke_status,
                    // cron: getMailByIdResponse[0].cron_status,
                    option: getMailByIdResponse[0].option_email,
                    emaildt: getMailByIdResponse[0].email_date,
                    subject_email: getMailByIdResponse[0].subject_email,
                    // optioncron: getMailByIdResponse[0].optioncron,
                    gemail: global.email
                }
                res.send(responseObject)
            }
        })
    },

    encryptMail: function (req, res) {
        if (!req.body)
            return res.send(400);

        const encryptId = Utility.s4() + Utility.s4() + Utility.s4() + Utility.s4() +
            Utility.s4() + Utility.s4() + Utility.s4() + Utility.s4();

        if (req.body.compose_body != undefined) {
            const encryptedText = Utility.encrypt(encryptId, req.body.compose_body);

            res.send({
                'key': encryptedText,
                'id': encryptId,
                'verification_code': Utility.generateCode()
            });
        }
    },

    revokeEmail: function (req, res) {

        const composeUser = {
            revoke_status: req.body.revoke,
            id: req.body.id
        };

        if (!req.body)
            return res.send(400);

        DBManager.revokeMailData(composeUser, function (revokeMailResponse) {

            if (revokeMailResponse === undefined || revokeMailResponse.length == 0) {
                return res.send(400)
            }
            else {
                const responseObj = {
                    revoke: revokeMailResponse[0].revoke_status
                }
                res.send(responseObj);
            }
        })
    },

    saveMail: function (req, res) {
        var current = req.body.current_date;
        const optionEmail = req.body.option_email;
        var expires_at = null;
        if (!req.body)
            return res.send(400);
        if (optionEmail > 0) {
            var dateCron = null;
            expires_at = Utility.expiresAt(optionEmail);
        }

        var optionFinal, send;
        if (optionEmail == 1) {
            optionFinal = 1;
        } else if (optionEmail == 2) {
            optionFinal = 24;
        } else if (optionEmail == 3) {
            optionFinal = 168;
        }
        if (req.body.sender_email != '') {
            send = req.body.sender_email;
        } else {
            send = '';
        }

        const compose = {
            compose_body: req.body.compose_body,
            to_email: send,
            encrypt_key: req.body.encrypt_key,
            email_date: dateCron,
            expires_at: expires_at,
            option_email: optionFinal,
            from_email: req.body.from_email,
            subject_email: req.body.subject_email,
            verification_code: req.body.verification_code
        };
        DBManager.saveMailData(compose, function (saveMailDataResponse) {

            if (saveMailDataResponse === undefined || saveMailDataResponse.length == 0) {
                return res.send(400);
            }
            else {
                res.json({
                    "results": saveMailDataResponse.insertId
                });
            }
        })
    },
    showMessageByCode: function (req, res) {
        const code = req.body.verification_code;
        const publickey = req.body.publickey;
        const reqObj = {
            currentdate: Utility.currentDate(),
            id: req.body.publickey
        };
        DBManager.getMailById(reqObj, function (getMailByIdResponse) {
            let compose = "Invalid code entered!", subject = "Error!";
            if (getMailByIdResponse === undefined || getMailByIdResponse.length == 0) {
                compose = "Email Expired / Revoked by Sender!";
                subject = "Error!";
            }
            else if (getMailByIdResponse[0].verification_code == code) {
                compose = Utility.decrypt(getMailByIdResponse[0].encrypt_key, getMailByIdResponse[0].compose_body)
                subject = getMailByIdResponse[0].subject_email;
            }
            else {
                compose = "Invalid code entered!";
                subject = "Error!";
            }

            var decryptedContent = "<html>" +
            "<head>" +
            "    <meta http-equiv='Content-Type' content='text/html; charset=utf-8' />" +
            "    <meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
            "    <title>Dmail</title>" +
            "    <link rel='stylesheet' href='css/style.css' type='text/css'>" +
            "    <script src='view/jquery.js'></script>" +
            "</head>" +
            "<body>" +
            "<div id='inner-wp'>" +
            "    <div class='box' id='web-view-container'>" +
            "        <div id='message-body-container'>" +
            "            <div id='message-body' class='error'>" +
            "                <h2 id='subject'>" + subject + "</h2>" +
            "                <p id='compose'>"+ compose +"</p>" +
            "            </div>" +
            "            <div id='message-body-footer'>" +
            "                <div> <span id='message-body-footer-message'>Secure and encrypted email sent with Dmail</span> <span id='message-body-footer-lock-icon'></span> </div>" +
            "            </div>" +
            "        </div>" +
            "        <div id='webview-footer'> <a href='https://dmail.io' class='get-dmail' target='_blank'>Install Chrome Extension</a> <br>" +
            "          <img id='footer-logo' src='https://app.dmail.io/img/header_logo.png' height='35'/></div>" +
            "    </div>" +
            "</div>" +
            "</body>" +
            "</html><script type='text/javascript'>";
             //decryptedContent += '$("#subject").text("' + subject + '")</script>';
            res.write(decryptedContent);
            res.end();
        })
    }
};
