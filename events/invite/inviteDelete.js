const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, invite) => {


        let loglinks = db.get(`loglinks_${invite.guild.id}`); 
        var logChannel = invite.guild.channels.cache.find(c => c.id === loglinks); 
        if(!logChannel) return;
        if(!invite.guild.id.includes(`${logChannel.guild.id}`)) return;
        const fetchedLogs = await invite.guild.fetchAuditLogs({
          limit: 1,
          type: 'INVITE_DELETE',
        });
        const InviteLog = fetchedLogs.entries.first();
        const { executor, target } = InviteLog;
      
        let embed = new Discord.MessageEmbed()
        .setAuthor(executor.tag, executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
          .setDescription(`**حذف الدعوة**\n\n**انشأ من قبل :**<@${target.inviter.id}>\n**تم الحذف بواسطة :** <@${executor.id}>\n**رمز الدعوة :** \`${invite.code}\``)
          .setColor(`#fefeff`)
          .setFooter(client.user.username, client.user.displayAvatarURL())
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1183927171979423884/-.png?ex=658a1d1a&is=6577a81a&hm=e052a473f48186950245791521407dc260c4182474d7ad1ae9f9b6d14b46dea3&`);
        logChannel.send({ embeds: [embed] });
      

  }