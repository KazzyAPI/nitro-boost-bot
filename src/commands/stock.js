const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getBalance } = require("../../capmoster_service/capmoster_server");
const { admins } = require("../config");
const fs = require("fs");
const path = require("path");
const uri = path.join(__dirname, "..", "..", "tokens.txt");
const tokens = fs.readFileSync(uri, "utf-8").split("\n");
const urii = path.join(__dirname, "..", "..", "tokens_3m.txt");
const tokens_3month = fs.readFileSync(urii, "utf-8").split("\n");
const tokenSchema = require("../../models/tokens_model");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stock")
    .setDescription("Gets the current stock"),
  run: async (client, interaction) => {
    // Get tokens from the db where the boosts_used is less than 2

    var token_1month = await tokenSchema.find({
      boost_type: "1m",
      boosts_used: { $lt: 2 },
    });
    var token_3month = await tokenSchema.find({
      boost_type: "3m",
      boosts_used: { $lt: 2 },
    });

    var total_1month = 0;
    var total_3month = 0;

    for (var i = 0; i < token_1month.length; i++) {
      if (token_1month[i].boosts_used == 0) total_1month += 2;
      else if (token_1month[i].boosts_used == 1) total_1month += 1;
    }

    for (var i = 0; i < token_3month.length; i++) {
      if (token_3month[i].boosts_used == 0) total_3month += 2;
      else if (token_3month[i].boosts_used == 1) total_3month += 1;
    }

    var total_usable = total_1month + total_3month;
    let embed = new EmbedBuilder()
      .setTitle("Stock")
      .addFields(
        {
          name: "Tokens 1(Month)",
          value: `<a:BOOSTED:1060505916866314260>  ${token_1month.length} <a:BOOSTED:1060505916866314260> `,
          inline: true,
        },
        {
          name: "Tokens 3(Month)",
          value: `<a:BOOSTED:1060505916866314260>  ${token_3month.length} <a:BOOSTED:1060505916866314260> `,
          inline: true,
        },
        {
          name: "Total Boosts",
          value: `<a:BOOSTED:1060505916866314260>  ${
           total_usable
          } <a:BOOSTED:1060505916866314260> `,
          inline: true,
        },
        {
          name: "Total Boosts 1(Month)",
          value: `<a:BOOSTED:1060505916866314260>  ${total_1month} <a:BOOSTED:1060505916866314260> `,
          inline: true,
        },
        {
          name: "Total Boosts 3(Month",
          value: `<a:BOOSTED:1060505916866314260>  ${total_3month} <a:BOOSTED:1060505916866314260> `,
          inline: true,
        }
      )
      .setColor("DarkGreen");

    interaction.reply({ embeds: [embed] });
  },
};
