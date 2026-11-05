const { 
  Client, 
  Collection, 
  MessageEmbed,
  MessageSelectMenu,
  MessageActionRow,
  } = require("discord.js");

const client = new Client({ intents: 32767 });



const Discord = require('discord.js');
const dbq = require("pro.db");
const db = require("pro.db");
const moment = require('moment');
const fs = require("fs");
const { exec } = require('child_process'); 
const ms = require(`ms`);
const { prefix, owners, Guild } = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require("pro.db");

client.commands = new Collection();
module.exports = client;

client.commands = new Collection();
client.config = require(`${process.cwd()}/config`);
require("./handler")(client);
client.prefix = prefix;

// تشغيل نظام إحصائيات التوب
const topVoiceSessions = new Map();

function updateTopStats(guildId, userId, changes) {
  const key = `top_stats_${guildId}`;
  const stats = db.get(key) || {};

  const user = stats[userId] || {
    points: 0,
    messages: 0,
    voice: 0,
    invites: 0
  };

  for (const [name, amount] of Object.entries(changes)) {
    user[name] = Math.max(
      0,
      (Number(user[name]) || 0) + amount
    );
  }

  stats[userId] = user;
  db.set(key, stats);
}

// احتساب الرسائل
client.on("messageCreate", message => {
  if (!message.guild || message.author.bot) return;

  updateTopStats(message.guild.id, message.author.id, {
    messages: 1,
    points: 1
  });
});

// احتساب الوقت الصوتي
client.on("voiceStateUpdate", (oldState, newState) => {
  if (newState.member?.user.bot) return;

  const key = `${newState.guild.id}_${newState.id}`;
  const wasInVoice = Boolean(oldState.channelId);
  const isInVoice = Boolean(newState.channelId);

  if (!wasInVoice && isInVoice) {
    topVoiceSessions.set(key, Date.now());
  }

  if (wasInVoice && !isInVoice) {
    const started = topVoiceSessions.get(key);

    if (started) {
      const minutes = Math.floor(
        (Date.now() - started) / 60000
      );

      if (minutes > 0) {
        updateTopStats(newState.guild.id, newState.id, {
          voice: minutes,
          points: minutes
        });
      }
    }

    topVoiceSessions.delete(key);
  }
});

// تسجيل الموجودين بالرومات الصوتية عند تشغيل البوت
client.once("ready", () => {
  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (channel.type !== "GUILD_VOICE") continue;

      for (const member of channel.members.values()) {
        if (member.user.bot) continue;

        topVoiceSessions.set(
          `${guild.id}_${member.id}`,
          Date.now()
        );
      }
    }
  }
});

client.login(config.token);
  



  require("events").EventEmitter.defaultMaxListeners = 9999999;
  
  fs.readdir(`${__dirname}/events/`, (err, folders) => {
      if (err) return console.error(err);
  
      folders.forEach(folder => {
          if (folder.includes('.')) return;
  
          fs.readdir(`${__dirname}/events/${folder}`, (err, files) => {
              if (err) return console.error(err);
  
              files.forEach(file => {
                  if (!file.endsWith('.js')) return;
  
                  let eventName = file.split('.')[0];
                  let eventPath = `${__dirname}/events/${folder}/${file}`;
  
                  try {
                      let event = require(eventPath);
                      client.on(eventName, event.bind(null, client));
                  } catch (error) {
                  }
              });
          });
      });
  });

  client.once('ready', () => {
    // استرجاع الحالة المحفوظة من قاعدة البيانات
    let savedStatus = db.get(`${client.guilds.cache.first().id}_status`); // الحصول على الحالة المحفوظة باستخدام معرف السيرفر
    
    // إذا لم تكن هناك حالة محفوظة، استخدم الحالة الافتراضية
    let statusMessage = savedStatus ? savedStatus : "hawk";
  
  
    
  });


    // Fetch all guilds the bot is part of and start updating channels
    
    client.on('messageCreate', async (message) => {
      if (message.author.bot || !message.guild) return;
      if (!message.content.startsWith(prefix)) return;
    
      const args = message.content.slice(prefix.length).trim().split(/ +/);
      const command = args.shift().toLowerCase();
    
      if (command === 'restart') {
        if (!owners.includes(message.author.id)) return message.react('❌');
    
        message.reply('جاري إعادة تشغيل البوت...').then(() => {
          shutdownBot(); // قم بإيقاف البوت أولاً
        });
      }
    });
    
    // Function to shutdown the bot
    function shutdownBot() {
      console.log('إيقاف البوت...');
      client.destroy(); // قم بإيقاف البوت بشكل صحيح
      
      // انتظر بضع ثواني قبل إعادة تشغيل البوت لضمان إيقافه تمامًا
      setTimeout(() => {
        restartBot();
      }, 3000); // تأخير لمدة 3 ثواني قبل إعادة التشغيل للتأكد من إيقاف البوت تماما
    }
    
    // Function to restart the bot
    function restartBot() {
      const restartScript = exec('node index.js'); // استخدام exec هنا
    
      restartScript.on('exit', (code) => {
        console.log(`Bot restarted with code ${code}`);
        process.exit();
      });
    
      restartScript.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
      });
    
      restartScript.stderr.on('data', (data) => {
        console.error(`stderr: ${data}`);
      });
    }
 
client.on('voiceStateUpdate', async (oldState, newState) => {
  if (newState.member.user.bot) return;

  // احصل على بيانات الميوت المخزنة في قاعدة البيانات
  const muteData = db.get(`voicemute_${newState.member.id}`);
  const lastUnmuteData = db.get(`last_unmute_${newState.member.id}`);

  if (muteData) {
      // إذا كان يجب إعادة تطبيق الميوت
      if (oldState.serverMute !== newState.serverMute) {
          console.log(`Detected mute state change for ${newState.member.user.tag}`);

          try {
              const remainingTime = moment(muteData.times, 'LLLL').diff(moment());

              if (newState.serverMute === false && remainingTime > 0) {
                  // تحقق من وقت آخر فك ميوت
                  const lastUnmuteTime = lastUnmuteData ? moment(lastUnmuteData.time) : moment(0);
                  const currentTime = moment();

                  if (currentTime.diff(lastUnmuteTime) < 1000) { // 2000 مللي ثانية = 2 ثانية
                      // إذا لم يمر الوقت الكافي، انتظر
                      setTimeout(async () => {
                          await newState.member.voice.setMute(true, `Reapplying mute for ${muteData.reason}`);

                          // تحديث وقت انتهاء الميوت
                          db.set(`voicemute_${newState.member.id}`, {
                              ...muteData,
                              times: moment().add(ms(muteData.time), 'milliseconds').format('LLLL')
                          });

                          // تحديث وقت آخر فك ميوت
                          db.set(`last_unmute_${newState.member.id}`, {
                              time: moment().format()
                          });
                      }, 1000 - (currentTime.diff(lastUnmuteTime))); // التأخير المتبقي
                  } else {
                      // إذا مر الوقت الكافي، قم بفك الميوت مباشرة
                      await newState.member.voice.setMute(true, `Reapplying mute for ${muteData.reason}`);

                      // تحديث وقت انتهاء الميوت
                      db.set(`voicemute_${newState.member.id}`, {
                          ...muteData,
                          times: moment().add(ms(muteData.time), 'milliseconds').format('LLLL')
                      });

                      // تحديث وقت آخر فك ميوت
                      db.set(`last_unmute_${newState.member.id}`, {
                          time: moment().format()
                      });
                  }
              } else if (remainingTime <= 0) {
                  // إذا انتهت فترة الميوت، أزل البيانات من قاعدة البيانات
                  await newState.member.voice.setMute(false, 'Mute period expired');
                  db.delete(`voicemute_${newState.member.id}`);
                  db.delete(`last_unmute_${newState.member.id}`);
                  console.log(`Removed expired mute data for ${newState.member.user.tag}`);
              }
          } catch (error) {
              console.error(`Failed to handle mute for ${newState.member.user.tag}:`, error);
          }
      }
  }
});
  const maxLimits = {
    roleDelete: 3,
    roleCreate: 3,
    roleUpdate: 3,
    channelDelete: 3,
    channelCreate: 3,
    guildUpdate: 3,
    MemberBanAdd: 3,
    MemberKick: 3,
    channelUpdate: 3,
    voiceChannelDelete: 3,
    voiceChannelCreate: 3,
    memberRoleUpdate: 3,
    memberUpdate: 3
  };
  
  client.on('messageCreate', async (message) => {
    if (message.author.bot) return;
    if (!message.content.startsWith(prefix)) return;
  
    const args = message.content.slice(prefix.length).trim().split(/ +/g);
    const command = args.shift().toLowerCase();
  
    if (command === 'setlimit') {
      if (!owners.includes(message.author.id)) {
        return message.react('❌');
      }
  
      // إنشاء قائمة منسدلة تحتوي على الأنواع المتاحة
      const menu = new MessageSelectMenu()
        .setCustomId('select_limit_type')
        .setPlaceholder('اختر نوع الحد')
        .addOptions(
          Object.keys(maxLimits).map(type => ({
            label: type,
            value: type,
          }))
        );
  
      const row = new MessageActionRow().addComponents(menu);
  
      const embed = new MessageEmbed()
        .setColor('#5c5e64')
        .setDescription('يرجى اختيار نوع الحد من القائمة أدناه.');
  
      const sentMessage = await message.reply({ embeds: [embed], components: [row] });
  
      // إعداد الفلتر للتفاعل مع القوائم المنسدلة
      const filter = interaction => interaction.user.id === message.author.id;
      const collector = sentMessage.createMessageComponentCollector({ filter, time: 60000 });
  
      collector.on('collect', async interaction => {
        if (!interaction.isSelectMenu()) return;
  
        const selectedType = interaction.values[0];
        console.log('Selected Type:', selectedType);
  
        // طلب إدخال الحد الجديد
        await interaction.reply({ content: 'يرجى إدخال الحد الجديد:', ephemeral: true });
  
        // إعداد فلتر لجمع الرسائل
        const responseFilter = response => response.author.id === interaction.user.id;
        const responseCollector = interaction.channel.createMessageCollector({ filter: responseFilter, time: 60000 });
  
        responseCollector.on('collect', async response => {
          const limit = parseInt(response.content);
  
          if (isNaN(limit)) {
            await interaction.followUp({ content: 'الحد غير صالح، يرجى إدخال عدد صحيح.', ephemeral: true });
            return;
          }
  
          maxLimits[selectedType] = limit;
          await dbq.set(`maxLimit_${message.guild.id}_${selectedType}`, limit);
          await interaction.followUp({ content: `تم تعيين الحد الأقصى لـ ${selectedType} على ${limit}`, ephemeral: true });
          responseCollector.stop();
        });
      });
  
      collector.on('end', collected => {
        if (collected.size === 0) {
          const timeoutEmbed = new MessageEmbed()
            .setColor('#ff0000')
            .setDescription('انتهت فترة التفاعل مع القائمة.');
          sentMessage.edit({ embeds: [timeoutEmbed], components: [] });
        }
      });
    } else if (command === 'status') {
      if (!owners.includes(message.author.id)) return message.react('❌');
  
      const guildId = message.guild.id;
      const protectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
      const protectionStatus = protectionEnabled ? 'مفعلة' : 'معطلة';
  
      const logChannelId = await dbq.get(`logChannel_${guildId}`);
      const logChannelMention = logChannelId ? `<#${logChannelId}>` : 'غير محدد';
  
      const embed = new MessageEmbed()
        .setThumbnail("https://media.discordapp.net/attachments/1261416557528092693/1263050250986328125/Blue_Modern_Technology__Gaming_Logo_93.png?ex=6698d2b6&is=66978136&hm=bed42a880774186fb36de8f9fa84bf9c3e6dd474e5f18767100b9a9be7012a5a&=&format=webp&quality=lossless&width=350&height=350")
        .setTitle('حالة الحماية والحدود')
        .addField('الحماية', protectionStatus, true)
        .addField('قناة السجل', logChannelMention, true);
  
      for (const type of Object.keys(maxLimits)) {
        const limit = await dbq.get(`maxLimit_${guildId}_${type}`) || 'غير محدد';
        embed.addField(type, limit.toString(), true);
      }
  
      message.channel.send({ embeds: [embed] });
    }
  });
  
  const actionCounts = new Map();
  const recentExecutions = new Set();
  
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
      // تحقق من أن الحماية مفعلة
      const guildId = newMember.guild.id;
      const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
      if (!isProtectionEnabled) return;
  
      // تحقق من إضافة الأدوار
      if (oldMember.roles.cache.size < newMember.roles.cache.size) {
          const addedRoles = newMember.roles.cache.filter(role => !oldMember.roles.cache.has(role.id));
          const auditLogs = await newMember.guild.fetchAuditLogs({ type: "GUILD_MEMBER_UPDATE" });
          const entry = auditLogs.entries.first();
          if (!entry) return;
  
          const executor = entry.executor;
  
          if (executor.id === client.user.id) return;
  
          // تحقق من أن الشخص الذي أعطى الأدوار ليس في القائمة المستثناة
          let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
          if (bypassedMembers.includes(executor.id)) return;
  
          // إزالة جميع الأدوار من الشخص الذي أعطى الأدوار
          const executorMember = await newMember.guild.members.fetch(executor.id);
          try {
            const executorMember = await newMember.guild.members.fetch(executor.id);
              await executorMember.roles.set([]);
  
              // إزالة الأدوار الجديدة من المستلم
              const rolesToKeep = newMember.roles.cache.filter(role => !addedRoles.has(role.id));
              await newMember.roles.set(rolesToKeep);
  
              // تسجيل الحدث في قناة السجلات
              const logChannelId = await dbq.get(`logChannel_${guildId}`);
              const logChannel = newMember.guild.channels.cache.get(logChannelId);
              const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
              const oldMessage = `Date and Time: ${currentDateTime}`;
  
              if (logChannel) {
                  const embed = new Discord.MessageEmbed()
                      .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                      .setTitle('Roles Server is in Danger')
                      .setColor('#5c5e64')
                      .setTimestamp()
                      .setDescription(`**Reason : تم سحب جميع صلاحياته بسبب إعطاء الأدوار أكثر من مرة**\n**User :** <@${executor.id}>\n\`\`\`${oldMessage}\`\`\``);
                  logChannel.send({ embeds: [embed] });
              }
          } catch (error) {
              console.error('Error removing roles:', error);
          }
      }
  });

 


  client.on('guildUpdate', async (oldGuild, newGuild) => {
    const guildId = newGuild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const auditLogs = await newGuild.fetchAuditLogs({ type: "GUILD_UPDATE" });
    const entry = auditLogs.entries.first();
    const executor = entry.executor;
  
    // تجاهل الأفعال التي قام بها البوت نفسه
    if (executor.id === client.user.id) return;
  
    const actionType = 'guildUpdate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    if (!actionCounts.has(executor.id)) {
      actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
      // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
      let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
      if (bypassedMembers.includes(executor.id)) return;
  
      const member = await newGuild.members.fetch(executor.id);

  
      await member.roles.set([]);
  
      const logChannelId = await dbq.get(`logChannel_${guildId}`);
      const logChannel = newGuild.channels.cache.get(logChannelId);
  
      const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
      const oldMessage = `Date and Time: ${currentDateTime}`;
  
      if (logChannel) {
        const embed = new Discord.MessageEmbed()
          .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
          .setTitle('Guild Update is in Danger')
          .setColor('#5c5e64')
          .setTimestamp()
          .setDescription(`**Reason :  تم سحب جميع صلاحياته بسبب تغييره باعدادات السيرفر.!** 
      **User :** <@${executor.id}>
      \`\`\`${oldMessage}\`\`\``);
        logChannel.send({ embeds: [embed], content: `@everyone` });
      }
  
      // استعادة إعدادات السيرفر الأصلية
      try {
        if (oldGuild.name !== newGuild.name) {
          await newGuild.setName(oldGuild.name);
        }
        if (oldGuild.icon !== newGuild.icon) {
          await newGuild.setIcon(null); // إزالة الأفتار الجديد
          setTimeout(async () => {
            await newGuild.setIcon(oldGuild.iconURL()); // تعيين الأفتار القديم
          }, 1000); // انتظار 1 ثانية قبل إعادة تعيين الأفتار القديم
        }
        if (oldGuild.banner !== newGuild.banner) {
          await newGuild.setBanner(null); // إزالة البنر الجديد
          setTimeout(async () => {
            await newGuild.setBanner(oldGuild.bannerURL()); // تعيين البنر القديم
          }, 1000); // انتظار 1 ثانية قبل إعادة تعيين البنر القديم
        }
      } catch (error) {
        console.error('حدث خطأ أثناء إعادة تعيين الأفتار أو البنر:', error);
      }
      return;
    }
  
    userActions.set(actionType, currentCount + 1);
  });





  client.on('guildBanAdd', async (guild, user) => {
    const guildId = guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;

    const auditLogs = await guild.fetchAuditLogs({ type: "MEMBER_BAN_ADD" });
    const entry = auditLogs.entries.first();
    if (!entry) return;

    const executor = entry.executor;
    if (executor.id === client.user.id) return;

    const actionType = 'MemberBanAdd';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];

    // Ensure user action tracking is in place
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }

    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;

    if (currentCount >= limit) {
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;

        const executorMember = await guild.members.fetch(executor.id);
        const punishmentType = await dbq.get(`punishment_${guildId}`) || 'none';

        // Apply the punishment based on the selected type
        if (punishmentType === 'ban') {
            await executorMember.ban({ reason: 'Exceeded action limit' })
                .then(() => console.log(`Banned ${executor.id} for exceeding limit.`));
        } else if (punishmentType === 'kick') {
            await executorMember.kick('Exceeded action limit')
                .then(() => console.log(`Kicked ${executor.id} for exceeding limit.`));
        } else if (punishmentType === 'remove_roles') {
            await executorMember.roles.set([])
                .then(() => console.log(`Removed roles from ${executor.id} for exceeding limit.`));
        }

        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = guild.channels.cache.get(logChannelId);
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;

        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Ban is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason: تم حظر العضو بسبب تعديه الحد الاقصى .!** 
                **User:** <@${executor.id}>
                \`\`\`${oldMessage}\`\`\``);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }

        return;
    }

    // Increment the user actions count
    userActions.set(actionType, currentCount + 1);
});



client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('setpunishment') || message.author.bot) return;

    const args = message.content.split(' ').slice(1);
    const punishmentType = args[0]?.toLowerCase();

    // Validate punishment type
    if (['ban', 'kick', 'remove_roles'].includes(punishmentType)) {
        const guildId = message.guild.id;
        await dbq.set(`punishment_${guildId}`, punishmentType); // Save the punishment type
        message.channel.send(`تم تعيين العقوبة المختارة: **${punishmentType}**. سيتم تطبيقها عند تخطي الحد الاقصى.`);
    } else {
        message.channel.send('يرجى اختيار عقوبة صحيحة: `ban`, `kick`, أو `remove_roles`.');
    }
});


client.on('guildMemberRemove', async (member) => {
  const guildId = member.guild.id;
  const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
  if (!isProtectionEnabled) return;

  const auditLogs = await member.guild.fetchAuditLogs({ type: "MEMBER_KICK" });
  const entry = auditLogs.entries.first();
  if (!entry) return;

  const executor = entry.executor;
  if (executor.id === client.user.id) return;

  const actionType = 'MemberKick';
  const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];

  // Ensure actionCounts is defined and used to track executor's actions
  if (!actionCounts.has(executor.id)) {
      actionCounts.set(executor.id, new Map());
  }

  const userActions = actionCounts.get(executor.id);
  const currentCount = userActions.get(actionType) || 0;

  if (currentCount >= limit) {
      let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
      if (bypassedMembers.includes(executor.id)) return;

      const executorMember = await member.guild.members.fetch(executor.id);
      const punishmentType = await dbq.get(`punishment_${guildId}`) || 'none';

      // Apply the punishment based on the selected type
      if (punishmentType === 'ban') {
          await executorMember.ban({ reason: 'Exceeded action limit' })
              .then(() => console.log(`Banned ${executor.id} for exceeding limit.`));
      } else if (punishmentType === 'kick') {
          await executorMember.kick('Exceeded action limit')
              .then(() => console.log(`Kicked ${executor.id} for exceeding limit.`));
      } else if (punishmentType === 'remove_roles') {
          await executorMember.roles.set([])
              .then(() => console.log(`Removed roles from ${executor.id} for exceeding limit.`));
      }

      const logChannelId = await dbq.get(`logChannel_${guildId}`);
      const logChannel = member.guild.channels.cache.get(logChannelId);
      const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
      const oldMessage = `Date and Time: ${currentDateTime}`;

      if (logChannel) {
          const embed = new MessageEmbed()
              .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
              .setTitle('Kick is in Danger')
              .setColor('#5c5e64')
              .setTimestamp()
              .setDescription(`**Reason : تم طرد العضو بسبب تعديه الحد الاقصى .!** 
              **User :** <@${executor.id}>
              \`\`\`${oldMessage}\`\`\``);
          logChannel.send({ embeds: [embed], content: `@everyone` });
      }

      return;
  }

  // Increment the user actions count
  userActions.set(actionType, currentCount + 1);
});
  
  client.on('channelUpdate', async (oldChannel, newChannel) => {
    const guildId = newChannel.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const auditLogs = await newChannel.guild.fetchAuditLogs({ type: "CHANNEL_UPDATE" });
    const entry = auditLogs.entries.first();
    if (!entry) return;
  
    const executor = entry.executor;
  
    // Ignore actions made by the bot itself
    if (executor.id === client.user.id) return;
  
    const actionType = 'channelUpdate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
  
        if (newChannel.type === 'GUILD_TEXT' || newChannel.type === 'GUILD_VOICE') {
            if (recentExecutions.has(newChannel.id)) return;
            recentExecutions.add(newChannel.id);
  
            try {
                await newChannel.edit({
                    name: oldChannel.name,
                    topic: oldChannel.topic,
                    nsfw: oldChannel.nsfw,
                    bitrate: oldChannel.bitrate,
                    userLimit: oldChannel.userLimit,
                    parent: oldChannel.parent,
                    permissionOverwrites: oldChannel.permissionOverwrites.cache
                }, 'Protection mechanism: Reverting channel changes.');
  
                const logChannelId = await dbq.get(`logChannel_${guildId}`);
                const logChannel = newChannel.guild.channels.cache.get(logChannelId);
  
                const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
                const oldMessage = `Date and Time: ${currentDateTime}`;
  
                if (logChannel) {
                    const embed = new MessageEmbed()
                        .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                        .setTitle(newChannel.type === 'GUILD_TEXT' ? 'Text Channel Update is in Danger' : 'Voice Channel Update is in Danger')
                        .setColor('#5c5e64')
                        .setTimestamp()
                        .setDescription(`**Reason : توجد تغييرات في شات او روم .!**\n**Channel :** <#${newChannel.id}>\n${oldMessage}`);
                    logChannel.send({ embeds: [embed], content: `@everyone` });
                }
                setTimeout(() => recentExecutions.delete(newChannel.id), 2000);
            } catch (error) {
                console.error('Error reverting channel changes:', error);
            }
        }
        return;
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  
  client.on('roleDelete', async (role) => {
    const guildId = role.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const auditLogs = await role.guild.fetchAuditLogs({ type: "ROLE_DELETE" });
    const entry = auditLogs.entries.first();
    if (!entry) return;
  
    const executor = entry.executor;
  
    // Ignore actions made by the bot itself
    if (executor.id === client.user.id) return;
  
    const actionType = 'roleDelete';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await role.guild.members.fetch(executor.id);
  
        // Check bot permissions
        if (!role.guild.me.permissions.has('MANAGE_ROLES')) {
            console.log('Bot lacks Manage Roles permission');
            return;
        }
  
        const rolePosition = role.position;
  
        await member.roles.set([]);
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = role.guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Role Delete is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى .!**\n**User :** <@${executor.id}>\n${oldMessage}`);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
  
        const newRole = await role.guild.roles.create({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions,
            mentionable: role.mentionable,
            position: rolePosition
        });
  
        await newRole.setPosition(rolePosition);
        return;
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('roleCreate', async (role) => {
    const guildId = role.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'roleCreate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    // Fetch audit logs to get the executor
    const auditLogs = await role.guild.fetchAuditLogs({ type: 'ROLE_CREATE', limit: 1 });
    const auditEntry = auditLogs.entries.first();
    const executor = auditEntry.executor;
  
    if (executor.id === client.user.id) return;
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await role.guild.members.fetch(executor.id);
  
        // Check bot permissions
        if (!role.guild.me.permissions.has('MANAGE_ROLES')) {
            console.log('Bot lacks Manage Roles permission');
            return;
        }
  
        await member.roles.set([]);
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = role.guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Role Create is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى .!**\n**User :** <@${executor.id}>\n${oldMessage}`);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
  
        const newRole = await role.guild.roles.create({
            name: role.name,
            color: role.color,
            hoist: role.hoist,
            permissions: role.permissions,
            mentionable: role.mentionable
        });
  
        return;
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('roleUpdate', async (oldRole, newRole) => {
    const guildId = newRole.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'roleUpdate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    // Fetch audit logs to get the executor
    const auditLogs = await newRole.guild.fetchAuditLogs({ type: 'ROLE_UPDATE', limit: 1 });
    const auditEntry = auditLogs.entries.first();
    const executor = auditEntry.executor;
  
    if (executor.id === client.user.id) return;
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await newRole.guild.members.fetch(executor.id);
  
        await member.roles.set([]);
  
        try {
            await newRole.setPermissions(oldRole.permissions);
        } catch (error) {
            console.error('Error resetting permissions:', error);
        }
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = newRole.guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Role Update is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى.!** 
                **User :** <@${executor.id}>
                \`\`\`${oldMessage}\`\`\``);
  
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('channelDelete', async (channel) => {
    const guildId = channel.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'channelDelete';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    // Fetch audit logs to get the executor
    const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_DELETE', limit: 1 });
    const auditEntry = auditLogs.entries.first();
  
    if (!auditEntry) return; // If there's no relevant audit log entry, exit
  
    const executor = auditEntry.executor;
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await channel.guild.members.fetch(executor.id);
  
        try {
            // Filter out roles that no longer exist in the guild
            const member = await channel.guild.members.fetch(executor.id);
  
            await member.roles.set([]);
        
            
  
            const logChannelId = await dbq.get(`logChannel_${guildId}`);
            const logChannel = channel.guild.channels.cache.get(logChannelId);
  
            const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
            const oldMessage = `Date and Time: ${currentDateTime}`;
  
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                    .setTitle('Channel Delete is in Danger')
                    .setColor('#5c5e64')
                    .setTimestamp()
                    .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى .!**\n**User :** <@${executor.id}>\n${oldMessage}`);
                logChannel.send({ embeds: [embed], content: `@everyone` });
            }
        } catch (error) {
            console.error('Error recreating channel:', error);
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('channelCreate', async (channel) => {
    const guildId = channel.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'channelCreate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
   // Fetch audit logs to get the executor
    const auditLogs = await channel.guild.fetchAuditLogs({ type: 'CHANNEL_CREATE', limit: 1 });
    const auditEntry = auditLogs.entries.first();
    
    if (!auditEntry) return; // If there's no relevant audit log entry, exit
    
    const executor = auditEntry.executor;
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await channel.guild.members.fetch(executor.id);
  
        try {
            // Filter out roles that no longer exist in the guild
            const member = await channel.guild.members.fetch(executor.id);
  
            await member.roles.set([]);
  
            const logChannelId = await dbq.get(`logChannel_${guildId}`);
            const logChannel = channel.guild.channels.cache.get(logChannelId);
  
            const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
            const oldMessage = `Date and Time: ${currentDateTime}`;
  
            if (logChannel) {
                const embed = new MessageEmbed()
                    .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                    .setTitle('Channel Create is in Danger')
                    .setColor('#5c5e64')
                    .setTimestamp()
                    .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى. !**\n**User :** <@${executor.id}>\n${oldMessage}`);
                logChannel.send({ embeds: [embed], content: `@everyone` });
            }
        } catch (error) {
            console.error('Error cloning channel:', error);
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const guildId = newMember.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'guildMemberUpdate';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    // Fetch audit logs to get the executor
    const auditLogs = await newMember.guild.fetchAuditLogs({ type: 'MEMBER_UPDATE', limit: 1 });
    const auditEntry = auditLogs.entries.first();
  
    if (!auditEntry) return; // If there's no relevant audit log entry, exit
  
    const executor = auditEntry.executor;
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        const member = await newMember.guild.members.fetch(executor.id);
  
        try {
            await member.roles.set([]);
        } catch (error) {
            console.error('Error resetting roles:', error);
        }
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = newMember.guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Member Update is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى. !**\n**User :** <@${executor.id}>\n${oldMessage}`);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  
  
  client.on('guildMemberRemove', async (member) => {
    const guildId = member.guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'guildMemberRemove';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
     const executor = member; // تحديد الـ executor بناءً على السياق
  
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        try {
            await member.roles.set([]);
        } catch (error) {
            console.error('Error resetting roles:', error);
        }
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = member.guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Member Remove is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى .!**\n**User :** <@${executor.id}>\n${oldMessage}`);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
  client.on('guildBanAdd', async (guild, user) => {
    const guildId = guild.id;
    const isProtectionEnabled = await dbq.get(`protectionEnabled_${guildId}`) || false;
    if (!isProtectionEnabled) return;
  
    const actionType = 'guildBanAdd';
    const limit = await dbq.get(`maxLimit_${guildId}_${actionType}`) || maxLimits[actionType];
  
    if (!actionCounts.has(executor.id)) {
        actionCounts.set(executor.id, new Map());
    }
  
    const userActions = actionCounts.get(executor.id);
    const currentCount = userActions.get(actionType) || 0;
  
    if (currentCount >= limit) {
        // تجاوز الحد المسموح، استرجاع الإعدادات كما كانت
        let bypassedMembers = await dbq.get(`bypassedMembers_${guildId}`) || [];
        if (bypassedMembers.includes(executor.id)) return;
  
        try {
            await guild.members.unban(user, 'Protection mechanism: User banned');
        } catch (error) {
            console.error('Error unbanning user:', error);
        }
  
        const logChannelId = await dbq.get(`logChannel_${guildId}`);
        const logChannel = guild.channels.cache.get(logChannelId);
  
        const currentDateTime = moment().format('dddd, MMMM Do YYYY, h:mm:ss A');
        const oldMessage = `Date and Time: ${currentDateTime}`;
  
        if (logChannel) {
            const embed = new MessageEmbed()
                .setThumbnail('https://i.top4top.io/p_3140f5wyb1.png')
                .setTitle('Ban Add is in Danger')
                .setColor('#5c5e64')
                .setTimestamp()
                .setDescription(`**Reason : لقد تم سحب جميع صلاحياته بسبب تعديه الحد الاقصى .!**\n**User :** <@${executor.id}>\n${oldMessage}`);
            logChannel.send({ embeds: [embed], content: `@everyone` });
        }
    }
  
    userActions.set(actionType, currentCount + 1);
  });
  
    
    // تعديل الجزء المسؤول عن التعامل مع الأخطاء
  process.on("unhandledRejection", (reason, promise) => {
    console.error("Unhandled Rejection at:", promise, "reason:", reason);
  });
  
  process.on("uncaughtException", (err, origin) => {
    console.error("Uncaught Exception:", err, "origin:", origin);
  });
  
  process.on("uncaughtExceptionMonitor", (err, origin) => {
    console.error("Uncaught Exception Monitor:", err, "origin:", origin);
  });
  
  process.on("multipleResolves", (type, promise, reason) => {
    console.error("Multiple Resolves:", type, "promise:", promise, "reason:", reason);
  });