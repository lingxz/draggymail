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

router.post('/move-label', (req, res) => {
  console.log("requested positions");
  console.log(req.body.oldPos, req.body.newPos)
  if (req.body.oldPos > req.body.newPos) {
    let currentLabel = null;
    sequelize.transaction(t => {
      return Label.findOne({ where: { position: req.body.oldPos, userId: req.user.id }})
        .then(label => {
          currentLabel = label;
          return Label.update({ position: sequelize.literal("position +1") }, {
            where: {
              position: { $gte: req.body.newPos, $lt: req.body.oldPos },
              userId: req.user.id,
            },
            transaction: t,
          })
        })
        .then(() => {
          return currentLabel.update({ position: req.body.newPos }, { transaction: t })
        })
        .then(() => {
          res.sendStatus(200);
        })
    })
  } else {
    sequelize.transaction(t => {
      let currentLabel = null;
      return Label.findOne({ where: { position: req.body.oldPos, userId: req.user.id }})
        .then(label => {
          currentLabel = label;
          return Label.update({ position: sequelize.literal("position -1") }, {
            where: {
              position: { $gt: req.body.oldPos, $lte: req.body.newPos },
              userId: req.user.id,
            },
            transaction: t,
          })
        })
        .then(() => {
          return currentLabel.update({ position: req.body.newPos }, { transaction: t })
        })
        .then(() => {
          res.sendStatus(200);
        })
    })
  }
})

router.post('/remove-label', (req, res) => {
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
