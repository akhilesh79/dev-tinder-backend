const mongoose = require('mongoose');
const Validator = require('validator');
const { generateToken } = require('../utils/jwt');
const { Schema } = mongoose;
const Bcrypt = require('bcrypt');

const userSchema = new Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: 3,
    },
    lastName: {
      type: String,
      required: true,
    },
    emailId: {
      type: String,
      unique: true,
      required: true,
      lowercase: true,
      trim: true,
      validate(value) {
        if (!Validator.isEmail(value)) {
          throw new Error('EmailId is not valid');
        }
      },
    },
    profileImage: {
      type: String,
      default:
        'https://png.pngtree.com/png-clipart/20230927/original/pngtree-man-avatar-image-for-profile-png-image_13001882.png',
      validate(value) {
        if (!Validator.isURL(value)) {
          throw new Error(`Profle Image is not valid`);
        }
      },
    },
    password: {
      type: String,
      required: true,
      validate(value) {
        if (!Validator.isStrongPassword(value)) {
          throw new Error('Password entered is not strong');
        }
      },
    },
    age: {
      type: Number,
      min: 18,
    },
    gender: {
      type: String,
      validate(value) {
        if (!['male', 'female', 'others'].includes(value)) {
          throw new Error('Gender is not valid');
        }
      },
    },
    about: {
      type: String,
      default: 'This is default description about a developer',
    },
    skills: {
      type: [String],
    },
    isPremiumUser: {
      type: Boolean,
      default: false,
    },
    validity: {
      type: Date,
      default: null,
    },
    mememberShipType: {
      type: String,
    },
  },
  { timestamps: true },
);

userSchema.methods.getJWT = function () {
  const user = this;
  const token = generateToken({ _id: user._id }, process.env.JWT_SECRET_ID, { expiresIn: '7d' });
  return token;
};

userSchema.methods.validatePassword = async function (passwordInputByUser) {
  const user = this;
  const passwordHash = user.password;
  const isValidPassword = await Bcrypt.compare(passwordInputByUser, passwordHash);
  return isValidPassword;
};

const User = mongoose.model('User', userSchema);
module.exports = User;
