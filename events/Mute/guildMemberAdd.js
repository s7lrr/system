const Data = require("pro.db");
const humanizeDuration = require('humanize-duration');
const Discord = require('discord.js');

module.exports = async (client, member) => {


        const prison = Data.get(`MutedMember_${member.id}`);
        const muted = Data.get(`Muted_Member_${member.id}`);
        const guildId = member.guild.id;
        const autoroleId = Data.get(`autorole_${guildId}`);
      
        if (prison) {
            let muteRole = member.guild.roles.cache.find((role) => role.name == "prison");
            if (muteRole) {
                member.roles.add(muteRole)
                    .catch(console.error);
            }
        } else if (muted) {
            let muteRole = member.guild.roles.cache.find((role) => role.name == "Muted");
            if (muteRole) {
                member.roles.add(muteRole)
                    .catch(console.error);
            }
        }
      
        if (autoroleId) {
            const autorole = member.guild.roles.cache.get(autoroleId);
            if (autorole) {
                member.roles.add(autorole)
                    .catch(console.error);
            }
        }
      
      

  }