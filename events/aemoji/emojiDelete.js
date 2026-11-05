const db = require("pro.db");
const Discord = require('discord.js');

module.exports = async (client, emoji) => {
  
        let logChannelId = db.get(`logemoji_${emoji.guild.id}`); // جلب معرف قناة السجل من قاعدة البيانات
        let logChannel = emoji.guild.channels.cache.get(logChannelId);
        if (!logChannel) return;
      
        const fetchedLogs = await emoji.guild.fetchAuditLogs({
            limit: 1,
            type: 'EMOJI_DELETE',
        });
      
        const emojiLog = fetchedLogs.entries.first();
        if (!emojiLog) return;
      
        const { executor } = emojiLog;
      
        // التحقق مما إذا كان الشخص الذي قام بحذف الإيموجي هو البوت
        if (executor.id === client.user.id) return;
      
        let emojiEmbed = new Discord.MessageEmbed()
            .setAuthor(executor.tag, executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setColor('#546a71')
            .setDescription(`**حذف إيموجي**\n\n**بواسطة : <@${executor.id}>**\n**الإيموجي : ${emoji}**`)
            .setThumbnail(emoji.url)
            .setFooter(client.user.username, client.user.displayAvatarURL());
      
        logChannel.send({ embeds: [emojiEmbed] });
      
      
    }

