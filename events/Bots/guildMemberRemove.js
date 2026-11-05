const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {


        if (!member.user.bot) return;
        let logbots = db.get(`logbots_${member.guild.id}`); 
        var logChannel = member.guild.channels.cache.find(c => c.id === logbots);
        if(!logChannel) return;
      
        let inviter;
        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: 'MEMBER_KICK',
        });
      
        const kickLog = fetchedLogs.entries.first();
        if (!kickLog) {
          const invites = await member.guild.invites.fetch();
          const memberInvites = invites.filter(invite => invite.inviter && invite.inviter.id === member.id);
          memberInvites.each(inv => {
            if (inv.createdAt > (Date.now() - 86400000)) {
              inviter = inv.inviter;
            }
          });
        } else {
          inviter = kickLog.executor;
        }
      
        let inviterName = inviter ? inviter.id : "Unknown";
      
        let leaveMember = new Discord.MessageEmbed()
          .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1208572586754052116/leave.png?ex=65e3c5ee&is=65d150ee&hm=e6a7aca09a65223716761688a7ce9ad3c4fbe4ce8ea27d03f67564c245b17bab&`)
          .setColor(`#fefeff`)
          .setDescription(`**مغادرة البوت**\n\n**البوت : <@${member.user.id}>**\n**الداعي : <@${inviterName}>**\n**أنضم فيـ : (<t:${parseInt(member.user.createdAt / 1000)}:R>)**`)
          .setFooter(client.user.username, client.user.displayAvatarURL());
      
        logChannel.send({ embeds: [leaveMember] });

      

  }

  function Days(date) {
    let now = new Date();
    let diff = now.getTime() - date.getTime();
    let days = Math.floor(diff / 86400000);
    return days + (days == 1 ? " day" : " days") + " ago";
  }
  