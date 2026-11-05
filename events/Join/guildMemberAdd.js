/*
const db = require("pro.db");
const inviteTracker = require("invite-tracker");
const Discord = require('discord.js');

const tracker = new inviteTracker(client);

module.exports = async (client, member, inviter) => {
    
  tracker.on("guildMemberAdd", async (member, inviter) => {
    let logJoinLeave = db.get(`logjoinleave_${member.guild.id}`); // Fetching log pic channel ID from the database
    let logChannel = member.guild.channels.cache.get(logJoinLeave);
  
    if (!logChannel) return;
    if (!member.guild.id.includes(`${logChannel.guild.id}`)) return;
    if (member.user.bot) return;

    let serverMembersCount = member.guild.memberCount;

    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'BOT_ADD',
    });

    const botLog = fetchedLogs.entries.first();
    if (!botLog) return;

    const { executor } = botLog;
    const invites = await member.guild.invites.fetch();
    const inviterInvite = invites.find((invite) => invite.inviter.id === executor.id);

    let devices = "Unknown";

    if (member.presence) {
      const deviceType = member.presence.clientStatus;

      if (deviceType) {
        if (deviceType.web) {
          devices = "🌐 متصفح";
        } else if (deviceType.desktop) {
          devices = "💻 كمبيوتر";
        } else if (deviceType.mobile) {
          devices = "📱 جوال";
        }
      }
    }

    let inviterEmbed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setThumbnail('https://cdn.discordapp.com/attachments/1064318878412451921/1179172938554019921/D8B5B65D-9A17-4CEF-A04E-7DA3B13985DD.png?ex=6578d160&is=65665c60&hm=402fec79be852f5f8dae69dd3fe42a2488fc64fb3adfec08f2146c6b27a15611&')
      .setColor('#637a70')
      .setDescription(`**انضمام العضو**\n\n**العضو : ${member && member.user ? `<@${member.user.id}>` : 'Unknown User'}**\n**بواسطة : ${inviter ? inviter : 'Unknown Inviter'}**\n**انضم فيـ : (<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>)**\n**الأجهزة : ${devices}**\n**عدد الأعضاء : ${serverMembersCount}**`)
      .setFooter(inviter ? inviter.username : 'Unknown Inviter', inviter ? inviter.displayAvatarURL({ dynamic: true }) : '');

    logChannel.send({ embeds: [inviterEmbed] });
  });
}
*/
