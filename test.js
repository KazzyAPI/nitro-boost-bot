const axios = require('axios');
const HttpsProxyAgent = require("https-proxy-agent");
const path = require("path");
const fs = require('fs')
const uri = path.join(__dirname, "proxies.txt");
const proxies = fs.readFileSync(uri, "utf-8").split("\n");


async function ipCheck(proxy) {
  axios
    .post("https://reqres.in/api/users", {data: {name: "morpheus", job: "leader"}}, {headers: {"Content-Type": "application/json"}}, proxy)
    .then((res) => console.log(res.data))
    .catch((err) => console.log(err));
}


for(i = 0;i <  proxies.length;i++) {
    var proxi = proxies[i];
    let proxy = {
  proxy: false,
  httpsAgent: new HttpsProxyAgent(
    `http://${proxi}}`
  ),
};
    ipCheck(proxy);
}
