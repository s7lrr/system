const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {
  if (member.user.bot) return;

  let logjoinleave = db.get(`logjoinleave_${member.guild.id}`); // Fetching log pic channel ID from the database
  var logChannel = member.guild.channels.cache.find(c => c.id === logjoinleave);
  if (!logChannel) return;

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
          if (inv.createdAt > (Date.now() - 86400000)) { // Check if the invite was created within the last 24 hours
              inviter = inv.inviter;
          }
      });
  } else {
      inviter = kickLog.executor;
  }

  let inviterName = inviter ? inviter.id : "Unknown";

  let leaveMember = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setThumbnail('https://cdn.discordapp.com/attachments/1064318878412451921/1179172938331717682/AFB742D0-5B6A-4C25-BF91-FBA284280087.png?ex=6578d160&is=65665c60&hm=b6792253bc6fee3b37f039fba3abb2e75508daa5b6269270cf15aae8b25f7e26&')
      .setColor(`#637a70`)
      .setDescription(`**مغادرة العضو**\n\n**العضو : <@${member.user.id}>**\n**الداعي : <@${inviterName}>**\n**أنضم فيـ : (<t:${parseInt(member.user.createdAt / 1000)}:R>)**`)
      .setFooter(client.user.username, client.user.displayAvatarURL());

      if (member.roles.cache.size > 1) { 
        const mentionedRoles = member.roles.cache
            .filter(role => role.name !== '@everyone') // نستبعد رول الجميع
            .map(role => role.toString()); // نقوم بتحويل كل رول إلى منشن
    
        leaveMember.addField('الأدوار السابقة', mentionedRoles.join(', '));
    }
    
  logChannel.send({ embeds: [leaveMember] });
}