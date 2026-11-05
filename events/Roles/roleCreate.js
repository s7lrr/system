const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, role) => {


        let logroles = db.get(`logroles_${role.guild.id}`); // Fetching log pic channel ID from the database
        if (!role.guild.me.permissions.has('EMBED_LINKS')) return;
        if (!role.guild.me.permissions.has('VIEW_AUDIT_LOG')) return;
      
        var logChannel = role.guild.channels.cache.find((c) => c.id === logroles);
        if (!logChannel) return;
      
        role.guild.fetchAuditLogs().then((logs) => {
          var userID = logs.entries.first().executor.id;
          var usertag = logs.entries.first().executor.tag;
          var userAvatar = logs.entries.first().executor.avatarURL({ dynamic: true });
      
          let roleCreate = new Discord.MessageEmbed()
          .setAuthor(usertag, userAvatar)
          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1153814321877495879/07D149C2-6EAC-4543-B8C8-04F8B543EEA3.png')
            .setDescription(`**Create Role**\n\n**By : <@${userID}>**\n**Role : ${role.name}**`)
            .setColor(`#857f99`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
          logChannel.send({ embeds: [roleCreate] });
        });
      

      

  }