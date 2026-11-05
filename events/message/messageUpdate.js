const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, oldMessage, newMessage) => {
  if (!oldMessage.guild) return; // Add this check to ensure the message is from a guild

  let channelmessage = db.get(`channelmessage_${oldMessage.guild.id}`);
  
  if (oldMessage.author.bot) return;
  if (oldMessage.channel.type === "DM") return;
  if (!oldMessage.guild.me.permissions.has("EMBED_LINKS")) return;
  if (!oldMessage.guild.me.permissions.has("MANAGE_MESSAGES")) return;

  var logChannel = oldMessage.guild.channels.cache.find(
    (c) => c.id === channelmessage
  );
  if (!logChannel) return;

  if (oldMessage.content.startsWith("https://")) {
    for (const attachment of oldMessage.attachments.values()) {
      logChannel.send({ files: [attachment.url] });
    }
    return;
  }

  let messageUpdate = new Discord.MessageEmbed()
    .setAuthor(oldMessage.author.username, oldMessage.author.avatarURL({ dynamic: true }))
    .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1208178321851031654/EditMessage.png?ex=65e256be&is=65cfe1be&hm=cf953789fbd03fbe732fd55d75f801efa2be44455448eae256844cd77a38f418&")
    .setColor("#8cb9bd")
    .setDescription(`**تعديل الرسالة**\n\n**بواسطة : ** <@${oldMessage.author.id}>\n**فيـ : ${oldMessage.channel}**\n**الرسالة : [أضغط هُنا للوصل إليها](${oldMessage.url})**\n\n**الرسالة القديمة :**\n\`\`\`${oldMessage.content}\`\`\`\n**الرسالة الجديدة :**\`\`\`${newMessage.content}\`\`\` `)
    .setFooter(client.user.username, client.user.displayAvatarURL());
  logChannel.send({ embeds: [messageUpdate] });
}
