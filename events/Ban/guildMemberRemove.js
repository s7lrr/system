const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {

        let logkick = db.get(`logkick_${member.guild.id}`);
    
        var logChannel = member.guild.channels.cache.find((c) => c.id === logkick);
        if (!logChannel) return;
      
        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1
        });
        const kickLog = fetchedLogs.entries.first();
        const { executor, target, reason } = kickLog;
      
        if (kickLog.action == 'MEMBER_KICK' && kickLog.target.id == `${member.user.id}`) {

      
          let kickReason = reason || "No reason"; // تحقق من وجود السبب، وإذا لم يكن محددًا، قم بتعيين قيمة افتراضية
          if (executor.id === client.user.id) return; // Skip if the executor is the bot itself
      
          let Embed = new Discord.MessageEmbed()
            .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setDescription(`**طرد عضو**\n\n**العضو : <@${member.user.id}>**\n**بواسطة : ${executor}**\n\`\`\`Reason : ${kickReason}\`\`\`\ `)
            .setColor(`#fefeff`)
            .setFooter(member.user.tag, member.displayAvatarURL({ dynamic: true }))
            .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1209563150119211138/F4570260-9C71-432E-87CC-59C7B4B13FD4.png?ex=65e76077&is=65d4eb77&hm=5d7ef4be2c19a4f52c29255991dc129b53cf33d11c8d962ea0573cd72feaf3ac&`);
      
          logChannel.send({ embeds: [Embed] });
        }
      

  }