import express from 'express';
import config from './config';
import sequelize from './data/sequelize'
import { User, UserLogin, UserClaim, UserProfile, Label } from './data/models';

var router = express.Router()

router.post('/google/refresh-token', (req, res) => {
  const oauth = new google.auth.OAuth2(
      config.auth.google.id,
      config.auth.google.secret,
      config.auth.returnURL,
    )
  oauth.setCredentials({
    access_token: req.body.accessToken,
    refresh_token: req.body.refreshToken,
  })
  oauth.refreshAccessToken((err, tokens) => {
    req.user.accessToken = tokens.access_token;
    tokens.expiryTime = tokens.expiry_date;
    req.user.expiryTime = tokens.expiry_date;
    res.send(tokens);
  })
})

router.post('/add-label', (req, res) => {
  console.log(req.body);
  Label.create({
    labelId: req.body.labelId,
    position: req.body.position,
    userId: req.user.id,
  })
    .then(label => {
      res.sendStatus(200)
    })
})

router.post('/change-label', (req, res) => {
  Label.update({ labelId: req.body.newLabelId }, {
    where: { position: req.body.position, userId: req.user.id },
    returning: true,
  })
    .then((label) => {
      console.log(label);
      return res.sendStatus(200);
    })
})

router.post('/delete-label', (req, res) => {
  sequelize.transaction(t => {
    return Label.destroy({
      where: { userId: req.user.id, position: req.body.position }
    }, { transaction: t })
      .then(() => {
        return Label.update({ position: sequelize.literal("position -1")}, {
          where: { position: { $gt: req.body.position } },
          transaction: t,
        })
      })
      .then(() => {
        res.sendStatus(200);
      })
  })
})

export default router;
