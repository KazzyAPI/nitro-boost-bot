const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getBalance } = require("../../capmoster_service/capmoster_server");
const fs = require("fs");
const axios = require("axios");
const tokenModel = require("../../models/tokens_model");
const path = require("path");
const uri = path.join(__dirname, "..", "..", "tokens.txt");
const tokens = fs.readFileSync(uri, "utf-8").split("\n");
const urii = path.join(__dirname, "..", "..", "tokens_3m.txt");
const tokens_3month = fs.readFileSync(urii, "utf-8").split("\n");
const adminModel = require("../../models/admins_model");
const config = require("../config");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-stock-text")
    .setDescription("Add Stock to database")
    .addStringOption((option) =>
      option
        .setName("type")
        .setDescription("The boost type")
        .setRequired(true)
        .addChoices(
          {
            name: "1 Month",
            value: "1m",
          },
          {
            name: "3 Month",
            value: "3m",
          }
        )
    ),
  run: async (client, interaction) => {
    const admins = await adminModel.find({}).distinct("id");
    if (!admins.includes(interaction.user.id)) return;
    const type = interaction.options.getString("type");

    //Response and ask the user to paste the text

    interaction.reply({
      content: "Please paste the text",
      ephemeral: false,
    });

    //Wait for the user to send a message

    const filter = (m) => m.author.id === interaction.user.id;
    const collector = interaction.channel.createMessageCollector({
      filter,
      time: 60000,
    });

    //If the user doesn't send a message in 60 seconds, cancel the collector

    collector.on("end", (collected) => {
      if (collected.size === 0) {
        return interaction.editReply({
          content: "You didn't send a message in time",
          ephemeral: false,
        });
      }
    });

    //If the user sends a message, add the stock to the database

    collector.on("collect", async (m) => {
      const data = m.content.split("\n");
      for (i = 0; i < data.length; i++) {
        let account = data[i].split(":");
        const newToken = new tokenModel({
          token: account[2],
          boosts_used: 0,
          isUsed: false,
          boost_type: type,
          serverId: "",
          serverName: "",
          date_added: new Date(),
          error_count: 0,
          email: account[0],
          password: account[1],
        });
        newToken.save();
      }

      const embed = new EmbedBuilder()
        .setTitle("Added Stock")
        .addFields(
          {
            name: "Tokens Added",
            value: `<a:BOOSTED:1060505916866314260>  ${data.length} <a:BOOSTED:1060505916866314260> `,
          },
          {
            name: "Type",
            value: `<a:BOOSTED:1060505916866314260>  ${type} <a:BOOSTED:1060505916866314260> `,
          }
        )
        .setColor("DarkGreen");
      interaction.editReply({
        embeds: [embed],
        ephemeral: false,

    });
    // Stop the collector
    collector.stop();
    });
    // for (i = 0; i < data.length; i++) {
    //   let account = data[i].split(":");
    // const newToken = new tokenModel({
    //   token: account[2],
    //   boosts_used: 0,
    //   isUsed: false,
    //   boost_type: type,
    //   serverId: "",
    //   serverName: "",
    //   date_added: new Date(),
    //   error_count: 0,
    //   email: account[0],
    //   password: account[1],
    // });
    //  newToken.save();
    // }

 
  },
};
