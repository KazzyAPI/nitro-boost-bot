const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getBalance } = require("../../capmoster_service/capmoster_server");
const adminModel = require("../../models/admins_model");
const config = require("../config");
const { textWithTimeStamp } = require("../../utils/utility_functions");


module.exports = {
  data: new SlashCommandBuilder()
    .setName("balance")
    .setDescription("Gets the captcha service balance"),
  run: async (client, interaction) => {    
    var balance = await getBalance();
    const admins = await adminModel.find({}).distinct('id');
    if (!admins.includes(interaction.user.id)) return;
    let embed = new EmbedBuilder()
      .setTitle("Your balance")
      .setDescription(`Your current balance is $${balance}`)
      .setColor("DarkGreen");

    interaction.reply({ embeds: [embed] });
  },
};
