const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {
  
        let logbanunban = db.get(`logbanunban_${member.guild.id}`); // Fetching log pic channel ID from the database
        var logChannel = member.guild.channels.cache.find((c) => c.id === logbanunban);
        if (!logChannel) return;
        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: 'MEMBER_BAN_REMOVE',
        });
        const BanLog = fetchedLogs.entries.first();
        const { executor } = BanLog;
      
        if (!logChannel) return;
        if (executor.id === client.user.id) return; // Skip if the executor is the bot itself
      
        let Embed = new Discord.MessageEmbed()
          .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
          .setDescription(`**فك حظر العضو**\n\n**لـ : <@${member.user.id}>**\n**بواسطة : ${executor}**\n\`\`\`Reason : No reason\`\`\`\ `)
          .setColor(`#fefeff`)
          .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
          .setThumbnail(
            'https://cdn.discordapp.com/attachments/1093303174774927511/1138891905283928174/551F8C85-8827-41AF-9286-256F63BE2129.png'
          );
      
        logChannel.send({ embeds: [Embed] });
      


    }

