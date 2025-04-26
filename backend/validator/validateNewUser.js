
const validateUser = (name, email, phoneNumber, password) => {
    const errors = {};
    if (!name || name.trim().length < 2) {
      errors.name = "Name must be at least 2 characters long.";
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email || !emailRegex.test(email)) {
      errors.email = "Invalid email address.";
    }
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneNumber || !phoneRegex.test(phoneNumber)) {
      errors.phoneNumber = "Invalid phone number. Must be 10 digits.";
    }
    if (!password || password.length < 6) {
      errors.password = "Password must be at least 6 characters long.";
    }
  
    const isValid = Object.keys(errors).length === 0;
  
    return { isValid, errors };
  };
  
  module.exports = validateUser;
  