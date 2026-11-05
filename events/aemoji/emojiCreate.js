const db = require("pro.db");
const Discord = require('discord.js');

module.exports = async (client, emoji) => {
  
        let logChannelId = db.get(`logemoji_${emoji.guild.id}`); // جلب معرف قناة السجل من قاعدة البيانات
        let logChannel = emoji.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;
      
        const fetchedLogs = await emoji.guild.fetchAuditLogs({
            limit: 1,
            type: 'EMOJI_CREATE',
        });
      
        const emojiLog = fetchedLogs.entries.first();
        if (!emojiLog) return;
      
        const { executor } = emojiLog;
      
        // التحقق مما إذا كان الشخص الذي قام بإضافة الإيموجي هو البوت
        if (executor.id === client.user.id) return;
      
        let emojiEmbed = new Discord.MessageEmbed()
            .setAuthor(executor.tag, executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setColor('#fefeff')
            .setDescription(`**إضافة إيموجي**\n\n**بواسطة : <@${executor.id}>**\n**الإيموجي : ${emoji}**\n**عدد الإيموجيات :** \`${emoji.guild.emojis.cache.size.toString()}\`\n**رابط الإمويجي :** [Link](${emoji.url})`)
            .setFooter(client.user.username, client.user.displayAvatarURL())
            .setThumbnail(emoji.url);
      
        logChannel.send({ embeds: [emojiEmbed] });
      
    }

