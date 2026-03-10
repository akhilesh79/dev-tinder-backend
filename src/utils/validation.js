const Joi = require('joi');
const Validator = require('validator');
const { CustomAPIError } = require('./customError');

const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  emailId: Joi.string().required(),
  password: Joi.string().required(),
  age: Joi.number().min(18),
  profileImage: Joi.string(),
  about: Joi.string(),
  skills: Joi.array().optional(),
  gender: Joi.string(),
});

const validateSignUp = (req, res, next) => {
  const signupRequest = req.body;
  const { emailId, password } = signupRequest;

  try {
    if (!Validator.isEmail(emailId)) {
      throw new CustomAPIError('validateSignUp', 'EmailId is not Valid', 400);
    }

    if (!Validator.isStrongPassword(password)) {
      throw new CustomAPIError('validateSignUp', 'Given Password is not strong', 400);
    }
    const { error } = signupSchema.validate(signupRequest);
    if (error) {
      res.status(400).send({ status: 400, message: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    throw new CustomAPIError(
      'validateSignUp',
      'Error while validation signup request: ' + error.message,
      error.statusCode,
    );
  }
};

module.exports = {
  validateSignUp,
};
