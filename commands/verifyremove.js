const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verifyremove")
    .setDescription("Remove verification from a user.")
    .addUserOption((option) =>
      option
        .setName("user")
        .setDescription("The user to remove verification from")
        .setRequired(true)
    ),

  async execute(interaction) {
    const user = interaction.options.getUser("user");
    const member = interaction.guild.members.cache.get(user.id);

    if (!member) {
      return interaction.reply({
        content: "Could not find the specified user in the server.",
        ephemeral: true,
      });
    }

    // Check if the user has the "verified" role
    const verifiedRoleId = "1319439176218710181";
    if (!member.roles.cache.has(verifiedRoleId)) {
      return interaction.reply({
        content: "This user is not verified.",
        ephemeral: true,
      });
    }

    try {
      // Remove the verified role
      await member.roles.remove(verifiedRoleId);
      console.log(`Removed verified role from ${member.user.tag}.`);

      // Reset their nickname to their Discord username
      await member.setNickname(member.user.username);
      console.log(`Reset nickname for ${member.user.tag} to their original name.`);

      // Send webhook notification about the verification removal
      const webhook = await interaction.channel.createWebhook({
        name: "Verification Removed",
        avatar: interaction.client.user.displayAvatarURL(),
      });

      const embed = new EmbedBuilder()
        .setTitle("Verification Removed")
        .setDescription(
          `The Verification Status has been removed from **<@${member.id}>**. They are no longer a Verified Community Member.`
        )
        .setColor(0x9e1de1)
        .setFooter({
          text: `Verified Removed by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await webhook.send({
        embeds: [embed],
      });

      // Clean up the webhook
      await webhook.delete();

      // Confirm the action to the user
      await interaction.reply({
        content: `Successfully removed verification from ${member.user.tag}.`,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error removing verification:", error);
      return interaction.reply({
        content: "An error occurred while removing verification from the user.",
        ephemeral: true,
      });
    }
  },
};
