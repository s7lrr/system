const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, oldRole, newRole) => {


        let logroles = db.get(`logroles_${oldRole.guild.id}`); // Fetching log pic channel ID from the database
        if (!oldRole.guild.me.permissions.has('EMBED_LINKS')) return;
        if (!oldRole.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
      
        var logChannel = oldRole.guild.channels.cache.find((c) => c.id === logroles);
        if (!logChannel) return;
      
        oldRole.guild.fetchAuditLogs().then((logs) => {
          var userID = logs.entries.first().executor.id;
          var usertag = logs.entries.first().executor.tag;
          var userAvatar = logs.entries.first().executor.avatarURL({ dynamic: true });
      
          // Compare relevant properties, including position
          if (
            oldRole.name === newRole.name &&
            oldRole.permissions.bitfield === newRole.permissions.bitfield &&
            oldRole.hexColor === newRole.hexColor &&
            oldRole.position === newRole.position // Add position comparison
          ) {
            // No meaningful changes, skip sending the log
            return;
          }
      
          let roleUpdateName = new Discord.MessageEmbed()
            .setAuthor(usertag, userAvatar)
              .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1164981210846605432/8C926555-671C-4F9C-9136-DAD2229375B4.png?ex=6545304c&is=6532bb4c&hm=8a5a4ec52a8f981a8af903a006bf85724abb877fe21eba0fe1d759c80b393d8c&`)
              .setColor(newRole.hexColor)
              .setDescription(`**تعديل الرول**\n\n**الرول : <@&${oldRole.id}>**\n**بواسطة : <@${userID}>**\n\`\`\`${oldRole.name} => ${newRole.name}\`\`\`\ `)
              .setFooter(client.user.username, client.user.displayAvatarURL())
      
            logChannel.send({ embeds: [roleUpdateName] });
      
      
      
            let permissionsAdded = [];
            let permissionsRemoved = [];
            
            newRole.permissions.toArray().forEach(perm => {
              if (!oldRole.permissions.has(perm)) {
                permissionsAdded.push(perm);
              }
            });
            
            oldRole.permissions.toArray().forEach(perm => {
              if (!newRole.permissions.has(perm)) {
                permissionsRemoved.push(perm);
              }
            });
            
            if (permissionsAdded.length > 0 || permissionsRemoved.length > 0) {
              let formattedPermissionsAdded = permissionsAdded.map(perm => `\`\`\`✅ - ${perm}\`\`\`\ `).join('\n');
              let formattedPermissionsRemoved = permissionsRemoved.map(perm => `\`\`\`❌ - ${perm}\`\`\`\ `).join('\n');
            
              let roleUpdateName = new Discord.MessageEmbed()
                .setAuthor(usertag, userAvatar)
                .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1164975437320044564/F2090C33-D3A6-4816-BDBA-2AC2E4FDDA92.png?ex=65452aec&is=6532b5ec&hm=64a949b42b78aedd0bdeb626125a30f48eded796cbac1c589292444d1b555fa4&')
                .setColor(`#493d5d`)
                .setDescription(`**تعديل الرولات**\n\n**بواسطة : <@${userID}>**\n**الرول : <@&${oldRole.id}>**\n${formattedPermissionsAdded}${formattedPermissionsRemoved}`)
                .setFooter(client.user.username, client.user.displayAvatarURL())
            
              logChannel.send({ embeds: [roleUpdateName] });
            }
          
        });

      

  }