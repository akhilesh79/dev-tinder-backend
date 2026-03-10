const mongoose = require('mongoose');
const Validator = require('validator');
const { Schema } = mongoose;

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
  },
  { timestamps: true },
);

const User = mongoose.model('User', userSchema);
module.exports = User;
