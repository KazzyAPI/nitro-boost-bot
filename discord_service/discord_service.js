const axios = require("axios");
const BASE_URL = "https://discord.com/api/v9/";
const fs = require("fs");
const path = require("path");
const uri = path.join(__dirname, "..", "tokens.txt");
const tokens = fs.readFileSync(uri, "utf-8").split("\n");
const HttpsProxyAgent = require("https-proxy-agent");
let proxy = {
  proxy: false,
  httpsAgent: new HttpsProxyAgent(
    "http://fuDESQpKX5CfA2f:BWzpA94QqS3HOju@176.57.56.81:43814"
  ),
};

async function ipCheck() {
  axios
    .get("https://ipapi.co/8.8.8.8/json/", proxy)
    .then((res) => console.log(res))
    .catch((err) => console.log(err));
}
async function getFingerprint() {
  return new Promise((resolve, reject) => {
    axios
      .get(BASE_URL + "experiments")
      .then((response) => {
        resolve(response.data.fingerprint);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function getDiscordCookies() {
  return new Promise((resolve, reject) => {
    axios
      .get("https://discord.com")
      .then((response) => {
        var cookies = response.headers["set-cookie"];
        var cookiesFormat = `${cookies[0].split(";")[0]}; ${
          cookies[1].split(";")[0]
        }; locale=en-US`;
        resolve(cookiesFormat);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function joinServer(serverCode, body, headers) {
  return new Promise((resolve, reject) => {
    axios
      .post(BASE_URL + "invites/" + serverCode, body, {
        headers: headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        resolve(error);
      });
  });
}

async function getNitroSubscriptions(headers) {
  return new Promise((resolve, reject) => {
    axios
      .get(BASE_URL + "users/@me/guilds/premium/subscription-slots", {
        headers: headers,
      })
      .then((response) => {
        resolve(response.data);
      });
  }).catch((err) => {
    resolve(err);
  });
}

async function sendBoostsToServer(serverId, subscriptionSlotIds, headers) {
  var boostsBody = {
    user_premium_guild_subscription_slot_ids: [subscriptionSlotIds],
  };
  return new Promise((resolve, reject) => {
    axios
      .put(BASE_URL + `guilds/${serverId}/premium/subscriptions`, boostsBody, {
        headers: headers,
      })
      .then((response) => {
        resolve(response.data);
      });
  }).catch((error) => {
    reject(error);
  });
}

async function pullTokensFromServer(serverId, token, cookies, joinChannel) {
  const options = {
    method: "DELETE",
    url: `https://discord.com/api/v9/users/@me/guilds/${serverId}`,
    proxy: false,
    httpsAgent: new HttpsProxyAgent(
      "http://fuDESQpKX5CfA2f:BWzpA94QqS3HOju@176.57.56.81:43814"
    ),
    headers: {
      Authorization: token,
    },
  };
  return new Promise((resolve, reject) => {
    axios
      .request(options)
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

async function changeTokenNickname(token, cookies, name) {
  let headers = {
    cookies: cookies,
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: token,
    "Content-Type": "application/json",
  };

  let body = {
    nick: name,
  };

  return new Promise((resolve, reject) => {
    axios
      .patch(BASE_URL + `guilds/1056066073696419850/members/@me`, body, {
        headers: headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}
async function changeTokenName(token, cookies, name, password) {
  let headers = {
    accept: "*/*",
    "accept-encoding": "gzip, deflate, br",
    "accept-language": "en-GB,en-US;q=0.9,en;q=0.8",
    authorization: token,
    "Content-Type": "application/json",
  };

  let body = {
    "username": name,
    "password": password,
  };

  return new Promise((resolve, reject) => {
    axios
      .patch(BASE_URL + "users/@me", body, {
        headers: headers,
      })
      .then((response) => {
        resolve(response.data);
      })
      .catch((error) => {
        reject(error);
      });
  });
}

module.exports = {
  getFingerprint,
  getDiscordCookies,
  joinServer,
  getNitroSubscriptions,
  sendBoostsToServer,
  pullTokensFromServer,
  changeTokenName
};
