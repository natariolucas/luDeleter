const bcrypt = require('bcryptjs');

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

module.exports = helpers;