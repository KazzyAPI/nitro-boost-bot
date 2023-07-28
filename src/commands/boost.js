const { EmbedBuilder, PermissionsBitField } = require("discord.js");
const { SlashCommandBuilder } = require("@discordjs/builders");
const { run } = require("../../discord_service/discord_controller");

const adminModel = require("../../models/admins_model");
const tokenModel = require("../../models/tokens_model");

const mongoService = require("../../mongo/mongo_db_service");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("boost")
    .setDescription("Boosts the given server")
    .addStringOption((option) =>
      option
        .setName("link")
        .setDescription("The link to the server")
        .setRequired(true)
    )
    .addIntegerOption((amount) =>
      amount
        .setName("amount")
        .setDescription("Amount to boost")
        .setRequired(true)
    )
    .addStringOption((s) =>
      s
        .setName("type")
        .setDescription("Type of boost")
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
    .addStringOption((s) =>
      s
        .setName("name")
        .setDescription("Renames token for boosting")
        .setRequired(false)
    ),
  run: async (client, interaction) => {
    var link = interaction.options.getString("link");
    const amount = interaction.options.getInteger("amount");
    const type = interaction.options.getString("type");
    const nameForToken = interaction.options.getString("name");

    const progressbar = require("string-progressbar");
    // Assaign values to total and current values
    var total = 0;
    var current = 0;

    var options = {
      size: 10,
      line: "▬",
      slider: "🔘",
    };

    var bar = `[${progressbar.filledBar(amount, 0, 10)[0]}] ${0}/${amount}`;

    const admins = await adminModel.find({}).distinct("id");
    const isEnough = await mongoService.isEnoughTokens(type, amount);
    if (!isEnough) {
      let embed = new EmbedBuilder()
        .setTitle("Not enough tokens")
        .setDescription(`You don't have enough tokens to boost ${amount} times`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed],
      });
    }
    if (amount < 1) {
      let embed = new EmbedBuilder()
        .setTitle("Invalid amount")
        .setDescription(`You can't boost less than 0 times`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed],
      });
    }
    if (isNaN(amount)) {
      let embed = new EmbedBuilder()
        .setTitle("Invalid amount")
        .setDescription(`You can't boost less than 0 times`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed],
      });
    }
    if (!admins.includes(interaction.user.id)) return;
    if (link.includes("discord.gg/")) {
      link = link.split("/")[1];
    }

    let embed = new EmbedBuilder()
      .setTitle("Sending boost to the server")
      .setDescription(`Progress: \`\`${bar}\`\``)
      .setColor("DarkGreen");

    interaction.reply({ embeds: [embed] });

    var boostr = await run(link, amount, interaction, type, embed, null);
    console.log("Boosted finished with success: " + boostr);
  },
};
