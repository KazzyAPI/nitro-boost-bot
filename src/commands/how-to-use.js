const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getBalance } = require("../../capmoster_service/capmoster_server");
const adminModel = require("../../models/admins_model");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("how-to-use")
    .setDescription("Tutorial on how to use the bot"),
  run: async (client, interaction) => {
    let embed = new EmbedBuilder()
      .setTitle("Tutorial")
      .setDescription("While the bot behind the scenes can be complex the UI is made to be as friendly as possible. The bot offers advanced features no other boost bot has, these include: ")
      .addFields(
        {
            name: "pull-tokens",
            value: "Pulls all tokens from a server. This is useful if you want to use the tokens on another server.Also great for those people that want to chargeback. "

        },
        {
            name: "balance",
            value: "Gets the captcha service balance. Pretty standard."
        },
        {
            name: "add-token",
            value: "Adds a token to the database. We take in a text file with tokens only. Our db schema handles the rest. "
        },
        {
            name: "remove-admin",
            value: "Removes an admin from the database. This is useful if you want to remove yourself from the database(or not)."

        },
        {
            name: "add-admin",
            value: "Adds an admin to the database."
        },
        {
            name: "stock",
            value: "Gets the stock of tokens. Unlike other bots, we dont just double our token stock, we have a true count of boosts available, due to how we track on db. "
        },
        {
            name: "boost",
            value: "Boosts a server. This is the main feature of the bot. We have included a nice loading bar to show you the progress of the boost."
        }
      )
      .setColor("DarkGreen");

    interaction.reply({ embeds: [embed] });
  },
};
