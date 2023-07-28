const axios = require("axios");
const { response } = require("express");
const CAPMOSTER_API = "";
const BASE_URL = "https://api.capmonster.cloud/";

async function createTask(captcha_sitekey) {
  let body = {
    clientKey: `${CAPMOSTER_API}`,
    task: {
      type: "HCaptchaTaskProxyless",
      websiteURL: "https://discord.com/channels/@me",
      websiteKey: captcha_sitekey,
    },
  };
  return new Promise((resolve, reject) => {
    axios.post(BASE_URL + "createTask", body).then((response) => {
      resolve(response.data.taskId);
    });
  }).catch((err) => reject(err));
}

async function getTaskResult(taskid) {
  let body = {
    clientKey: `${CAPMOSTER_API}`,
    taskId: taskid,
  };
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL + "getTaskResult", { data: body }).then((response) => {
      resolve(response.data);
    });
  }).catch((err) => reject(err));
}

async function getUntilDone(taskid) {
  var data = await getTaskResult(taskid);

  if (data.status == "processing") {
    console.log("Checking . . .");
    setTimeout(async () => {
      await getUntilDone(taskid);
    }, 500);
  }
}

async function getBalance() {
  let body = {
    clientKey: `${CAPMOSTER_API}`,
  };
  return new Promise((resolve, reject) => {
    axios.get(BASE_URL + "getBalance", {data: body}).then((response) => {
      resolve(response.data.balance);
    });
  }).catch((err) => resolve(response));
}

module.exports = {
  createTask,
  getTaskResult,
  getUntilDone,
  getBalance,
};
