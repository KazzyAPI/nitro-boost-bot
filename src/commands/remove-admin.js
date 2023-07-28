const {
  EmbedBuilder,
  PermissionsBitField
} = require("discord.js");
const {
  SlashCommandBuilder
} = require("@discordjs/builders");
const adminSchema = require("../../models/admins_model");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("remove-admin")
    .setDescription("Removes a admin from the bot")
    .addUserOption((option) =>
      option.setName("admin").setDescription("Admin to remove").setRequired(true)
    ),
  run: async (client, interaction) => {
    var admin = interaction.options.getUser("admin");

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

    if (!admins.includes(admin.id)) {
      let embed = new EmbedBuilder()
        .setTitle("Error")
        .setDescription(`This user is not an admin`)
        .setColor("Red");

      return interaction.reply({
        embeds: [embed]
      });
    }

    adminSchema.findOneAndDelete({
      id: admin.id
    }, function (err) {
      if (err) {
        console.log(err);
      } else {
        let embed = new EmbedBuilder()
          .setTitle("Removed Admin")
          .setDescription(`Removed ${admin} from the admin list`)
          .setColor("DarkGreen");

        interaction.reply({
          embeds: [embed]
        });
      }
    });

  },
};