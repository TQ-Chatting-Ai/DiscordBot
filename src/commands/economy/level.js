const { Client, Interaction, ApplicationCommandOptionType, AttachmentBuilder } = require('discord.js');
const canvacord = require('canvacord');
const calculateLevelXp = require('../../utils/calculateLevelXp');
const Level = require('../../models/Level');
const { Font } = require('canvacord');

Font.loadDefault();

module.exports = {
  /**
   * @param {Client} client
   * @param {Interaction} interaction
   */
  callback: async (client, interaction) => {
    if (!interaction.inGuild()) {
      interaction.reply('You can only run this command inside a server.');
      return;
    }

    await interaction.deferReply();

    const mentionedUserId = interaction.options.get('target-user')?.value;
    const targetUserId = mentionedUserId || interaction.member.id;
    const targetUserObj = await interaction.guild.members.fetch(targetUserId);

    const fetchedLevel = await Level.findOne({
      userId: targetUserId,
      guildId: interaction.guild.id,
    });

    if (!fetchedLevel) {
      interaction.editReply(
        mentionedUserId
          ? `${targetUserObj.user.tag} doesn't have any levels yet. Try again when they chat a little more.`
          : "You don't have any levels yet. Chat a little more and try again."
      );
      return;
    }

    let allLevels = await Level.find({ guildId: interaction.guild.id }).select('-_id userId level xp');

    allLevels.sort((a, b) => {
      if (a.level === b.level) {
        return b.xp - a.xp;
      } else {
        return b.level - a.level;
      }
    });

    let currentRank = allLevels.findIndex((lvl) => lvl.userId === targetUserId) + 1;

    const rank = new canvacord.RankCardBuilder()
      .setAvatar(targetUserObj.user.displayAvatarURL({ size: 256, extension: 'png' }))
      .setRank(currentRank)
      .setLevel(fetchedLevel.level)
      .setCurrentXP(fetchedLevel.xp)
      .setRequiredXP(calculateLevelXp(fetchedLevel.level))
      .setStatus(targetUserObj.presence?.status || 'offline')
      .setTextStyles({
        level: "LEVEL:",
        xp: "EXP:",
        rank: "RANK:",
      })
      .setStyles({
        progressbar: {
          thumb: {
            style: {
              backgroundColor: "#00BFFF", // Warna biru neon
            },
          },
          base: {
            style: {
              backgroundColor: "#444", // Warna abu-abu gelap
              borderRadius: "10px", // Agar lebih bulat
            },
          },
        },
        overlay: {
          style: {
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backgroundSize: "cover",
          },
        },
        avatar: {
          border: {
            style: {
              width: "10px",
              color: "#FFD700", // Warna emas untuk border avatar
              radius: "50%",
            },
          },
        },
      })
      .setBackground("https://i.pinimg.com/736x/77/13/56/771356ce493ac07702ece805ecab6f49.jpg"); // Ganti dengan gambar latar belakang kustom
    
    const image = await rank.build({ format: 'png' });
    const attachment = new AttachmentBuilder(image);
    interaction.editReply({ files: [attachment] });
  },

  name: 'level',
  description: "Shows your/someone's level.",
  options: [
    {
      name: 'target-user',
      description: 'The user whose level you want to see.',
      type: ApplicationCommandOptionType.Mentionable,
    },
  ],
};
