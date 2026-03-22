const Joi = require('joi');
const Validator = require('validator');
const { CustomAPIError } = require('./customError');

const signupSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  emailId: Joi.string().required(),
  password: Joi.string().required(),
  age: Joi.number().min(18).optional(),
  profileImage: Joi.string().optional(),
  about: Joi.string().optional(),
  skills: Joi.array().optional(),
  gender: Joi.string().optional(),
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

const profileEditSchema = Joi.object({
  firstName: Joi.string().required(),
  lastName: Joi.string().required(),
  age: Joi.number().min(18),
  profileImage: Joi.string(),
  about: Joi.string().optional(),
  skills: Joi.array().optional(),
  gender: Joi.string().optional(),
});

const validateProfileEdit = (req, res, next) => {
  const profileEditRequest = req.body;
  try {
    const { error } = profileEditSchema.validate(profileEditRequest);
    if (error) {
      res.status(400).send({ status: 400, message: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    throw new CustomAPIError(
      'validateProfileEdit',
      'Error while validating profile edit request: ' + error.message,
      error.statusCode,
    );
  }
};

const profileEditPasswordSchema = Joi.object({
  currentPassword: Joi.string().required(),
  newPassword: Joi.string().required(),
  confirmPassword: Joi.ref('newPassword'),
});

const validateEditPassword = (req, res, next) => {
  const profileEditPasswordRequest = req.body;
  try {
    const { error } = profileEditPasswordSchema.validate(profileEditPasswordRequest);
    if (error) {
      res.status(400).send({ status: 400, message: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    throw new CustomAPIError(
      'validateEditPassword',
      'Error while validating profile password edit request: ' + error.message,
      error.statusCode,
    );
  }
};

const sendConnectionRequestSchema = Joi.object({
  fromUserId: Joi.string().required(),
  toUserId: Joi.string().invalid(Joi.ref('fromUserId')).required(),
  status: Joi.string().allow('ignored', 'interested'),
});

const validateSendConnectionRequest = (req, res, next) => {
  const { toUserId, status } = req.params;
  const { _id } = req.user;
  const sendConnectionRequest = {
    fromUserId: String(_id),
    toUserId,
    status,
  };
  try {
    const { error } = sendConnectionRequestSchema.validate(sendConnectionRequest);
    if (error) {
      res.status(400).send({ status: 400, message: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    throw new CustomAPIError(
      'validateSendConnectionRequest',
      'Error while validating connection request: ' + error.message,
      error.statusCode,
    );
  }
};

const reviewConnectionRequestSchema = Joi.object({
  status: Joi.string().allow('accepted', 'rejected'),
});

const validateReviewRequest = (req, res, next) => {
  const { status } = req.params;
  try {
    const { error } = reviewConnectionRequestSchema.validate({ status });
    if (error) {
      res.status(400).send({ status: 400, message: error.details[0].message });
    } else {
      next();
    }
  } catch (error) {
    throw new CustomAPIError(
      'validateReviewRequest',
      'Error while validating connection request: ' + error.message,
      error.statusCode,
    );
  }
};

module.exports = {
  validateSignUp,
  validateProfileEdit,
  validateEditPassword,
  validateSendConnectionRequest,
  validateReviewRequest,
};
