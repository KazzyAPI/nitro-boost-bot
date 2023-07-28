const tokensModel = require("../models/tokens_model");
const adminModel = require("../models/admins_model");

async function getTokensFromDatabase(type, amount) {
  return new Promise((resolve, reject) => {
    var totalBoostCount = 0;
    var tokensToUse = [];
    tokensModel
      .find(
        { boost_type: type, isUsed: false, boosts_used: { $lt: 2 } },
        (err, tokens) => {
          if (err) reject(err);
          tokens.forEach((token) => {
            if (token.boosts_used == 0) {
              totalBoostCount += 2;
              tokensToUse.push(token);
            } else if (token.boosts_used == 1) {
              totalBoostCount += 1;
              tokensToUse.push(token);
            }
          });
          resolve(tokensToUse);
        }
      )
      .limit(amount);
  });
}

async function isEnoughTokens(type, amount) {
  var totalBoostCount = 0;
  return new Promise((resolve, reject) => {
    tokensModel
      .find(
        { boost_type: type, isUsed: false, boosts_used: { $lt: 2 } },
        (err, tokens) => {
          if (err) reject(err);
          tokens.forEach((token) => {
            if (token.boosts_used == 0) {
              totalBoostCount += 2;
            } else if (token.boosts_used == 1) {
              totalBoostCount += 1;
            }
          });
          if (totalBoostCount < amount) {
            resolve(false);
          }
          resolve(true);
        }
      )
      .limit(amount);
  });
}

async function isAdmin(id) {
  return new Promise((resolve, reject) => {
    adminModel.find({ id: id }, (err, admins) => {
      if (err) reject(err);
      if (admins.length > 0) {
        resolve(true);
      }
      resolve(false);
    });
  });
}

async function addAdmin(id) {
    //TODO: Fix this
    const isAlreadyAdmin = await isAdmin(id);
    return new Promise((resolve, reject) => {
        if (isAlreadyAdmin) {
            resolve(false);
        } else {
            adminModel.create({ id: id }, (err, admin) => {
                if (err) reject(err);
                resolve(true);
            });
        }
    });
}

module.exports = {
  isEnoughTokens,
  getTokensFromDatabase,
  isAdmin
};
