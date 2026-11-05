const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, channel) => {
  
        if(!channel.guild) return;
        if(!channel.guild.me.permissions.has('EMBED_LINKS')) return;
        if(!channel.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
        let logchannels = db.get(`logchannels_${channel.guild.id}`); // Fetching log pic channel ID from the database
        var logChannel = channel.guild.channels.cache.find(c => c.id === logchannels);
        if(!logChannel) return; 
      
        if(channel.type === 'GUILD_TEXT') { 
            var roomType = 'Text';
        }else
        if(channel.type === 'GUILD_VOICE') { 
            var roomType = 'Voice';
        }else
        if(channel.type === 'GUILD_CATEGORY') { 
            var roomType = 'Category';
        }
      
        channel.guild.fetchAuditLogs().then(logs => {
            var userID = logs.entries.first().executor.id;
            client.users.fetch(userID).then(user => {
      
            let channelDelete = new Discord.MessageEmbed()
            .setAuthor(user.username, user.avatarURL({ dynamic: true }))
            .setDescription(`**حذف القناة**\n\n**By : <@${userID}>**\n**قناة :${channel.name}**\n**إنشاء : ${roomType}**\n`)
            .setColor(`#524053`)
            .setTimestamp()
            .setThumbnail(`https://cdn.discordapp.com/attachments/1064318878412451921/1179130626180386926/Channel-Delete.png?ex=6578a9f8&is=656634f8&hm=54e0c8a4cf65a9fc083bf148b0c996afd9f13192116449c1cdfc1482f87ddf74&`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            logChannel.send({ embeds: [channelDelete] }); 
          });
        })
    }

