const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const adminModel = require("../../models/admins_model");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("check-admins")
    .setDescription("Sends Tokens"),

  run: async (client, interaction) => {
    
    const admins = await adminModel.find({}).distinct('id');

    let description = "";
    admins.forEach((admin) => {
        description += `<@${admin}>\n`;
    });
    
    let embed = new EmbedBuilder()
          .setTitle("Admins")
          .setColor("DarkGreen")
          .setDescription(description);

        interaction.reply({
          embeds: [embed]
        });

  },
};
