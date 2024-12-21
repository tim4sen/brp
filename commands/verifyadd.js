const {
  SlashCommandBuilder,
  PermissionsBitField,
  EmbedBuilder,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
} = require("discord.js");
const fs = require("fs");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("verifyadd")
    .setDescription("Verify a user with their Roblox name and ID")
    .addStringOption((option) =>
      option
        .setName("roblox_name")
        .setDescription("The Roblox username of the user")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("The Desired ID of the user")
        .setRequired(true)
    ),

  async execute(interaction) {
    const robloxName = interaction.options.getString("roblox_name");
    const id = interaction.options.getString("id");

    if (!interaction.channel.name.startsWith("verification-")) {
      return interaction.reply({
        content: "This command can only be used in a verification ticket channel.",
        ephemeral: true,
      });
    }

    const member = interaction.guild.members.cache.get(interaction.channel.topic);
    if (!member) {
      return interaction.reply({
        content: "Could not find the ticket owner in this channel.",
        ephemeral: true,
      });
    }

    const verifiedRoleId = "1319439176218710181";
    const transcriptChannelId = "1319593269218512997"; // Replace with your log channel ID

    try {
      // Add verified role to the user
      await member.roles.add(verifiedRoleId);
      console.log(`Assigned role ${verifiedRoleId} to ${member.user.tag}.`);
    } catch (error) {
      console.error(`Failed to assign role to ${member.user.tag}:`, error.message);
      return interaction.reply({
        content: "An error occurred while assigning the role. Please check permissions.",
        ephemeral: true,
      });
    }

    try {
      // Update the user's nickname
      const newNickname = `[${id}] ${robloxName}`;
      await member.setNickname(newNickname);
      console.log(`Changed nickname for ${member.user.tag} to "${newNickname}".`);
    } catch (error) {
      console.warn(`Failed to change nickname for ${member.user.tag}:`, error.message);
      await interaction.followUp({
        content: "The user's nickname could not be updated. Please check role hierarchy.",
        ephemeral: true,
      });
    }

    try {
      // Create a webhook in the channel
      const webhook = await interaction.channel.createWebhook({
        name: "Verification Complete",
        avatar: interaction.client.user.displayAvatarURL(),
      });

      const embed = new EmbedBuilder()
        .setTitle("Verification Complete")
        .setDescription(
          `Hello **<@${member.id}>**! Our Verified Staff has conducted thorough checks to confirm your account's eligibility for Verified Community Member status, and we are pleased to inform you that your account qualifies to join.

          Your server identification code is \`${id}\`. This code is required when joining an organization and helps moderators easily identify you, you must provide this to the organisation when joining.

          Thank you, and we hope you enjoy your exciting stay in our community.`
        )
        .setColor(0x9e1de1)
        .setFooter({
          text: `Verified by ${interaction.user.tag}`,
          iconURL: interaction.user.displayAvatarURL(),
        });

      await interaction.channel.setName("completed");

      const closeButton = new ButtonBuilder()
        .setCustomId("close_ticket")
        .setLabel("Close Ticket")
        .setStyle(ButtonStyle.Secondary);

      const row = new ActionRowBuilder().addComponents(closeButton);

      await webhook.send({
        embeds: [embed],
        components: [row],
      });

      await webhook.delete();

      await interaction.reply({
        content: "Verification complete. The user has been updated.",
        ephemeral: true,
      });

      // Modify the filter to allow the ticket owner and the staff who ran the command to close the ticket
      const collector = interaction.channel.createMessageComponentCollector({
        filter: (i) =>
          (i.customId === "close_ticket" && i.user.id === interaction.user.id) ||
          (i.customId === "close_ticket" && i.user.id === member.id), // Allow the ticket opener to close the ticket as well
        time: 86400000, // 24 hours
      });

      collector.on("collect", async (buttonInteraction) => {
        try {
          // Fetch all messages and create a transcript
          const messages = await interaction.channel.messages.fetch({ limit: 100 });
          const transcript = messages
            .map(
              (msg) =>
                `[${msg.createdAt.toISOString()}] ${msg.author.tag}: ${msg.content}`
            )
            .reverse()
            .join("\n");

          const fileName = `transcript-${interaction.channel.name}.txt`;
          fs.writeFileSync(fileName, transcript);

          // Send the transcript to the logging channel
          const logChannel = interaction.guild.channels.cache.get(transcriptChannelId);
          if (logChannel) {
            await logChannel.send({
              content: `Transcript for ${interaction.channel.name}`,
              files: [fileName],
            });
          }

          // Clean up the file
          fs.unlinkSync(fileName);

          // Delete the ticket channel
          await interaction.channel.delete();
        } catch (error) {
          console.error("Error closing ticket:", error);
          await buttonInteraction.reply({
            content: "An error occurred while closing the ticket. Please try again.",
            ephemeral: true,
          });
        }
      });
    } catch (error) {
      console.error("Error verifying user:", error);
      return interaction.reply({
        content: "An error occurred while processing the verification.",
        ephemeral: true,
      });
    }
  },
};
