const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {



        const fetchedLogs = await member.guild.fetchAuditLogs({
          limit: 1,
          type: 'BOT_ADD',
        });
        const BotLog = fetchedLogs.entries.first();
        const { executor, target } = BotLog;
        if (member.user.bot) {
          let logbots = db.get(`logbots_${member.guild.id}`); // Fetching log pic channel ID from the database
          var logChannel = member.guild.channels.cache.find(c => c.id === logbots);
          
          if (!logChannel) return;
      
          let allBots = member.guild.members.cache.filter(m => m.user.bot).size;
          let onlineBots = member.guild.members.cache.filter(m => m.user.bot && m.presence?.status === 'online').size;
          let offlineBots = allBots - onlineBots;
      
          // تحقق مما إذا كان البوت موثقًا
          const botUser = await client.users.fetch(member.user.id);
          const isVerified = botUser.flags ? botUser.flags.has('VERIFIED_BOT') : false;
          const verifiedText = isVerified ? 'موثوق' : 'غير موثوق';
      
          // الرابط الذي يمكن استخدامه لدعوة البوت إلى السيرفر
          const inviteLink = `https://discord.com/api/oauth2/authorize?client_id=${member.user.id}&permissions=0&scope=bot`;
      
          let embed = new Discord.MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setColor(`#C88EA7`)
            .setFooter(executor.tag, executor.displayAvatarURL())
            .addFields(
              { name: '**إضافة البوتات**', value: '\u200B' },
              { name: '**البوت**', value: `${member}`, inline: true },
              { name: '**بواسطة**', value: `${executor}`, inline: true },
              { name: '**تاريخ الإنشاء**', value: `**(<t:${parseInt(member.user.createdAt / 1000)}:R>)**`, inline: true },
              { name: '**رابط البوت**', value: `**[انقر هنا لدعوة البوت](${inviteLink})**`, inline: true },
              { name: '**عدد البوتات**', value: `**\`( ${allBots} )\`**`, inline: true },
              { name: '**الموثوقية**', value: `**${verifiedText}**`, inline: true }, // إضافة حالة الموثوقية هنا
            )
            .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1208572586498465842/join.png?ex=65e3c5ee&is=65d150ee&hm=d7ee9310bad11a184d44795e4f56125828769cbcc78d0a022744e7cc66d35075&`);
      
          logChannel.send({ embeds: [embed] });
        }
      

  }

  function Days(date) {
    let now = new Date();
    let diff = now.getTime() - date.getTime();
    let days = Math.floor(diff / 86400000);
    return days + (days == 1 ? " day" : " days") + " ago";
  }
  