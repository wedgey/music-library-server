// Import Passport, strategies and config
const passport = require('passport'),
      User = require('../models/user'),
      config = require('./main'),
      JwtStrategy = require('passport-jwt').Strategy,
      ExtractJwt = require('passport-jwt').ExtractJwt,
      LocalStrategy = require('passport-local'),
      AnonymousStrategy = require('passport-anonymous').Strategy;

const localOptions = { usernameField: 'email' };

// Set up local login strategy
const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    User.findOne({ email: email.toLowerCase().trim() }, function(err, user) {
        if (err) { done(err); }
        if (!user) { return done(null, false, { data: 'Your login details could not be verified.' }); }

        user.comparePassword(password, function(err, isMatch) {
            if (err) { return done(err); }
            if (!isMatch) { return done(null, false, { data: "Your login details could not be verified." }); }

            return done(null, user);
        });
    });
});

const jwtOptions = {
    // Tell Passport to check authorization headers for JWT
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: config.secret
};

// Set up JWT login strategy
const jwtLogin = new JwtStrategy(jwtOptions, function(payload, done) {
    User.findById(payload._id, function(err, user) {
        if (err) { return done(err, false); }

        if (user) {
            done(null, user);
        } else {
            done(null, false);
        }
    });
});

// Set up Anonymous Strategy for optional login routes
const anonymousStrategy = new AnonymousStrategy();

// Allow passport to use the strategies we defined
passport.use(jwtLogin);
passport.use(localLogin);
passport.use(anonymousStrategy);