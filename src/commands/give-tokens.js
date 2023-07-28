const {
  EmbedBuilder,
  PermissionsBitField,
  MessageAttachment,
} = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { getBalance } = require("../../capmoster_service/capmoster_server");
const mongoService = require("../../mongo/mongo_db_service");
    const fs = require("fs");
    const path = require("path");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("give-tokens")
    .setDescription("Sends tokens to a user")
    .addNumberOption((option) =>
      option
        .setName("amount")
        .setDescription("The token amount")
        .setRequired(true)
    )
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
    )
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to send the tokens to")
        .setRequired(true)
    ),
  run: async (client, interaction) => {
    const amount = interaction.options.getNumber("amount");
    const type = interaction.options.getString("type");
    const users = interaction.options.getUser("user");

    const isAdmin = await mongoService.isAdmin(interaction.user.id);

    if (!isAdmin) {
      return interaction.reply({
        content: "You are not an admin",
        ephemeral: true,
      });
    }
    const isEnoughTokens = await mongoService.isEnoughTokens(type, amount);

    if (!isEnoughTokens) {
      return interaction.reply({
        content: "Not enough tokens",
        ephemeral: true,
      });
    }

    const getTokens = await mongoService.getTokensFromDatabase(type, amount);

    let textFile = "";

    getTokens.forEach((token) => {
      textFile += `${token.email}:${token.password}:${token.token}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle("Tokens")
      .setColor("DarkGreen")
      .setDescription(
        "Here are your tokens, i will delete the message in 5 seconds"
      );

    const user = client.users.cache.get(users.id);

    await fs.writeFile(
      path.join(__dirname, "..", "..", "tokens1.txt"),
      `${textFile}`,
      function (err) {
        if (err) throw err;
      }
    );

    const tokenss = path.join(__dirname, "..", "..", "tokens1.txt");

    const message = await user.send({
      embeds: [embed],
      files: [tokenss],
    });

    setTimeout(() => {
      message.delete();
    }, 60000);

    await interaction.reply({
      content: "Just sent the tokens to the user",
    });

    await fs.unlink(
      path.join(__dirname, "..", "..", "tokens1.txt"),
      function (err) {
        if (err) throw err;
      }
    );
  },
};
