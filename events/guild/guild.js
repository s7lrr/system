const db = require("pro.db");
const Discord = require('discord.js');
const { prefix, owners, Guild } = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);

module.exports = async (client, guild) => {

        if (guild.id !== config.Guild) {
            guild.leave()
        }
    

  }