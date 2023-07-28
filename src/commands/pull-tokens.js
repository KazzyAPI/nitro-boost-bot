const {
  EmbedBuilder,
} = require("discord.js");
const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const adminSchema = require("../../models/admins_model");
const tokenSchema = require("../../models/tokens_model");
const {pullTokensFromServer, getDiscordCookies} = require('../../discord_service/discord_service');

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pull-tokens")
    .setDescription("Pulls all tokens from a server")
    .addStringOption((option) =>
      option.setName("server_name").setDescription("Server name to pull tokens from").setRequired(false)
    )
    .addStringOption((option) =>
      option.setName("server_id").setDescription("Server id to pull tokens from").setRequired(false)
    ),
  run: async (client, interaction) => {
    const server_name = interaction.options.getString("server_name");
    const server_id = interaction.options.getString("server_id");

    const admins = await adminSchema.find({}).distinct('id');
    if (!admins.includes(interaction.user.id)) {
      let embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`You are not an admin`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed]
      });
    }

    if(!server_name && !server_id) {
      let embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`You must provide a server name or server id`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed]
      });
    }

    //Find all tokens with the same name given in the args
    var tokens;
    if(server_name) {
      tokens = await tokenSchema.find({ serverName: server_name });
    } else {
      tokens = await tokenSchema.find({ serverId: server_id });
    }
console.log(tokens);
 
    if(tokens.length == 0) {
      let embed = new EmbedBuilder()
        .setTitle("No tokens found")
        .setDescription(`No tokens were found for the server ${server_name || server_id}`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed]
      });
    }

    for(var i = 0; i < tokens.length; i++) {
      var cookies = await getDiscordCookies();
      try {
      await pullTokensFromServer(tokens[i].serverId, tokens[i].token, cookies, tokens[i].joinChannel);
      } catch(e) {
        console.log(e.message);
      }
    }



    let embed = new EmbedBuilder()
      .setTitle("Pull Tokens")
      .setDescription(`Successfully pulled ${tokens.length} tokens from ${server_name || server_id}}`)
      .setColor("DarkGreen");

    interaction.reply({ embeds: [embed] });
  },
};