const {
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const { ActivityType } = require("discord.js");



module.exports = {
  data: new SlashCommandBuilder()
    .setName("changep")
    .setDescription("Change the presence of the bot")
    .addStringOption((option) =>
      option
      .setName("presence")
      .setDescription("Custom status message")
      .setRequired(true)
    )
    .addStringOption((s) =>
      s
      .setName("atype")
      .setDescription("activity type")
      .setRequired(true)
      .addChoices({
        name: "playing",
        value: "playing",
      }, {
        name: "competing",
        value: "competing",
      }, {
        name: "listening",
        value: "listening",
      }, {
        name: "streaming",
        value: "streaming",
      }, {
        name: "watching",
        value: "watching",
      }
      )
      )
      .addStringOption((s) =>
        s
        .setName("type")
        .setDescription("status type")
        .setRequired(true)
        .addChoices({
          name: "Online",
          value: "online",
        }, {
          name: "Do not Disturb",
          value: "dnd",
        }, {
          name: "Away",
          value: "idle",
        }, {
          name: "invisible",
          value: "invisible",
        })
    ),
  run: async (client, interaction) => {

    const presence = interaction.options.getString("presence");
    const type = interaction.options.getString("type");
    const atype = interaction.options.getString("atype");

    let activityType;
    switch (atype) {
        case "playing":
            activityType = ActivityType.Playing;
            break;
        case "competing":
            activityType = ActivityType.Competing;
            break;
        case "listening":
            activityType = ActivityType.Listening;
            break;
        case "streaming":
            activityType = ActivityType.Streaming;
            break;
        case "watching":
            activityType = ActivityType.Watching;
            break;
    }

    const activity = {
      name: presence,
      type: activityType
    };
    client.user.setPresence({
      activities: [activity],
      status: type
    });

    let embed = new EmbedBuilder()
          .setTitle("Changes presence")
          .setColor("DarkGreen")
          .setDescription("Changes presence to whatever you picked. To lazy to put it here again");

        interaction.reply({
          embeds: [embed]
        });
    

  },
};