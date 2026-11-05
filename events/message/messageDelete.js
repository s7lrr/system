const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, message) => {
  if (message.channel.type === "DM" || message.author.bot) return;

  // جلب قناة السجل
  const logChannelId = db.get(`logpic_${message.guild.id}`);
  const logChannel = message.guild.channels.cache.get(logChannelId);
  if (!logChannel) return;

  // إذا كانت الرسالة تحتوي على مرفقات
  if (message.attachments.size > 0) {
    for (const attachment of message.attachments.values()) {
      if (attachment.contentType.startsWith("image/") || attachment.contentType.startsWith("video/")) {
        await logChannel.send({ files: [attachment.url] });

        // إرسال Embed للتسجيل
        const messageDelete = new Discord.MessageEmbed()
          .setColor("#EAD196")
          .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true }))
          .setDescription(`**حذف صورة**\n\n**بواسطة :** <@${message.author.id}>\n**فيـ : **${message.channel}\n\`\`\`الرسالة : No Message\`\`\` `)
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1208176130297831465/picmessage.png?ex=65e254b4&is=65cfdfb4&hm=c4f88c34be5f79b486cf6aadf27e3637e4d783c70ea743610d6b6a89ac3b3b79&")
          .setFooter(client.user.username, client.user.displayAvatarURL());

        logChannel.send({ embeds: [messageDelete] });
      }
    }
  }

  else {
    let channelmessage = db.get(`channelmessage_${message.guild.id}`);
    let logChannel = message.guild.channels.cache.find((c) => c.id === channelmessage);
    if (!logChannel) return;

    const messageDelete = new Discord.MessageEmbed()
      .setColor("#8cb9bd")
      .setAuthor(message.author.username, message.author.avatarURL({ dynamic: true })) 
      .setDescription(`**حذف الرسائل**\n\n**بواسطة : <@${message.author.id}>**\n**فيـ : ${message.channel}**\n\`\`\`الرسالة : ${message.content || ": No Message"}\`\`\`\ `)
      .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1208175403748036658/message.png?ex=65e25407&is=65cfdf07&hm=c2d1c37a3864efe43559970f4c201cc0322471a2311ba4c47382d88cb0754839&")
      .setFooter(client.user.username, client.user.displayAvatarURL());

    logChannel.send({ embeds: [messageDelete] });
  }
}
