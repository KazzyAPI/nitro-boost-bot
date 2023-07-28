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
const { textWithTimeStamp } = require("../../utils/utility_functions");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("add-stock")
    .setDescription("Add Stock to database")
    .addAttachmentOption((option) =>
      option.setName("token").setDescription("Token to add").setRequired(true)
    )
    .addStringOption(option =>
    option.setName('type')
        .setDescription('The boost type')
        .setRequired(true)
        .addChoices(
          {
            name: '1 Month', 
            value: '1m'
        },
          {
            name: '3 Month', 
            value: '3m'
        },
        )
),
  run: async (client, interaction) => {
    const admins = await adminModel.find({}).distinct('id');
    if (!admins.includes(interaction.user.id)) return;
    var database = await tokenModel.find({});
    const token = interaction.options.getAttachment("token");
    const type = interaction.options.getString("type");
    var d = await axios.get(token.url);
    var data = d.data.split("\n");
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
    interaction.reply({
      content: `Added ${data.length} ${type} tokens to database`,
      ephemeral: false,
    });
    channel.send(textWithTimestamp(`Successfully added ${data.length} ${type} tokens to database.`))
  },
};
