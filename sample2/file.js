import formidable from 'formidable/index';
import path from 'path';
import fs from 'fs';
import Utility from '../utility/reponse';
import Constant from '../utility/constants';
import {Answer} from "../models/answer";
import {Questionnaire} from "../models/questionnaire";

module.exports = {

    uploadMedia: function (req, res) {

        const serverUrl = req.protocol + '://' + req.get('host');
        const form = new formidable.IncomingForm();
        form.keepExtensions = true;
        const destinationPath = path.resolve(`./public/uploads`);
        form.parse(req, function (err, fields, files) {
            const mediaUrl = destinationPath + '/' + files.file.name
            console.log(serverUrl)
            fs.copyFile(files.file.path, mediaUrl, (err) => {

                if (err)
                    Utility.response(res, err, Constant.MESSAGE.UNABLE_TO_UPLOAD_MEDIA, Constant.RESPONSE_FAILURE);

                Utility.response(res, serverUrl + '/public/uploads/' + files.file.name, Constant.MESSAGE.MEDIA_UPLOADED_SUCCESSFULLY, Constant.RESPONSE_SUCCESS);
            });
        });
    }
};