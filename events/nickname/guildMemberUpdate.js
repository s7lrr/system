const db = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, oldMember, newMember) => {

    let lognickname = db.get(`lognickname_${newMember.guild.id}`); // Fetching log pic channel ID from the database
    var logChannel = oldMember.guild.channels.cache.find(c => c.id === lognickname);
    if (!logChannel) return;
  
    oldMember.guild.fetchAuditLogs({ limit: 1, type: 'MEMBER_UPDATE' }).then(logs => {
        var entry = logs.entries.first();
        
        if (!entry) return;
  
        var userID = entry.executor;

        if (oldMember.nickname !== newMember.nickname) {
            var oldNM = oldMember.nickname === null ? oldMember.user.username : oldMember.nickname;
            var newNM = newMember.nickname === null ? newMember.user.username : newMember.nickname;
            if (entry.executor.id === client.user.id) return; 
            let updateNickname = new Discord.MessageEmbed()
                .setAuthor(oldMember.user.tag, oldMember.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208201551014002848/signature.png?ex=65e26c61&is=65cff761&hm=89f278d848d3acedc08f9f708b70e7c24bd42974df694028f833e9b27f0ceda4&')
                .setColor(`#C88EA7`)
                .setDescription(`**تغير الكنية**\n\n**لـ : ${oldMember}**\n**بواسطة :** ${userID}\n\`\`\`${oldNM} => ${newNM}\`\`\` `)
                .setFooter(client.user.username, client.user.displayAvatarURL());
  
            logChannel.send({ embeds: [updateNickname] });
        }
    });
}
