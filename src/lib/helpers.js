const bcrypt = require('bcryptjs');
const {delimiterRegexp} = require('../keys.js');
const helpers = {};

helpers.encryptPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    return hashedPassword;
};

helpers.matchPassword = async (password, savedPassword) => {
  try {
     return await bcrypt.compare(password, savedPassword);
  } catch(e) {
      console.log(e);
      return false;
  }
};

helpers.matchTweetCondition = (tweet) => {
    var match = delimiterRegexp.exec(tweet);
    if (match === null)
        return false;
    else
        return true;
};

module.exports = helpers;