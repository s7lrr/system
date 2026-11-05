

const Discord = require('discord.js');
const db = require('pro.db');

module.exports = async (client, invite) => {

        let loglinks = db.get(`loglinks_${invite.guild.id}`); // Fetching log pic channel ID from the database
      
        var logChannel = invite.guild.channels.cache.find(c => c.id === loglinks);
    if (!logChannel) return;

    const inviter = invite.inviter;
    const channelName = invite.channel.id || 'Server-wide';
    const inviteCode = invite.code;
    const maxUses = invite.maxUses || 'Unlimited';
    const expiresAt = invite.expiresAt ? invite.expiresAt.toUTCString() : 'Never';

    const embed = new Discord.MessageEmbed()
        .setColor(`#fefeff`)
        .setAuthor(inviter.tag, inviter.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
        .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1183927171979423884/-.png?ex=658a1d1a&is=6577a81a&hm=e052a473f48186950245791521407dc260c4182474d7ad1ae9f9b6d14b46dea3&`)
        .setDescription(`**دعوة تم إنشاؤها\n\nبواسطة  : ${inviter}\nإنشاء في : <#${channelName}>\nرمز الدعوة : \`${inviteCode}\`\nعدد المستخدمين : \`${maxUses}\`\nينتهي فيـ : ${expiresAt}**`)
        .setFooter(invite.guild.name, invite.guild.iconURL({ dynamic: true }))
    logChannel.send({ embeds: [embed] });
};