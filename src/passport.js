/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/**
 * Passport.js reference implementation.
 * The database schema used in this sample is available at
 * https://github.com/membership/membership.db/tree/master/postgres
 */

import passport from 'passport';
import { OAuth2Strategy as GoogleStrategy } from 'passport-google-oauth';
import { User, UserLogin, UserClaim, UserProfile, Label } from './data/models';
import config from './config';

/**
 * Sign in with Google
 */

passport.use(new GoogleStrategy({
  clientID: config.auth.google.id,
  clientSecret: config.auth.google.secret,
  callbackURL: config.auth.google.returnURL,
  passReqToCallback: true,
}, (req, accessToken, refreshToken, params, profile, done) => {
  /* eslint-disable no-underscore-dangle */
  const loginName = 'google';
  const claimType = 'urn:google:access_token';
  // expiry time in milliseconds from 1970. expires_in param is given in seconds
  const expiryTime = (new Date()).getTime() + params.expires_in * 1000;
  const fooBar = async () => {
    if (req.user) {
      // is logged in
      const userLogin = await UserLogin.findOne({
        attributes: ['name', 'key'],
        where: { name: loginName, key: profile.id },
      });
      if (userLogin) {
        done(null, req.user);
      } else {
        // there is something wrong, destroy user session and logout
        req.user = null;
        req.logOut();
        req.session.destroy();
        done();
      }
    } else {
      const users = await User.findAll({
        attributes: ['id', 'email', 'refreshToken'],
        where: { '$logins.name$': loginName, '$logins.key$': profile.id },
        include: [
          {
            attributes: ['name', 'key'],
            model: UserLogin,
            as: 'logins',
            required: true,
          },
        ],
      });
      if (users.length) {
        // logged in before
        // TODO: check if a new refresh token is provided, if it is, replace the one in db
        // if new refresh token is provided, it means he previously revoked access and granted again
        console.log("should still be here");

        let rfToken = refreshToken;
        if (refreshToken) {
          // if refresh token is provided, it means he previously revoked access and granted again
          // replace the one in the db and save it.
          users[0].refreshToken = refreshToken;
          await users[0].save();
        } else {
          // if not, retrieve from the db
          rfToken = users[0].refreshToken;
        }
        console.log(rfToken);
        done(null, {
          id: users[0].id,
          email: users[0].email,
          accessToken: accessToken,
          refreshToken: rfToken,
          expiryTime: expiryTime,
        });
      } else {
        let user = await User.findOne({ where: { email: profile._json.email } });
        // should not find any user here
        console.log("there should not be any user");
        console.log(user);
        console.log(refreshToken);
        // new login, create new user, store refresh token
        // add default board and default label INBOX
        user = await User.create({
          email: profile.email,
          emailConfirmed: true,
          refreshToken: refreshToken,
          logins: [
            { name: loginName, key: profile.id },
          ],
          claims: [
            { type: claimType, value: accessToken },
          ],
          profile: {
            displayName: profile.displayName,
            gender: profile._json.gender,
            picture: profile._json.image.url,
          },
          labels: [
            { labelId: 'INBOX', position: 0 }
          ],
        }, {
          include: [
            { model: UserLogin, as: 'logins' },
            { model: UserClaim, as: 'claims' },
            { model: UserProfile, as: 'profile' },
            { model: Label, as: 'labels' },
          ],
        });
        console.log("here's the user")
        console.log(user);
        done(null, {
          id: user.id,
          email: user.email,
          accessToken: accessToken,
          refreshToken: refreshToken,
          expiryTime: expiryTime,
        });
      }
    }
  };
  fooBar().catch(done);
}))


passport.serializeUser(function(user, done) {
  console.log('serializing user: ');
  done(null, { id: user.id, expiryTime: user.expiryTime, accessToken: user.accessToken })
  // done(null, user)
});

passport.deserializeUser(function(user, done) {
  const id = user.id;
  const expiryTime = user.expiryTime;
  const accessToken = user.accessToken;

  User.find({
    attributes: ['id', 'email', 'refreshToken'],
    where: { id: id },
    include: ['labels'],
  })
    .then(currentUser => {
      const labelsArray = currentUser.labels.map(lbl=> {
        return { id: lbl.labelId, position: lbl.position }
      });
      labelsArray.sort((a, b) => {
        return a.position - b.position
      });
      const userToReturn = {
        id: currentUser.id,
        email: currentUser.email,
        expiryTime: expiryTime,
        accessToken: accessToken,
        refreshToken: currentUser.refreshToken,
        labels: labelsArray.map(lab => lab.id),
      };
      return done(null, userToReturn)
    })
});
export default passport;
