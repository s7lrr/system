const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, oldChannel,newChannel) => {
  
        let logchannels = db.get(`logchannels_${newChannel.guild.id}`); 
        if(!oldChannel.guild) return;
        var logChannel = oldChannel.guild.channels.cache.find(c => c.id === logchannels);
        if(!logChannel) return;
        if(oldChannel.type === 'GUILD_TEXT') {
            var channelType = 'Text';
        }else
        if(oldChannel.type === 'GUILD_VOICE') {
            var channelType = 'Voice';
        }else
        if(oldChannel.type === 'GUILD_CATEGORY') {
            var channelType = 'Category';
        }
       
        oldChannel.guild.fetchAuditLogs().then(logs => { 
            var userID = logs.entries.first().executor.id;
            client.users.fetch(userID).then(user => {
      
            if(oldChannel.name !== newChannel.name) {
                let newName = new Discord.MessageEmbed()
                .setAuthor(user.username, user.avatarURL({ dynamic: true }))
                .setThumbnail('https://cdn.discordapp.com/attachments/1064318878412451921/1179130625727406100/Channel-Create.png?ex=6578a9f8&is=656634f8&hm=b1c3cab1ec4ae7a45800d94e21d9fd5dcd2f65092bea602636213dd2a192ffa4&')
                .setColor(`#fefeff`)
                .setDescription(`**تعديل القناة**\n\n**By : <@${userID}>**\n**أيدي : ${userID}**\n**قناة : <#${oldChannel.id}>**\n\`\`\`✅ - ${oldChannel.name} => ${newChannel.name}\`\`\``)
                .setFooter(client.user.username, client.user.displayAvatarURL())
                logChannel.send({ embeds: [newName] }); 
            }
      
        })
      })


    }

