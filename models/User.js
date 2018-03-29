const mongoose = require('mongoose');
const { Schema } = mongoose;

const UserSchema = new Schema({
  firstname: {
    type: String,
    required: true
  },
  lastname: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  }
});

UserSchema.methods.testMethod = function() {
  console.log('using schema methods');
}

module.exports = mongoose.model('users', UserSchema);
