const User = require('../model/userSchema');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const config = require('../config');
const sendEmail = require('../sendEmail');
const path = require('path');
const fs = require('fs');
const uploadDir = '/uploads/image_';

module.exports = {
  // Register New User
  register: (req, res) => {
    let hashedPassword = '';
    if (req.body.facebookLogin === true) {
      const password = Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 8);
      hashedPassword = bcrypt.hashSync(password, 8);
    } else {
      hashedPassword = bcrypt.hashSync(req.body.password, 8);
    }
    const newUser = new User(req.body);
    newUser.password = hashedPassword;
    User.find({ email: req.body.email }).then((user) => {
      if (user.length === 0) {
        newUser.register().then(
          (result) => {
            const existingUser = result.toObject();
            delete existingUser.password;
            const token = jwt.sign({ id: existingUser._id }, config.secret, {
              expiresIn: 86400, // expires in 24 hours
            });
            existingUser.token = token;
            sendEmail.welcomeEmail(existingUser);
            res.status(201).send({ status: 201, success: true, data: existingUser, message: 'User Successfully Created' });
          }).catch(() => {
            res.status(500).send({ status: 500, success: false, message: 'Internal Server Error' });
          });
      } else if (user.length > 0 && req.body.facebookLogin) {
        const existingUser = user[0].toObject();
        delete existingUser.password;
        const token = jwt.sign({ id: existingUser._id }, config.secret, {
          expiresIn: 86400, // expires in 24 hours
        });
        existingUser.token = token;
        res.status(422).send({ status: 422, success: true, message: 'User Already Exists', data: existingUser });
      } else if (user.length > 0 && !req.body.facebookLogin) {
        res.status(422).send({ status: 422, success: false, message: 'User Already Exists' });
      }
    });
  },
  userlist: (req, res) => {
    User.find({}, ((err, result) => {
      res.send({ res: result });
    })
    );
  },

  // Retrieve Password
  forgotPassword: (req, res) => {
    User.findOne({ email: req.body.email }).then((data) => {
      if (data) {
        const password = Math.floor(100000 + (Math.random() * 900000));
        const hashedPassword = bcrypt.hashSync(`${password}`, 8);
        User.findOneAndUpdate({ email: req.body.email }, { password: hashedPassword }).then(() => {
          sendEmail.sendEmail(data, password);
          res.status(200).send({ status: 200, success: true, message: 'Password Sent to the Email' });
        }).catch(() => {
          res.status(500).send({ status: 500, success: false, message: 'Internal Server Error' });
        });
      } else {
        res.status(404).send({ status: 404, success: false, message: 'Email Id Not Found' });
      }
    }, (err) => {
      res.status(500).send({ status: 500, success: false, message: 'Internal Server Error', error: err });
    }).catch((err) => {
      res.status(500).send({ status: 500, success: false, message: 'Internal Server Error', error: err });
    });
  },

  // Get User Profile
  getUserProfile: (req, res) => {
    const userData = req.user.toObject();
    /* eslint no-underscore-dangle: 0 */
    delete userData._id;
    delete userData.password;
    res.status(200).json({ status: 200, auth: true, success: true, data: userData });
    // User.findOne({ email: req.body.email }).then((data) => {
    //   if (data) {
    //     const userData = data.toObject();
    //     /* eslint no-underscore-dangle: 0 */
    //     delete userData._id;
    //     delete userData.password;
    //     res.status(200).json({ status: 200, auth: true, success: true, data: userData });
    //   }
    // }, (err) => {
    //   res.status(500).send({ auth: true, status: 500, success: false, message: 'Internal Server Error', error: err });
    // }).catch((err) => {
    //   res.status(500).send({ auth: true, status: 500, success: false, message: 'Internal Server Error', error: err });
    // });
  },

  // Update User Profile
  updateUserProfile: (req, res) => {
    let userData = req.user.toObject();
    let hashedPassword = '';
    if (req.body.password) {
      hashedPassword = bcrypt.hashSync(req.body.password, 8);
      req.body.password = hashedPassword;
    }
    User.findOneAndUpdate({ email: userData.email }, req.body, { new: true }).then((data) => {
      if (data) {
        userData = data.toObject();
        /* eslint no-underscore-dangle: 0 */
        delete userData._id;
        delete userData.password;
        res.status(200).json({ status: 200, auth: true, success: true, data: userData });
      }
    }, (err) => {
      res.status(500).send({ auth: true, status: 500, success: false, message: 'Internal Server Error', error: err });
    }).catch((err) => {
      res.status(500).send({ auth: true, status: 500, success: false, message: 'Internal Server Error', error: err });
    });
  },

  // Update Profile Picture
  uploadProfilePic: (req, res) => {
    const timestamp = `${Date.now()}.${req.file.picture.type.substring(6)}`;
    const destinationPath = path.resolve(`./server${uploadDir}${timestamp}`);
    fs.copyFile(req.file.picture.path, destinationPath, (err) => {
      if (err) {
        res.status(500).send({ auth: true, status: 500, success: false, message: 'Image upload failed', error: err });
      } else {
        User.findOneAndUpdate({ email: req.user.email }, { picture: config.base_URL + uploadDir + timestamp }, { new: true }).then((data) => {
          if (data) {
            const userData = data.toObject();
            /* eslint no-underscore-dangle: 0 */
            delete userData._id;
            delete userData.password;
            res.status(200).json({ status: 200, auth: true, success: true, data: userData });
          }
        });
      }
    });
  },
};
