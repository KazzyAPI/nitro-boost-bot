const {
  getFingerprint,
  getDiscordCookies,
  joinServer,
  getNitroSubscriptions,
  sendBoostsToServer,
  changeTokenName,
} = require("./discord_service");

const {
  getTaskResult,
  createTask,
} = require("../capmoster_service/capmoster_server");

const tokenModel = require("../models/tokens_model");
const { EmbedBuilder } = require("discord.js");
const progressbar = require("string-progressbar");

const { logger } = require("../utils/utility_functions");
const fs = require("fs");
const path = require("path");
const uri = path.join(__dirname, "..", "tokens.txt");
const tokens = fs.readFileSync(uri, "utf-8").split("\n");
const urii = path.join(__dirname, "..", "proxies.txt");
const HttpsProxyAgent = require("https-proxy-agent");
const proxies = fs.readFileSync(urii, "utf-8").split("\n");
var succesful = 0;
var currentIndex = 0;
var total = 0;
var current = 0;
async function run(server, amount, interaction, type, embed, nameForToken) {
  // Assaign values to total and current values
  total = amount;
  current = succesful;

  var options = {
    size: 10,
    line: "▬",
    slider: "🔘",
  };

  succesful = 0;
  var tokies = await tokenModel.find({
    boosts_used: { $lt: 2 },
    boost_type: type,
  });

  var fingerprint = await getFingerprint();
  logger.info("Fetched our fingerprint");
  var cookies = await getDiscordCookies();
  logger.info("Fetched our cookies");

  var tokkens_to_use = [];
  var boosts_to_match_amount = 0;
  for (var i = 0; i < tokies.length; i++) {
    if (boosts_to_match_amount < amount) {
      if (tokies[i].boosts_used == 0) {
        tokkens_to_use.push(tokies[i]);
        boosts_to_match_amount += 2;
      } else if (tokies[i].boosts_used == 1) {
        tokkens_to_use.push(tokies[i]);
        boosts_to_match_amount += 1;
      }
    }
  }

  for (var i = 0; i < tokkens_to_use.length; i++) {
    var proxyi = {
      proxy: false,
      httpsAgent: new HttpsProxyAgent("http://" + proxies[i]),
    };
    //if (i == amount) return console.log("Finished");
    await sendTokenBoosts(
      server,
      amount,
      interaction,
      tokkens_to_use[i],
      fingerprint,
      cookies,
      embed,
      nameForToken
    );
  };

  return new Promise((resolve, reject) => {
    resolve(succesful);
  })
}

async function sendTokenBoosts(
  server,
  amount,
  interaction,
  token,
  fingerprint,
  cookies,
  embed,
  nameForToken
) {
  var bar = `[${
    progressbar.filledBar(amount, succesful, 10)[0]
  }] ${succesful}/${amount}`;
  if (succesful == amount) {
    bar = `[${
      progressbar.filledBar(amount, succesful, 10)[0]
    }] ${succesful}/${amount}`;
    await interaction.editReply({
      embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
    });
    return;
  }

  console.log(
    "Sending boosts to server: " + server + " with token: " + token.token
  );

  try {
    var headers = {
      accept: "*/*",
      "accept-encoding": "gzip, deflate",
      "accept-language": "en-GB",
      authorization: token.token,
      "content-type": "application/json",
      origin: "https://discord.com",
      referer: "https://discord.com/channels/@me",
      "sec-fetch-dest": "empty",
      "sec-fetch-mode": "cors",
      cookie: cookies,
      "sec-fetch-site": "same-origin",
      "user-agent":
        "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) discord/0.1.9 Chrome/83.0.4103.122 Electron/9.4.4 Safari/537.36",
      "x-debug-options": "bugReporterEnabled",
      "x-context-properties": "eyJsb2NhdGlvbiI6IlVzZXIgUHJvZmlsZSJ9",
      "x-super-properties":
        "eyJvcyI6IldpbmRvd3MiLCJicm93c2VyIjoiRGlzY29yZCBDbGllbnQiLCJyZWxlYXNlX2NoYW5uZWwiOiJzdGFibGUiLCJjbGllbnRfdmVyc2lvbiI6IjAuMS45Iiwib3NfdmVyc2lvbiI6IjEwLjAuMTc3NjMiLCJvc19hcmNoIjoieDY0Iiwic3lzdGVtX2xvY2FsZSI6ImVuLVVTIiwiY2xpZW50X2J1aWxkX251bWJlciI6OTM1NTQsImNsaWVudF9ldmVudF9zb3VyY2UiOm51bGx9",
      te: "trailers",
    };
    if (
      nameForToken != null &&
      nameForToken != undefined &&
      nameForToken != ""
    ) {
      console.log(nameForToken);
      logger.info("Changing token name to: " + nameForToken);
      try {
        await changeTokenName(token.token, cookies, nameForToken, token.password);
      } catch (error) {
        console.log(error)
        logger.error(
          "Could not change token name => " +
            error.message +
            "=> this usually happens with incorrect permissions"
        );
      }
    }
    logger.warn("Attempting to join server without using captcha . . .");
    var joinAttempt = await joinServer(server, {}, headers);
    if (
      joinAttempt?.response?.status !== 403 &&
      joinAttempt?.response?.code !== "ERR_BAD_REQUEST"
    ) {
      if (joinAttempt?.response?.data?.captcha_sitekey) {
        var key = joinAttempt.response.data.captcha_sitekey;
        logger.warn("No success joining, solving captcha . . .");
        logger.warn("Creating task for captcha . . .");
        var captcha = await createTask(key);
        logger.info("Task has been created!");
        logger.info("Checking status of captcha . . .");
        var captchaChecker = await getTaskResult(captcha);
        logger.info(`The status of the captcha is => ${captchaChecker.status}`);
        logger.info("Checking until captcha is solved . . .");

        while (captchaChecker.status == "processing") {
          setTimeout(async () => {
            captchaChecker = await getTaskResult(captcha);
          }, 1000);
          await new Promise((resolve) => setTimeout(resolve, 1000));
        }
        logger.info("Captcha has been solved . . . Suck my dick discord");
        let result = captchaChecker.solution.gRecaptchaResponse;
        var body = {
          captcha_key: result,
        };
        logger.info(`Joining ${server} with a solved captcha . . .`);
        var solvedCaptcha = await joinServer(server, body, headers);
        if (solvedCaptcha) {
          logger.info(`Token has joined ${solvedCaptcha.guild.name}!`);
          logger.info("Attempting to boost server . . .");
          logger.info("Getting slots from token . . .");
          var nitros = await getNitroSubscriptions(headers);
          logger.info("Successfully gotten slots . . .");
          if (nitros.length > 0) {
            logger.info("Found nitro, preparing for boost . . .");
            for (i = 0; i < nitros.length; i++) {
              if (nitros[i].cooldown_ends_at == null) {
                if (succesful == amount) {
                  await interaction.editReply({
                    embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
                  });
                  return;
                }
                var sendingBoosts = await sendBoostsToServer(
                  solvedCaptcha.guild.id,
                  nitros[i].id,
                  headers
                );
                succesful++;
                bar = `[${
                  progressbar.filledBar(amount, succesful, 10)[0]
                }] ${succesful}/${amount}`;
                await interaction.editReply({
                  embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
                });
                token.boosts_used++;
                token.serverId = solvedCaptcha.guild.id;
                token.serverName = solvedCaptcha.guild.name;
                if (token.boosts_used == 2) token.isUsed = true;
                token.save();
                logger.info("Boosted server");
              }
            }
          } else {
            return logger.info("This token has no boosts");
          }
          if (succesful < amount) {
            bar = `[${
              progressbar.filledBar(amount, succesful, 10)[0]
            }] ${succesful}/${amount}`;
            await interaction.editReply({
              embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
            });
          }

          if (succesful == amount) {
            bar = `[${
              progressbar.filledBar(amount, succesful, 10)[0]
            }] ${succesful}/${amount}`;
            await interaction.editReply({
              embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
            });
            return;
          }
        }
      }

      if (joinAttempt?.guild?.id) {
        logger.info("Attempting to boost server . . .");
        logger.info("Getting slots from token . . .");
        var nitros = await getNitroSubscriptions(headers);
        logger.info("Successfully gotten slots . . .");
        if (nitros.length > 0) {
          logger.info("Found nitro, preparing for boost . . .");
          for (i = 0; i < nitros.length; i++) {
            if (nitros[i].cooldown_ends_at == null) {
              if (succesful == amount) {
                await interaction.editReply({
                  embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
                });
                return;
              }
              var sendingBoosts = await sendBoostsToServer(
                joinAttempt.guild.id,
                nitros[i].id,
                headers
              );
              succesful++;
              bar = `[${
                progressbar.filledBar(amount, succesful, 10)[0]
              }] ${succesful}/${amount}`;
              await interaction.editReply({
                embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
              });
              token.boosts_used++;
              token.serverId = joinAttempt.guild.id;
              token.serverName = joinAttempt.guild.name;
              if (token.boosts_used == 2) token.isUsed = true;
              token.save();
              logger.info("Boosted server");
            }
          }
        } else {
          return logger.info("This token has no boosts");
        }
        if (succesful < amount) {
          bar = `[${
            progressbar.filledBar(amount, succesful, 10)[0]
          }] ${succesful}/${amount}`;
          await interaction.editReply({
            embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
          });
        }

        if (succesful == amount) {
          bar = `[${
            progressbar.filledBar(amount, succesful, 10)[0]
          }] ${succesful}/${amount}`;
          await interaction.editReply({
            embeds: [embed.setDescription(`Progress: \`\`${bar}\`\``)],
          });
          return;
        }
      }
    } else {
      // This could mean the token is locked
      logger.warn("Token is locked, Skipping to next token");
      // remove the token from the array
      token.boosts_used = 2;
      token.save();

      interaction.editReply({
        embeds: [
          embed.setDescription(
            `An error occured while boosting the server, please try again later.`
          ),
        ],
      });
    }
  } catch (err) {
    logger.error("Error while boosting server => " + err.message);
    interaction.editReply({
      embeds: [
        embed.setDescription(
          `An error occured while boosting the server, please try again later.`
        ),
      ],
    });
    token.error_count++;
  }
}

module.exports = {
  run,
};
