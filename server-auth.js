const AuthStrategy = require("passport-local").Strategy;
const bcrypt = require("bcrypt");

function initialize(passport, getUser, getUserId) {
  const authenticator = async (email, password, done) => {
    const user = getUser(email);
    if (user == null) {
      return done(null, false, { message: "Credentials not Found!" });
    }
    try {
      if (await bcrypt.compare(password, user.password)) {
        return done(null, user);
      } else {
        return done(null, false, { message: "Credetials not Found!" });
      }
    } catch (e) {
      return done(e);
    }
  };
  passport.use(new AuthStrategy({ usernameField: "email" }, authenticator));
  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser((id, done) => {
    return done(null, getUserId(id));
  });
}

module.exports = initialize;
