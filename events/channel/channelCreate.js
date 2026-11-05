const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, channel) => {
  
        if (!channel.guild) return;
        if (!channel.guild.me.permissions.has('EMBED_LINKS')) return;
        if (!channel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
        let logchannels = db.get(`logchannels_${channel.guild.id}`); // Fetching log pic channel ID from the database
        var logChannel = channel.guild.channels.cache.find(c => c.id === logchannels);
        if (!logChannel) return;
      
        if (channel.type === 'GUILD_TEXT') {
          var roomType = 'Text';
        } else if (channel.type === 'GUILD_VOICE') {
          var roomType = 'Voice';
        } else if (channel.type === 'GUILD_CATEGORY') {
          var roomType = 'Category';
        }
      
        channel.guild.fetchAuditLogs().then(logs => {
          var userID = logs.entries.first().executor.id;
          client.users.fetch(userID).then(user => {
            let channelCreate = new Discord.MessageEmbed()
              .setAuthor(user.username, user.avatarURL({ dynamic: true }))
              .setThumbnail('https://cdn.discordapp.com/attachments/1093303174774927511/1138891156818772018/8C926555-671C-4F9C-9136-DAD2229375B4.png')
              .setDescription(`**إنشاء قناة**\n\n**بواسطة : <@${userID}>**\n**قناة : <#${channel.id}>**\n**إنشاء : ${roomType}**\n`)
              .setColor(`#524053`)
              .setFooter(client.user.username, client.user.displayAvatarURL())
            logChannel.send({ embeds: [channelCreate] });
          });
        });

    }

