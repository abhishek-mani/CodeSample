// Sign up Validations

const register = (req, res, next) => {
  req.check('fullName', 'Enter a valid Name.').notEmpty().isString();
  req.check('email', 'Enter a valid email address.').isEmail();
  req.check('userType', 'Enter a valid user type.').notEmpty().isString();
  req.check('facebookLogin', 'Enter a valid user type.').notEmpty();
  if (req.body.facebookLogin === true) {
    req.check('facebookId', 'Facebook Id is missing.').notEmpty();
  }
  if (req.body.facebookLogin === false) {
    req.check('password', 'Enter a valid password.').notEmpty().isString();
  }
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};

// Login Validations
const login = (req, res, next) => {
  req.check('email', 'Enter a valid email address.').isEmail();
  req.check('password', 'Enter a valid password.').notEmpty().isString();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};

// Forgot Password Validations
const forgotPassword = (req, res, next) => {
  req.check('email', 'Enter a valid email address.').isEmail();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};

// Update User Profile
const updateUserProfile = (req, res, next) => {
  if (req.body.fullName) req.check('fullName', 'Enter a valid Name.').isString();
  if (req.body.email) req.check('email', 'Enter a valid email address.').isEmail();
  if (req.body.password) req.check('password', 'Enter a valid password.').isString();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};
// Get User Profile Validations
// const getUserProfile = (req, res, next) => {
//   req.check('email', 'Enter a valid email address.').isEmail();
//   const errors = req.validationErrors();
//   if (errors) {
//     res.status(400).send({
//       status: 400,
//       success: false,
//       message: 'Bad Request',
//       error: errors,
//     });
//   }
//   next();
// };

// Create New Trip
const createTrip = (req, res, next) => {
  req.check('tripName', 'Trip Name cannot be Empty.').notEmpty().isString();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};

// Get Trip Preferences By Id
const tripById = (req, res, next) => {
  req.check('tripId', 'Trip Id cannot be Empty.').notEmpty().isString();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};

// Create Trip Itinerary
const createTripItinerary = (req, res, next) => {
  req.check('tripPreferencesId', 'Trip Preference Id cannot be Empty.').notEmpty().isString();
  const errors = req.validationErrors();
  if (errors) {
    res.status(400).send({
      status: 400,
      success: false,
      message: 'Bad Request',
      error: errors,
    });
  } else next();
};


module.exports = {
  register,
  login,
  forgotPassword,
  updateUserProfile,
  // getUserProfile,
  createTrip,
  tripById,
  createTripItinerary,
};
