const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {
  

      

 
  let logChannelId = db.get(`logbanunban_${member.guild.id}`);
  if (!logChannelId) return;
  let logChannel = member.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;


        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: 'MEMBER_BAN_ADD',
        });
        const BanLog = fetchedLogs.entries.first();
        const { executor, reason } = BanLog; // Extract the reason from the BanLog
        if (executor.id === client.user.id) return; // Skip if the executor is the bot itself
      
        let Embed = new Discord.MessageEmbed()
         .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
          .setDescription(`**حظر عضو**\n\n**لـ : <@${member.user.id}>**\n**بواسطة : ${executor}**\n\`\`\`Reason : ${reason || 'No reason'}\`\`\``)
          .setColor(`#fefeff`)
          .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }))
          .setThumbnail(
            'https://cdn.discordapp.com/attachments/1093303174774927511/1138892172574326874/82073587-11BA-4E4B-AC8F-8857CD89282F.png'
          );
      
        logChannel.send({ embeds: [Embed] });


    }

