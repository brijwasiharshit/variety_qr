const validateLogin = (email,password) => {
const errors = {};
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!email || !emailRegex.test(email)) {
  errors.email = "Invalid email address.";
}
const isValid = Object.keys(errors).length === 0;
return {isValid,errors}
}
module.exports = validateLogin;