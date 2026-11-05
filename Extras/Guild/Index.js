const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton,
MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent, Permissions } = require("discord.js");
const { createCanvas, registerFont, canvas, loadImage } = require("canvas")
const Discord = require("discord.js")
var { inviteTracker } = require("discord-inviter");
let client = require('../..')
const fs = require("fs")
const ms = require(`ms`)
const { prefix, owners, Guild,token} = require(`${process.cwd()}/config`);
const config = require(`${process.cwd()}/config`);
const Data = require("pro.db")
const db = require(`pro.db`)
module.exports = client;
client.config = require(`${process.cwd()}/config`);
//const tracker = new inviteTracker(client);
const { createTranscript } = require("discord-html-transcripts");
const { Canvas, loadFont } = require('canvas-constructor/cairo');
const humanizeDuration = require('humanize-duration');
const levelXPMap = require("./../../levelXPMap.json");
const emojione = require('emojione');
const fetch = require('node-fetch');




// --------------------------------------------------------------------------------------------------------

var { inviteTracker } = require("discord-inviter"), tracker = new inviteTracker(client);
tracker.on('guildMemberAdd', async (member, inviter) => {
    const canvas = createCanvas(826, 427);
    const ctx = canvas.getContext('2d');
    let backgroundImageURL = Data.get(`imgwlc_${member.guild.id}`) || `${process.cwd()}/Fonts/wlc.png`;

    try {
        const backgroundImage = await loadImage(backgroundImageURL);
        canvas.width = backgroundImage.width;
        canvas.height = backgroundImage.height;
        ctx.drawImage(backgroundImage, 0, 0);
    } catch (error) {
    }

    const avatar = await loadImage(member.user.displayAvatarURL({ format: 'png', size: 512 }));
    const avatarUpdates = Data.get(`editwel_${member.guild.id}`) || { size: 260, x: 233, y: 83.5, isCircular: true };

    const { size, x, y, isCircular } = avatarUpdates;
    ctx.save();
    if (isCircular) {
        ctx.beginPath();
        ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
        ctx.closePath();
        ctx.clip();
    }
    ctx.drawImage(avatar, x, y, size, size);
    ctx.restore();


    const fetchedLogs = await member.guild.fetchAuditLogs({
        limit: 1,
        type: 'BOT_ADD',
    });
    const BotLog = fetchedLogs.entries.first();
    const { executor } = BotLog;
    const invites = await member.guild.invites.fetch();
    const inviterInvite = invites.find((invite) => invite.inviter.id === executor.id);

    const mesg = Data.get(`mesg_message_${member.guild.id}`) || '';
    let finalMessage = mesg.replace(/\[user\]/g, `<@${member.id}>`);

    if (inviter) {
        finalMessage = finalMessage.replace(/\[inviter\]/g, `<@${inviter.id}>`);
    }

    finalMessage = finalMessage.replace(/\[membercount\]/g, member.guild.memberCount); 
    finalMessage = finalMessage.replace(/\[servername\]/g, member.guild.name);

    // Get username updates from database
    const nameUpdates = Data.get(`editname_${member.guild.id}`);
    if (nameUpdates) {
        const { size: nameSize, x: nameX, y: nameY } = nameUpdates;
        ctx.font = `bold ${nameSize}px Cairo`; 
        ctx.fillStyle = '#FFFFFF'; 
        ctx.fillText(member.user.displayName, nameX, nameY); 
    }
    
    

    const chatwlc = Data.get(`chat_wlc_${member.guild.id}`);
    const channel = member.guild.channels.cache.find(c => c.id === chatwlc && c.type === 'GUILD_TEXT');

    if (channel) {
        await channel.send({ files: [canvas.toBuffer()] });
        if (finalMessage.trim() !== '') {
            setTimeout(async () => {
                await channel.send({ content: finalMessage });
            }, 1000);
        }
    }
});


// --------------------------------------------------------------------------------------------------------
  tracker.on("guildMemberAdd", async (member, inviter) => {
    let logJoinLeave = db.get(`logjoinleave_${member.guild.id}`); // Fetching log pic channel ID from the database
    let logChannel = member.guild.channels.cache.get(logJoinLeave);
  
    if (!logChannel) return;
    if (!member.guild.id.includes(`${logChannel.guild.id}`)) return;
    if (member.user.bot) return;

    let serverMembersCount = member.guild.memberCount;

    const fetchedLogs = await member.guild.fetchAuditLogs({
      limit: 1,
      type: 'BOT_ADD',
    });

    const botLog = fetchedLogs.entries.first();
    if (!botLog) return;

    const { executor } = botLog;
    const invites = await member.guild.invites.fetch();
    const inviterInvite = invites.find((invite) => invite.inviter.id === executor.id);

    let devices = "Unknown";

    if (member.presence) {
      const deviceType = member.presence.clientStatus;

      if (deviceType) {
        if (deviceType.web) {
          devices = "🌐 متصفح";
        } else if (deviceType.desktop) {
          devices = "💻 كمبيوتر";
        } else if (deviceType.mobile) {
          devices = "📱 جوال";
        }
      }
    }

    let inviterEmbed = new Discord.MessageEmbed()
      .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
      .setThumbnail('https://cdn.discordapp.com/attachments/1064318878412451921/1179172938554019921/D8B5B65D-9A17-4CEF-A04E-7DA3B13985DD.png?ex=6578d160&is=65665c60&hm=402fec79be852f5f8dae69dd3fe42a2488fc64fb3adfec08f2146c6b27a15611&')
      .setColor('#637a70')
      .setDescription(`**انضمام العضو**\n\n**العضو : ${member && member.user ? `<@${member.user.id}>` : 'Unknown User'}**\n**بواسطة : ${inviter ? inviter : 'Unknown Inviter'}**\n**انضم فيـ : (<t:${Math.floor(member.joinedAt.getTime() / 1000)}:R>)**\n**الأجهزة : ${devices}**\n**عدد الأعضاء : ${serverMembersCount}**`)
      .setFooter(inviter ? inviter.username : 'Unknown Inviter', inviter ? inviter.displayAvatarURL({ dynamic: true }) : '');

    logChannel.send({ embeds: [inviterEmbed] });
  });

  // --------------------------------------------------------------------------------------------------------
	
 client.on('guildMemberUpdate', async (oldMember, newMember) => {
    const blockedRoles = Pro.fetch(`blockedRoles_${newMember.id}`) || [];

    if (blockedRoles.length === 0) return; // No blocked roles

    // Get the roles being added
    const rolesToRemove = newMember.roles.cache.filter(role => 
        blockedRoles.includes(role.id)
    );

    // If the new member has roles that are in the blocked list, remove them
    if (rolesToRemove.size > 0) {
        await newMember.roles.remove(rolesToRemove).catch(console.error);

        rolesToRemove.forEach(role => {
            console.log(`Removed role ${role.name} from ${newMember.user.tag} due to blocking.`);
        });
        
        // Notify the user who attempted to add the role
        const author = oldMember.guild.members.cache.get(oldMember.id);
        if (author) {
            author.send(`You attempted to assign the role ${rolesToRemove.map(role => role.name).join(', ')} to ${newMember.user.tag}, but they are blocked from this role.`)
                 .catch(console.error);
        }
    }
});
  
  
// --------------------------------------------------------------------------------------------------------
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const blockedRoles = Pro.fetch(`blockedRoles_${newMember.id}`) || [];

  if (blockedRoles.length === 0) return; // No blocked roles

  // Get the roles being added
  const rolesToRemove = newMember.roles.cache.filter(role => 
      blockedRoles.includes(role.id)
  );

  // If the new member has roles that are in the blocked list, remove them
  if (rolesToRemove.size > 0) {
      await newMember.roles.remove(rolesToRemove).catch(console.error);

      rolesToRemove.forEach(role => {
          console.log(`Removed role ${role.name} from ${newMember.user.tag} due to blocking.`);
      });
      
      // Notify the user who attempted to add the role
      const author = oldMember.guild.members.cache.get(oldMember.id);
      if (author) {
          author.send(`You attempted to assign the role ${rolesToRemove.map(role => role.name).join(', ')} to ${newMember.user.tag}, but they are blocked from this role.`)
               .catch(console.error);
      }
  }
});


// --------------------------------------------------------------------------------------------------------

const B = new MessageActionRow().addComponents(
  new MessageButton()
    .setCustomId(`Delete`)
    .setStyle(`SECONDARY`)
    .setEmoji(`🔒`),
  new MessageButton()
    .setCustomId(`Adding`)
    .setStyle(`SECONDARY`)
    .setEmoji(`➕`),
  new MessageButton()
    .setCustomId(`Reminder`)
    .setStyle(`SECONDARY`)
    .setEmoji(`⏰`),
  new MessageButton() // زر تغيير الاسم
    .setCustomId(`ChangeName`)
    .setStyle(`SECONDARY`)
    .setEmoji(`✏️`)
);

client.on('interactionCreate', async function (Message) {
  const Color = db.get(`Guild_Color = [${Message.guild.id}]`) || '#fefeff';
  if (!Color) return;

  if (Message.isSelectMenu()) 
    if (Message.customId === 'M0') {
    const Image = db.get(`Image = [${Message.guild.id}]`);
    const Role = db.get(`Role = [${Message.guild.id}]`);
    const Cat = db.get(`Cat = [${Message.guild.id}]`);
    const ReasonOptions = db.get(`menuOptions_${Message.guild.id}`) || [];
    const Parent = Message.guild.channels.cache.find(C => C.id === Cat);

    const selectedOption = ReasonOptions.find(option => option.value === Message.values[0]);
    const reason = selectedOption ? selectedOption.label : 'No Reason Provided';

    if (db.get(`member${Message.user.id}`) === true) 
      return Message.reply({ content: '**عندك تذكرة مفتوح بالفعل!**', ephemeral: true });

    await Message.guild.channels.create(`ticket-${Message.user.username}`, {
      type: 'GUILD_TEXT',
      parent: Parent.id,
      permissionOverwrites: [
        {
          id: Message.user.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'], 
        },
        {
          id: Role,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES', 'ATTACH_FILES'],
        },
        {
          id: Message.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
      ],
    }).then(async Cahnnels => {
      db.set(`channel${Cahnnels.id}`, Message.user.id);
      db.set(`member${Message.user.id}`, true);
      await Message.reply({ content: `**تم إنشاء التذكرة ${Cahnnels}**`, ephemeral: true });
      const content = `${Message.user}\nنوع التذكرة : ${reason}`;
      Cahnnels.send({ files: [Image] }).then(async () => {
        await Cahnnels.send({ content: `${content}`, components: [B] }).then(async () => {
          setTimeout(() => {
            const tcsend = db.get(`tcsend_${Message.guild.id}`);
            if (tcsend) {
              Cahnnels.send(tcsend);
            }
          }, 3000);
        });
      });
    });
  } else if (['M2', 'M3', 'M4', 'M5', 'M6', 'M7', 'M8', 'M9', 'M10', 'M11', 'M12', 'M13'].includes(Message.values[0])) {
    const Image = db.get(`Image = [${Message.guild.id}]`);
    const Role = db.get(`Role = [${Message.guild.id}]`);
    const Cat = db.get(`Cat = [${Message.guild.id}]`);
    const Parent = Message.guild.channels.cache.find(C => C.id === Cat);

    if (db.get(`member${Message.user.id}`) === true) 
      return Message.reply({ content: '**لديك تذكرة مفتوح بالفعل!**', ephemeral: true });

    await Message.guild.channels.create(`ticket-${Message.user.username}`, {
      type: 'GUILD_TEXT',
      parent: Parent.id,
      permissionOverwrites: [
        {
          id: Message.user.id,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: Role,
          allow: ['VIEW_CHANNEL', 'SEND_MESSAGES'],
        },
        {
          id: Message.guild.roles.everyone,
          deny: ['VIEW_CHANNEL'],
        },
      ],
    }).then(async Cahnnels => {
      db.set(`channel${Cahnnels.id}`, Message.user.id);
      db.set(`member${Message.user.id}`, true);
      await Message.reply({ content: `**تم إنشاء التذكرة ${Cahnnels}**`, ephemeral: true });
      Cahnnels.send({ files: [Image] }).then(async () => {
        await Cahnnels.send({ content: `${content}`, components: [B] }).then(async () => { });
      });
    });
  }
});

client.on('interactionCreate', async interaction => {
  if (interaction.isButton()) {
    const roleId = db.get(`Role = [${interaction.guild.id}]`);
    const role = interaction.guild.roles.cache.get(roleId);
    
    if (interaction.customId === "Delete") {
      if (!interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return await interaction.reply({ content: `**لا تستطيع تنفيذ هذا الإجراء.** 🚫`, ephemeral: true });
      }

      const Channel = client.channels.cache.find(C => C.id == `${db.get(`Channel = [${interaction.guild.id}]`)}`);
      if (!Channel) return;

      const transcript = await createTranscript(interaction.channel, {
        returnType: 'buffer',
        minify: true,
        saveImages: true,
        useCDN: true,
        poweredBy: false,
        fileName: `${interaction.channel.name}.html`,
      });

      const Color = db.get(`Guild_Color = ${interaction.guild.id}`) || '#fefeff';
      if (!Color) return;

      const embed = new MessageEmbed()
        .setColor(Color || '#fefeff')
        .setAuthor(`${interaction.user.tag}`, interaction.user.avatarURL({ dynamic: true, size: 1024, format: 'png' }))
        .setDescription(`**إغلاق تذكرة**\n**تذكرة : <@${db.get(`channel${interaction.channel.id}`)}>**\n**بواسطة : ${interaction.user}\n**اسم التذكرة : ${interaction.channel.name}**`)
        .setFooter(`${interaction.guild.name}`, interaction.guild.iconURL())
        .setTimestamp();

      await interaction.reply({ content: `**🎫 سيتم حذف التذكرة خلال ثواني**`, ephemeral: true });
      await Channel.send({ files: [transcript], embeds: [embed] });

      setTimeout(async () => {
        if (db.get(`channel${interaction.channel.id}`)) {
          let Member = client.users.cache.find((x) => x.id == db.get(`channel${interaction.channel.id}`));
          db.delete(`member${Member.id}`)
          db.delete(`channel${interaction.channel.id}`)
        }
        await interaction.channel.delete();
      }, 5000);
    } else if (interaction.customId === "Adding") {
      if (!role || !interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return await interaction.reply({ content: `**لا تستطيع تنفيذ هذا الإجراء.** 🚫`, ephemeral: true });
      }
      const Services = new Modal().setCustomId(`add`).setTitle(`اضافه شخص`);
      const Service_1 = new TextInputComponent().setCustomId('Ad').setLabel(`ضف ايدي الشخص`).setStyle(`SHORT`).setPlaceholder(' ').setRequired(true);
      const Service1 = new MessageActionRow().addComponents(Service_1);
      Services.addComponents(Service1);
      interaction.showModal(Services);
    } 
    else if (interaction.customId === "Reminder") {
      if (!role || !interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return await interaction.reply({ content: `**لا تستطيع تنفيذ هذا الإجراء.** 🚫`, ephemeral: true });
      }

      // Get the user who opened the ticket
      const memberId = db.get(`channel${interaction.channel.id}`); // Get the ID of the member who opened the ticket
      const member = await interaction.guild.members.fetch(memberId); // Fetch the member object

      // Send a reminder DM to the user
      const ticketChannel = interaction.channel; // Get the ticket channel
      const reminderMessage = `عزيزي: ${member.user}, لقد تم استدعاؤك لتذكرتك\nللاطلاع على تذكرتك: <#${ticketChannel.id}>\nشكرًا لك..`;

      await member.send(reminderMessage).catch(err => {
        console.error('فشل إرسال رسالة تذكير:', err);
        return interaction.reply({ content: `**حدث خطأ أثناء إرسال الرسالة!**`, ephemeral: true });
      });

      await interaction.reply({ content: `**تم إرسال تذكير إلى ${member.user} في DM!**`, ephemeral: true });
    } else if (interaction.customId === "ChangeName") {
      if (!role || !interaction.member.roles.cache.has(role.id) && !interaction.member.permissions.has('ADMINISTRATOR')) {
        return await interaction.reply({ content: `**لا تستطيع تنفيذ هذا الإجراء.** 🚫`, ephemeral: true });
      }

      const newTicketNameModal = new Modal()
        .setCustomId('changeTicketName')
        .setTitle('تغيير اسم التذكرة');

      const nameInput = new TextInputComponent()
        .setCustomId('newName')
        .setLabel('ادخل الاسم الجديد')
        .setStyle('SHORT')
        .setPlaceholder('اسم التذكرة الجديدة')
        .setRequired(true);

      const nameInputRow = new MessageActionRow().addComponents(nameInput);
      newTicketNameModal.addComponents(nameInputRow);
      await interaction.showModal(newTicketNameModal);
    }
  } else if (interaction.isModalSubmit()) {
    if (interaction.customId === "changeTicketName") {
      const newName = interaction.fields.getTextInputValue('newName');
      await interaction.channel.setName(newName) // تغيير اسم القناة
        .then(() => {
          interaction.reply({ content: `**تم تغيير اسم التذكرة إلى: ${newName}**`, ephemeral: true });
        })
        .catch(error => {
          console.error(error);
          interaction.reply({ content: `**حدث خطأ أثناء تغيير الاسم.**`, ephemeral: true });
        });
    } else if (interaction.customId === "add") {
      const Service1 = interaction.fields.getTextInputValue('Ad');
      const Member = await interaction.guild.members.cache.get(Service1);
      const channel = interaction.channel;

      await channel.permissionOverwrites.edit(Member, { VIEW_CHANNEL: true, SEND_MESSAGES: true });
      await interaction.reply({ content: `**تم إضافة الشخص لتذكرة : ${Member}**`, ephemeral: true }).catch(() => { });
    }
  }
});

client.on('channelDelete', async channel => {
  if (channel.type === 'GUILD_TEXT' && db.has(`channel${channel.id}`)) {
    const memberId = db.get(`channel${channel.id}`);
    const member = await channel.guild.members.fetch(memberId);

    db.delete(`channel${channel.id}`);
    db.delete(`member${member.id}`);
  }
});
// ----------------------------------------------------------------------


let { joinVoiceChannel } = require("@discordjs/voice");
        client.on("ready", async () => {
            let Voice = await Data.get(`Voice_${client.user.id}`)
            const channel = client.channels.cache.get(Voice);
            if (!channel || channel.type !== "GUILD_VOICE") { return }
            const GUILD = channel.guild;
            const connection = joinVoiceChannel({
              channelId: Voice,
              guildId: GUILD.id,
              adapterCreator: GUILD.voiceAdapterCreator,
              selfDeaf: true
            });
            connection;
          })


// ----------------------------------------------------------------------
const interval = 50000;
client.on('ready', async () => {
    setInterval(async () => {
        try {
            const Url = db.get(`Url = [ Colors ]`);
            const channel_id = await db.get("Channel = [ Colors ]");
            if (!channel_id) return;
            const channel = client.channels.cache.get(channel_id);
            if (!channel) return;
            const colorRoles = channel.guild.roles.cache.filter(
                (role) => !isNaN(role.name) && !role.name.includes(".")
            );

            const sortedRoles = colorRoles.sort((roleA, roleB) => roleB.position - roleA.position);

            let minRange = 1;
            let maxRange = 22;
            let canvasHeight = 400;
            if (sortedRoles.size > 22) {
              minRange = 22;
              maxRange = 25;
              canvasHeight = 400;
            } 

            const colorsList = createCanvas(1200, canvasHeight); 

            let backgroundImage;
            if (Url) {
                try {
                    backgroundImage = await loadImage(Url);
                } catch (error) {
                    console.error("Error loading background image:", error);
                }
            }

            const ctx = colorsList.getContext("2d");
    
            if (backgroundImage) {
              // حساب موقع الصورة في المنتصف
              const xCenter = (colorsList.width - backgroundImage.width) / 2;
              const yCenter = (colorsList.height - backgroundImage.height) / 2;
              
              ctx.drawImage(backgroundImage, xCenter, yCenter);
            }
        
            let x = 16;
            let y = canvasHeight / 2 - 55; // بدلاً من 145
        
            sortedRoles.forEach((colorRole, index) => {
              x += 90;
        
              // بدلاً من الشرط السابق، يمكنك استخدام الشرط التالي لوضع 11 لون في منتصف الصورة
              if (index >= minRange && index < maxRange) {
                x += 90;
              }
        
              if (x > 1080) {
                x = 110;
                y += 90;
              }
        
              ctx.textBaseline = "middle";
              ctx.textAlign = "center";
              
              // تحديد لون التعبئة
              ctx.fillStyle = colorRole.hexColor;
              
              // إضافة حواف سوداء بارزة
              ctx.lineWidth = 5; // حجم الحاف
              ctx.strokeStyle = "black"; // لون الحاف
              
              // رسم المربع
              const borderRadius = 17;
              ctx.beginPath();
              ctx.moveTo(x + borderRadius, y);
              ctx.lineTo(x + 70 - borderRadius, y);
              ctx.quadraticCurveTo(x + 70, y, x + 70, y + borderRadius);
              ctx.lineTo(x + 70, y + 70 - borderRadius);
              ctx.quadraticCurveTo(x + 70, y + 70, x + 70 - borderRadius, y + 70);
              ctx.lineTo(x + borderRadius, y + 70);
              ctx.quadraticCurveTo(x, y + 70, x, y + 70 - borderRadius);
              ctx.lineTo(x, y + borderRadius);
              ctx.quadraticCurveTo(x, y, x + borderRadius, y);
              ctx.closePath();
              
              // رسم الحواف
              ctx.stroke();
              
              // رسم التعبئة
              ctx.fill();
              
              const colorNumber = colorRole.name;
              const fontSize = "40px";
              const cellWidth = 70;
              const cellHeight = 70;
              
              ctx.font = fontSize + " Arial";
              ctx.lineWidth = 3;
              ctx.strokeStyle = "black";
              ctx.strokeText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
              ctx.fillStyle = "#ffffff";
              ctx.fillText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
            });
        
            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;
            ctx.shadowOffsetX = 0;
            ctx.shadowOffsetY = 0;
        
            const attachment = new MessageAttachment(colorsList.toBuffer(), "img.png");

            const selectMenu = new MessageSelectMenu()
                .setCustomId("Colors")
                .setPlaceholder("قم باختيار اللون المناسب .")
                .setMaxValues(1)
                .setMinValues(1);

            sortedRoles.forEach((colorRole) => {
                selectMenu.addOptions({
                    label: colorRole.name,
                    value: colorRole.id,
                    emoji: '',
                });
            });
            channel.bulkDelete(100);
            const message = await channel.send({
                files: [attachment],
                components: [{ type: 1, components: [selectMenu] }],
            });

            const collector = message.createMessageComponentCollector({ componentType: "SELECT_MENU" });

            collector.on("collect", async (interaction) => {
                const selectedColorRoleId = interaction.values[0];
                const selectedColorRole = channel.guild.roles.cache.get(selectedColorRoleId);

                if (!selectedColorRole) return;

                const member = interaction.member;
                const oldColorRoles = member.roles.cache.filter(
                    (role) => !isNaN(role.name) && !role.name.includes(".")
                );

                await member.roles.remove(oldColorRoles);
                await member.roles.add(selectedColorRole);

                interaction.reply({
                    content: `**تم تغيير اللون بنجاح إلي ${selectedColorRole.name}**`,
                    ephemeral: true,
                });
            });

        } catch (error) {
            console.error("Error:", error);
        }
    }, interval);
});

////////////////////////////////////////////////////////////////////////
const interva1l = 50000;
client.on('ready', async () => {
    setInterval(async () => {
        try {
            const Url = db.get(`Url = [ Colors ]`);
            const channel_id = await db.get("avtclear");
            if (!channel_id) return;
            const channel = client.channels.cache.get(channel_id);
            if (!channel) return;
            const colorRoles = channel.guild.roles.cache.filter(
                (role) => !isNaN(role.name) && !role.name.includes(".")
            );

            const sortedRoles = colorRoles.sort((roleA, roleB) => roleB.position - roleA.position);

            let minRange = 1;
            let maxRange = 11;
            let canvasHeight = 330;

            if (sortedRoles.size > 11) {
                minRange = 12;
                maxRange = 15;
                canvasHeight = 400;
            } if (sortedRoles.size > 22) {
                minRange = 22;
                maxRange = 33;
                canvasHeight = 500;
            } if (sortedRoles.size > 34) {
                minRange = 34;
                maxRange = 44;
                canvasHeight = 600;
            }

            const colrsList = createCanvas(1200, canvasHeight);

            let backgroundImage;
            if (Url) {
                try {
                    backgroundImage = await loadImage(Url);
                } catch (error) {
                    console.error("Error loading background image:", error);
                }
            }

            const ctx = colrsList.getContext("2d");
            if (backgroundImage) {
                ctx.drawImage(backgroundImage, 0, 0, 1200, 500);
            } else {
                ctx.clearRect(0, 0, colrsList.width, colrsList.height);
            }

            let x = 20;
            let y = 145;

            sortedRoles.forEach((colorRole) => {
                x += 90;
                if (x > 1080) {
                    x = 110;
                    y += 90;
                }

                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                
                // تحديد لون التعبئة
                ctx.fillStyle = colorRole.hexColor;
                
                // إضافة حواف سوداء بارزة
                ctx.lineWidth = 5; // حجم الحاف
                ctx.strokeStyle = "black"; // لون الحاف
                
                // رسم المربع
                const borderRadius = 15;
                ctx.beginPath();
                ctx.moveTo(x + borderRadius, y);
                ctx.lineTo(x + 70 - borderRadius, y);
                ctx.quadraticCurveTo(x + 70, y, x + 70, y + borderRadius);
                ctx.lineTo(x + 70, y + 70 - borderRadius);
                ctx.quadraticCurveTo(x + 70, y + 70, x + 70 - borderRadius, y + 70);
                ctx.lineTo(x + borderRadius, y + 70);
                ctx.quadraticCurveTo(x, y + 70, x, y + 70 - borderRadius);
                ctx.lineTo(x, y + borderRadius);
                ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                ctx.closePath();
                
                // رسم الحواف
                ctx.stroke();
                
                // رسم التعبئة
                ctx.fill();
                
                // ... (الأجزاء الأخرى من الكود)
                
                const colorNumber = colorRole.name;
                const fontSize = "40px";
                const cellWidth = 70;
                const cellHeight = 70;
                
                ctx.font = fontSize + " Arial";
                ctx.lineWidth = 3;
                ctx.strokeStyle = "black";
                ctx.strokeText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
                ctx.fillStyle = "#ffffff";
                ctx.fillText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
              });
          
              ctx.shadowColor = "transparent";
              ctx.shadowBlur = 0;
              ctx.shadowOffsetX = 0;
              ctx.shadowOffsetY = 0;

            channel.bulkDelete(100);
            const attachment = new MessageAttachment(colrsList.toBuffer(), "img.png");
            await channel.send({ files: [attachment], });
          

        } catch (error) {
            console.error("Error:", error);
        }
    }, interva1l);
});

const interva3l = 50000;
client.on('ready', async () => {
    setInterval(async () => {
        try {
            const channel_id = await db.get("avtchatcolors");
            if (!channel_id) return;
            const channel = client.channels.cache.get(channel_id);
            if (!channel) return;

            const savedImageUrl = db.get(`savedImageUrl_${channel.guild.id}`);
            if (savedImageUrl) {
                channel.bulkDelete(100);
                const attachment = new MessageAttachment(savedImageUrl);
                await channel.send({ files: [attachment] });
            } else {
                const colorRoles = channel.guild.roles.cache.filter(
                    (role) => !isNaN(role.name) && !role.name.includes(".")
                );

                const sortedRoles = colorRoles.sort((roleA, roleB) => roleB.position - roleA.position);

                let minRange = 1;
                let maxRange = 11;
                let canvasHeight = 330;

                if (sortedRoles.size > 11) {
                    minRange = 12;
                    maxRange = 15;
                    canvasHeight = 400;
                } if (sortedRoles.size > 22) {
                    minRange = 22;
                    maxRange = 33;
                    canvasHeight = 500;
                } if (sortedRoles.size > 34) {
                    minRange = 34;
                    maxRange = 44;
                    canvasHeight = 600;
                }

                const colrsList = createCanvas(1200, canvasHeight);

                let backgroundImage;
                const Url = db.get(`Url = [ Colors ]`);
                if (Url) {
                    try {
                        backgroundImage = await loadImage(Url);
                    } catch (error) {
                        console.error("Error loading background image:", error);
                    }
                }

                const ctx = colrsList.getContext("2d");
                if (backgroundImage) {
                    ctx.drawImage(backgroundImage, 0, 0, 1200, 500);
                } else {
                    ctx.clearRect(0, 0, colrsList.width, colrsList.height);
                }

                let x = 20;
                let y = 145;

                sortedRoles.forEach((colorRole) => {
                    x += 90;
                    if (x > 1080) {
                        x = 110;
                        y += 90;
                    }

                    ctx.textBaseline = "middle";
                    ctx.textAlign = "center";

                    ctx.fillStyle = colorRole.hexColor;

                    ctx.lineWidth = 5; // حجم الحاف
                    ctx.strokeStyle = "black"; // لون الحاف

                    // رسم المربع
                    const borderRadius = 15;
                    ctx.beginPath();
                    ctx.moveTo(x + borderRadius, y);
                    ctx.lineTo(x + 70 - borderRadius, y);
                    ctx.quadraticCurveTo(x + 70, y, x + 70, y + borderRadius);
                    ctx.lineTo(x + 70, y + 70 - borderRadius);
                    ctx.quadraticCurveTo(x + 70, y + 70, x + 70 - borderRadius, y + 70);
                    ctx.lineTo(x + borderRadius, y + 70);
                    ctx.quadraticCurveTo(x, y + 70, x, y + 70 - borderRadius);
                    ctx.lineTo(x, y + borderRadius);
                    ctx.quadraticCurveTo(x, y, x + borderRadius, y);
                    ctx.closePath();

                    ctx.stroke();

                    ctx.fill();

                    const colorNumber = colorRole.name;
                    const fontSize = "40px";
                    const cellWidth = 70;
                    const cellHeight = 70;

                    ctx.font = fontSize + " Arial";
                    ctx.lineWidth = 3;
                    ctx.strokeStyle = "black";
                    ctx.strokeText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
                    ctx.fillStyle = "#ffffff";
                    ctx.fillText(colorNumber.toString(), x + cellWidth / 2, y + cellHeight / 2);
                });

                ctx.shadowColor = "transparent";
                ctx.shadowBlur = 0;
                ctx.shadowOffsetX = 0;
                ctx.shadowOffsetY = 0;

                channel.bulkDelete(100);
                const attachment = new MessageAttachment(colrsList.toBuffer(), "img.png");
                await channel.send({ files: [attachment] });
            }

            const savedText = db.get(`savedText_${channel.guild.id}`);
            if (savedText) {
                channel.send(savedText);
            } else {
                channel.send(`
\`${prefix}link\` لأرسال رابط سيرفرك
\`${prefix}change\` لتحويل الصورة من ملون إلى رمادي
\`${prefix}edit-image\` لآضافة فلاتر علي الصورة وتعديلها
\`${prefix}banner\` تحصل على بنر أي شخص بواسطة الأيدي 
\`${prefix}avt\` تجيب أفتار شخص بواسطة الأيدي
                `);
            }
        } catch (error) {
            console.error("Error:", error);
        }
    }, interva3l);
});


// ----------------------------------------------------------------------


client.on('roleUpdate', async (oldRole, newRole) => {
  const guildId = newRole.guild.id;
  const antiPermsEnabled = await db.get(`antiPerms_${guildId}`);

  if (antiPermsEnabled) {
    // Define which permissions you want to protect.
    const disallowedPermissions = [
      'ADMINISTRATOR',
      'MANAGE_GUILD',
      'MANAGE_ROLES',
      'MANAGE_CHANNELS',
      'KICK_MEMBERS',   // Permission to kick members
      'BAN_MEMBERS'     // Permission to ban members
    ];

    // Check if the new permissions include any disallowed ones
    const oldPermissions = oldRole.permissions.toArray();
    const newPermissions = newRole.permissions.toArray();

    const hasDisallowedPermission = disallowedPermissions.some(permission => {
      return newPermissions.includes(permission) && !oldPermissions.includes(permission);
    });

    if (hasDisallowedPermission) {
      try {
        // Revert the role permissions to what they were before
        await newRole.setPermissions(oldRole.permissions);
        console.log(`Reverted permissions for role: ${newRole.name} in guild: ${guildId}`);

        // Get the user who updated the role
        const auditLogs = await newRole.guild.fetchAuditLogs({
          limit: 1,
          type: 'ROLE_UPDATE'
        });
        const fetchedLog = auditLogs.entries.first();
        const executor = fetchedLog ? fetchedLog.executor : null;

        // Get members with the role that may have been granted disallowed permissions
        const membersWithRole = newRole.members;

        // Kick or ban members based on the permissions they were granted
        for (const member of membersWithRole) {
          if (newPermissions.includes('KICK_MEMBERS') || newPermissions.includes('BAN_MEMBERS')) {
            try {
              if (newPermissions.includes('KICK_MEMBERS')) {
                await member.kick('Kicked due to anti-permissions policy');
                console.log(`Kicked member: ${member.user.tag} from guild: ${guildId}`);
              }
              if (newPermissions.includes('BAN_MEMBERS')) {
                await member.ban({ reason: 'Banned due to anti-permissions policy' });
                console.log(`Banned member: ${member.user.tag} in guild: ${guildId}`);
              }
            } catch (error) {
              console.error(`Failed to kick/ban member ${member.user.tag}: ${error}`);
            }
          }
        }

        // Log the changes in a channel named 'logs'
        const logChannel = newRole.guild.channels.cache.find(channel => channel.name === "log-protection");
        if (logChannel) {
          const embed = new MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Permission Change Reverted and Member Actions Taken")
            .setDescription(`The permissions for the role **${newRole.name}** have been reverted due to anti-permissions protection.\n` +
                            `Members with this role may have been kicked or banned.\n\n` +
                            `**Action Taken By:** ${executor ? executor.tag : 'Unknown'}\n` + 
                            `${executor ? executor.displayAvatarURL({ dynamic: true }) : ''}`)
            .setFooter(`User ID: ${executor ? executor.id : 'N/A'}`, executor ? executor.displayAvatarURL({ dynamic: true }) : undefined);
              
          logChannel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error(`Failed to revert permissions for role ${newRole.name}: ${error}`);
      }
    }
  }
});

// ----------------------------------------------------------------------

const cooldowns = new Set(); // To keep track of recently changed names

client.on('guildUpdate', async (oldGuild, newGuild) => {
    try {
        const guildId = newGuild.id;
        const isProtectionEnabled = await db.get(`antiServerName_${guildId}`); 

        // Proceed only if protection is enabled
        if (isProtectionEnabled && oldGuild.name !== newGuild.name) {
            // Check if the server is already in cooldown to prevent spamming
            if (!cooldowns.has(guildId)) {
                cooldowns.add(guildId); // Add guildId to cooldown set
                
                // Revert the server name to the old name
                await newGuild.setName(oldGuild.name);
                console.log(`Reverted server name in guild: ${newGuild.name}`);

                // Use setTimeout for the delay, then set the name again
                setTimeout(async () => {
                    try {
                        await newGuild.setName(oldGuild.name); // Attempt to set the old name again
                        console.log(`Set server name back to: ${oldGuild.name}`);
                    } catch (error) {
                        console.error(`Failed to set server name after delay: ${error}`);
                    } finally {
                        cooldowns.delete(guildId); // Remove guildId from cooldown set after the timeout
                    }
                }, 2000); // 2-second delay

                // Identify the user who changed the name
                const auditLogs = await newGuild.fetchAuditLogs({
                    limit: 1,
                    type: 'MODIFY_GUILD',
                });

                const log = auditLogs.entries.first();
                const executor = log?.executor; // The user who attempted to change the name

                if (executor) {
                    const member = newGuild.members.cache.get(executor.id);
                    if (member) {
                        // Find the highest role of the member
                        const highestRole = member.roles.highest;

                        // Remove that specific highest role if it's not the @everyone role
                        if (highestRole.id !== newGuild.id) {
                            await member.roles.remove(highestRole);
                            console.log(`Removed role ${highestRole.name} from ${executor.username}`);
                        }

                        // Log the action
                        const logChannel = newGuild.channels.cache.find(channel => channel.name === 'logs');
                        if (logChannel) {
                            const embed = new MessageEmbed()
                                .setColor('#ff0000')
                                .setTitle('Server Name Change Reverted')
                                .setDescription(`The server name change was reverted.`)
                                .addField('User', executor.tag)
                                .addField('Attempted New Name', newGuild.name)
                                .addField('Original Name', oldGuild.name)
                                .setTimestamp();

                            await logChannel.send({ embeds: [embed] });
                        }
                    }
                }
            } else {
                console.log(`Ignored change in guild ${newGuild.name} due to cooldown.`);
            }
        }
    } catch (error) {
        console.error(`Failed to revert server name change: ${error}`);
    }
});

// ----------------------------------------------------------------------

client.on('guildUpdate', async (oldGuild, newGuild) => {
    const guildId = newGuild.id;
    const isAvatarProtectionEnabled = await db.get(`antiServerAvatar_${guildId}`);

    if (isAvatarProtectionEnabled) {
        const savedAvatar = await db.get(`savedServerAvatar_${guildId}`);

        // Check if the avatar has changed
        if (oldGuild.icon !== newGuild.icon) {
            try {
                // Revert the avatar to the saved one
                await newGuild.setIcon(savedAvatar);
                console.log(`Reverted avatar for guild: ${newGuild.name}`);
                
                // Optional: Notify admins about the reversion
                const logChannel = newGuild.channels.cache.find(channel => channel.name === 'logs'); // Change this to your desired channel
                if (logChannel) {
                    logChannel.send(`The server avatar was changed but has been reverted to maintain protection.`);
                }
            } catch (error) {
                console.error(`Failed to revert server avatar for guild: ${newGuild.name}`, error);
            }
        }
    }
});

// ----------------------------------------------------------------------

client.on('webhookUpdate', async (channel) => {
  const guildId = channel.guild.id;
  const antiWebhookEnabled = await db.get(`antiWebhook_${guildId}`);
  
  if (antiWebhookEnabled) {
    const webhooks = await channel.fetchWebhooks();

    webhooks.forEach(async (webhook) => {
      // Delete the webhook if anti-webhook is enabled
      try {
        await webhook.delete("Deleted due to anti-webhook policy");
        console.log(`Deleted webhook ${webhook.name} in channel ${channel.name}`);
      } catch (error) {
        console.error(`Failed to delete webhook ${webhook.name}: ${error}`);
      }
    });
  }
});

// ----------------------------------------------------------------------

// Event listener for when a member updates (i.e., roles change)
client.on('guildMemberUpdate', async (oldMember, newMember) => {
  const rolesAfter = newMember.roles.cache;

  // Retrieve blocked users from the database for this guild
  const currentBlockedUsers = db.get(`blocked_users_${newMember.guild.id}`) || {};

  // Loop over every blocked role
  for (const [roleId, userIds] of Object.entries(currentBlockedUsers)) {
    if (rolesAfter.has(roleId) && userIds.includes(newMember.id)) {
      // Remove the blocked role from the user
      await newMember.roles.remove(roleId);
      console.log(`Removed role ${roleId} from user ${newMember.user.tag}`);
      
      // Notify the user about the removal
      await newMember.send(`You were removed from the role ${rolesAfter.get(roleId).name} because it is blocked.`);
    }
  }
});
// ----------------------------------------------------------------------

// مستمع الحدث للفحص بعد إرسال الرسالة
client.on('messageCreate', async (message) => {
  // تخطي الرسائل من البوتات
  if (message.author.bot) return;

  // تحقق من قائمة المستخدمين المحظورين
  const blockedPics = db.get(`blocked_pics_${message.guild.id}`) || [];

  // تحقق مما إذا كان المستخدم محظورًا
  if (blockedPics.includes(message.author.id) && message.attachments.size > 0) {
    // أزل الرسالة
    await message.delete();
    // أخبر المستخدم أنه محظور من إرسال الصور
    await message.author.send("You are not allowed to send images in this server.");
  }
});

// ----------------------------------------------------------------------
// Function to load all reaction roles
async function loadReactionRoles() {
  const guilds = client.guilds.cache;

  for (const guild of guilds.values()) {
    const reactionRoles = db.get(`reaction_roles_${guild.id}`) || {};
    
    for (const [channelId, messages] of Object.entries(reactionRoles)) {
      const channel = guild.channels.cache.get(channelId);
      if (!channel || !channel.isText()) continue;

      for (const [messageId, roles] of Object.entries(messages)) {
        try {
          let targetMessage = await channel.messages.fetch(messageId).catch(err => null);
          
          if (!targetMessage) {
            console.log(`Message with ID ${messageId} not found in guild ${guild.name}.`);
            continue;
          }

          // React with each defined emoji
          for (const [emoji, roleId] of Object.entries(roles)) {
            const role = guild.roles.cache.get(roleId);
            if (role) {
              await targetMessage.react(emoji);
              console.log(`Reacted with ${emoji} on message ${messageId} in ${guild.name}`);
            } else {
              console.log(`Role ${roleId} not found in guild ${guild.name}`);
            }
          }
        } catch (error) {
          console.error(`Could not fetch or react to message ${messageId} in guild ${guild.name}: ${error.message}`);
        }
      }
    }
  }
}

// Set reaction roles from command
client.on('messageCreate', async message => {
  if (!message.content.startsWith(prefix) || message.author.bot) return;

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'setreactionrole') {
    if (!owners.includes(message.author.id)) return message.react('❌');

    const channelId = args[0];
    const messageId = args[1];
    const roleMention = message.mentions.roles.first();
    const emoji = args[3];

    // Validate arguments
    if (!channelId || !messageId || !roleMention || !emoji) {
      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Missing Arguments")
        .setDescription(`Please provide a channel ID, message ID, a role and an emoji.\nUsage: \`${prefix}setreactionrole <channel_id> <message_id> @role :emoji:\``);
      return message.reply({ embeds: [embed] });
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || !channel.isText()) {
      return message.reply({ embeds: [{ title: "Invalid Channel", description: `No valid text channel found with ID: ${channelId}`, color: "#ff0000"}] });
    }

    const targetMessage = await channel.messages.fetch(messageId).catch(err => null);
    if (!targetMessage) {
      return message.reply({ embeds: [{ title: "Message Not Found", description: `Could not find a message with the ID: ${messageId}.`, color: "#ff0000"}] });
    }

    await targetMessage.react(emoji);

    const guildId = message.guild.id;
    const reactionRoles = db.get(`reaction_roles_${guildId}`) || {};
    
    // Initialize database structure
    if (!reactionRoles[channelId]) {
      reactionRoles[channelId] = {};
    }
    if (!reactionRoles[channelId][messageId]) {
      reactionRoles[channelId][messageId] = {};
    }
    reactionRoles[channelId][messageId][emoji] = roleMention.id;

    await db.set(`reaction_roles_${guildId}`, reactionRoles);
    
    const embed = new MessageEmbed()
      .setColor("#0099ff")
      .setTitle("Reaction Role Set Up")
      .setDescription(`Now users can react with ${emoji} to get the ${roleMention.name} role on the message in <#${channelId}>.`);
    message.channel.send({ embeds: [embed] });
  }

  // Command to remove a reaction role
  if (command === 'rereactrole') {
    if (!owners.includes(message.author.id)) return message.react('❌');

    const channelId = args[0];
    const messageId = args[1];
    const emoji = args[2];

    // Validate arguments
    if (!channelId || !messageId || !emoji) {
      const embed = new MessageEmbed()
        .setColor("#ff0000")
        .setTitle("Missing Arguments")
        .setDescription(`Please provide a channel ID, message ID, and an emoji.\nUsage: \`${prefix}rereactrole <channel_id> <message_id> :emoji:\``);
      return message.reply({ embeds: [embed] });
    }

    const channel = message.guild.channels.cache.get(channelId);
    if (!channel || !channel.isText()) {
      return message.reply({ embeds: [{ title: "Invalid Channel", description: `No valid text channel found with ID: ${channelId}`, color: "#ff0000"}] });
    }

    const targetMessage = await channel.messages.fetch(messageId).catch(err => null);
    if (!targetMessage) {
      return message.reply({ embeds: [{ title: "Message Not Found", description: `Could not find a message with the ID: ${messageId}.`, color: "#ff0000"}] });
    }

    const guildId = message.guild.id;
    const reactionRoles = db.get(`reaction_roles_${guildId}`) || {};

    // Check if the emoji exists
    const roleId = reactionRoles[channelId]?.[messageId]?.[emoji];
    if (!roleId) {
      return message.reply({ embeds: [{ title: "Reaction Role Not Found", description: `No reaction role was found for the given emoji on this message.`, color: "#ff0000"}] });
    }

    // Remove the reaction from the message
    await targetMessage.reactions.cache.get(emoji)?.remove();

    // Remove the entry for this emoji from the database
    delete reactionRoles[channelId][messageId][emoji];
    if (Object.keys(reactionRoles[channelId][messageId]).length === 0) {
      delete reactionRoles[channelId][messageId]; // Clean up if no roles are left for the message
    }
    if (Object.keys(reactionRoles[channelId]).length === 0) {
      delete reactionRoles[channelId]; // Clean up if no roles are left for the channel
    }

    await db.set(`reaction_roles_${guildId}`, reactionRoles);

    const embed = new MessageEmbed()
      .setColor("#ff0000")
      .setTitle("Reaction Role Removed")
      .setDescription(`Removed the reaction role for ${emoji} on the message in <#${channelId}>.`);
    message.channel.send({ embeds: [embed] });
  }
});

// Load reaction roles on startup
client.once('ready', async () => {
  await loadReactionRoles();
});

// Reaction added event
client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return;

  const { message } = reaction;

  // Fetch the message if it's partial
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      console.error("Could not fetch the message:", error);
      return;
    }
  }

  const guildId = message.guild.id;
  const reactionRoles = db.get(`reaction_roles_${guildId}`) || {};
  const channelId = message.channel.id;
  const roleId = reactionRoles[channelId]?.[message.id]?.[reaction.emoji.name];

  if (!roleId) return;

  const member = await message.guild.members.fetch(user.id);
  
  if (!member.roles.cache.has(roleId)) {
    await member.roles.add(roleId);
    console.log(`Assigned role ${roleId} to user ${user.tag}`);
  }
});

// Reaction removed event
client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return;

  const { message } = reaction;

  // Fetch the message if it's partial
  if (message.partial) {
    try {
      await message.fetch();
    } catch (error) {
      console.error("Could not fetch the message:", error);
      return;
    }
  }

  const guildId = message.guild.id;
  const reactionRoles = db.get(`reaction_roles_${guildId}`) || {};
  const channelId = message.channel.id;
  const roleId = reactionRoles[channelId]?.[message.id]?.[reaction.emoji.name];

  if (!roleId) return;

  const member = await message.guild.members.fetch(user.id);

  if (member.roles.cache.has(roleId)) {
    await member.roles.remove(roleId);
    console.log(`Removed role ${roleId} from user ${user.tag}`);
  }
});


// ----------------------------------------------------------------------

// When the bot is ready
client.once('ready', async () => {

  // Loop through all servers the bot is in
  client.guilds.cache.forEach(async (guild) => {
      const channelId = Data.get(`selected_channel_${guild.id}`);
      if (channelId) {
          try {
              const channel = await client.channels.fetch(channelId);
              if (channel && channel.isText()) {
                  await setupMessageListener(client, channelId);
                  console.log(`Listening to messages in channel ID: ${channelId}`);
                  await loadPreviousMessages(channel);
              } else {
                  console.error(`Channel ID ${channelId} is not a valid text channel.`);
              }
          } catch (error) {
              console.error(`Could not fetch channel with ID ${channelId}:`, error);
          }
      }
  });
});

// Setup message listener function
async function setupMessageListener(client, channelId) {
  const channel = await client.channels.fetch(channelId);
  if (!channel || !channel.isText()) return;

  const messageHandler = async (msg) => {
      if (msg.channel.id === channelId && !msg.author.bot) {
          const embedColor = Data.get(`embed_color_${msg.guild.id}`) || '#0099ff';
          const messageEmbed = new MessageEmbed()
              .setColor(embedColor)
              .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL({ dynamic: true, size: 512 }) })
              .setDescription(msg.content)
              .setTimestamp()
              .setFooter({ text: client.user.username, iconURL: client.user.displayAvatarURL() })
              .setThumbnail(msg.author.displayAvatarURL({ dynamic: true, size: 128 }));

          await msg.channel.send({ embeds: [messageEmbed] });
          try {
              await msg.delete();
              console.log('Deleted user message:', msg.content);
          } catch (err) {
              console.error('Error deleting message:', err);
          }
      }
  };

  client.on('messageCreate', messageHandler);
  await loadPreviousMessages(channel);
}

// Function to load previous messages
async function loadPreviousMessages(channel) {
  try {
      const fetchedMessages = await channel.messages.fetch({ limit: 10 });
      const embedColor = Data.get(`embed_color_${channel.guild.id}`) || '#0099ff';

      fetchedMessages.forEach(async (msg) => {
          if (!msg.author.bot) {
              const messageEmbed = new MessageEmbed()
                  .setColor(embedColor)
                  .setAuthor({ name: msg.author.username, iconURL: msg.author.displayAvatarURL({ dynamic: true, size: 512 }) })
                  .setDescription(msg.content)
                  .setTimestamp()
                  .setFooter({ text: channel.client.user.username, iconURL: channel.client.user.displayAvatarURL() })
                  .setThumbnail(msg.author.displayAvatarURL({ dynamic: true, size: 128 }));

              await channel.send({ embeds: [messageEmbed] });
          }
      });
  } catch (err) {
      console.error('Error loading previous messages:', err);
  }
}

client.on('voiceStateUpdate', async (oldState, newState) => {
  try {

    const isMuteChange = oldState.serverMute !== newState.serverMute && 
                        (oldState.channel || newState.channel);
                        
    const isDeafChange = oldState.serverDeaf !== newState.serverDeaf && 
                        (oldState.channel || newState.channel);

    // Only proceed if there's a genuine state change
    if (isMuteChange || isDeafChange) {
      await logMuteChange(oldState, newState);
    }
  } catch (error) {
    console.error('حدث خطأ في معالج تحديث حالة الصوت:', error); 
  }
});

async function logMuteChange(oldState, newState) {
  // Return early if both states are null or undefined
  if (!oldState && !newState) return;
  
  const user = newState.member.user;
  const moderator = await getMuteModerator(newState.guild, user);

  const logChannelID = db.get(`logmutedeafen_${newState.guild.id}`); 
  const logChannel = newState.guild.channels.cache.get(logChannelID);
  if (!logChannel) return;

  let action = 'غير معروف';
  let thumbnailURL = '';
  
  // More precise checks for state changes
  if (oldState.serverMute !== newState.serverMute && (oldState.channel || newState.channel)) {
    if (newState.serverMute) {
      action = 'تم كتم الصوت';
      thumbnailURL = 'https://cdn.discordapp.com/attachments/1315422420370194462/1325902424371630160/mute-microphone.png?ex=677d7a5c&is=677c28dc&hm=ac9582060f1dff5261cdb9d04682fcd9c4d08dca2dd9c92557000bb307ab56b3&';
    } else if (oldState.serverMute) { // Only if they were previously muted
      action = 'تم إلغاء كتم الصوت';
      thumbnailURL = 'https://cdn.discordapp.com/attachments/1315422420370194462/1325902283065655396/microphone.png?ex=677d7a3a&is=677c28ba&hm=ecc708dc7ee265daccfffa660e4b65a66f53716e82044c772657442cbca3323b&';
    }
  } else if (oldState.serverDeaf !== newState.serverDeaf && (oldState.channel || newState.channel)) {
    if (newState.serverDeaf) {
      action = 'تم تعطيل الصوت';
      thumbnailURL = 'https://cdn.discordapp.com/attachments/1315422420370194462/1325902579279855677/mute.png?ex=677d7a80&is=677c2900&hm=d154d1c4fc15869fb975633ab1fa1f09fb783c22198c0cf5bccd5fcdf0211427&';
    } else if (oldState.serverDeaf) { // Only if they were previously deafened
      action = 'تم تمكين الصوت';
      thumbnailURL = 'https://cdn.discordapp.com/attachments/1315422420370194462/1325902693612650597/support.png?ex=677d7a9c&is=677c291c&hm=44936085ccf17af64eb2a4ab968cf155b04801ad0ea0b3eeda186672635f7094&';
    }
  }

  // Only send embed if we have a valid action
  if (action !== 'غير معروف') {
    const embed = new MessageEmbed()
      .setColor('#FF0000')
      .setAuthor({
        name: 'تحديث حالة الصوت',
      })
      .setThumbnail(thumbnailURL)
      .setDescription(
        `**الإجراء:** ${action}\n` +
        `**المستخدم:** ${user}\n` +
        `**بواسطة:** ${moderator || 'غير معروف'}\n` +
        `**في القناة:** ${newState.channel ? newState.channel.name : 'بلا'} `
      )
      .setTimestamp()
      .setFooter({
        text: user.tag,
        iconURL: user.displayAvatarURL({ dynamic: true }),
      });

    try {
      await logChannel.send({ embeds: [embed] });
    } catch (error) {
      console.error('فشل في إرسال الرسالة المضمنة:', error); 
    }
  }
}

async function getMuteModerator(guild, user) {
  const fetchedLogs = await guild.fetchAuditLogs({
    limit: 1,
    type: 'MEMBER_UPDATE',
  });

  const auditLogEntry = fetchedLogs.entries.first();
  if (auditLogEntry && auditLogEntry.target.id === user.id) {
    return auditLogEntry.executor;
  }

  return null;
}




const deletedChannelsCount = new Map();
const deleteTimestamps = new Map();
const createdChannelsCount = new Map(); 
const createTimestamps = new Map(); 
const maxDeletes = 3; // أقصى عدد لحذف القنوات
const resetTime = 3 * 60 * 1000; // 3 دقائق بالمللي ثانية


client.on('channelDelete', async (deletedChannel) => {
  let logantidelete = Data.get(`logantidelete_${deletedChannel.guild.id}`);
    const antiDeleteEnabled = Data.get(`antiDelete-${deletedChannel.guild.id}`);
    if (!antiDeleteEnabled) return; // Check if anti-delete feature is enabled

    if (deletedChannel.type === 'GUILD_TEXT' || deletedChannel.type === 'GUILD_VOICE' || deletedChannel.type === 'GUILD_CATEGORY') {
        const guild = deletedChannel.guild;
        const channelName = deletedChannel.name;
        const channelType = deletedChannel.type;
        const guildId = deletedChannel.guild.id;

        try {
            const logs = await guild.fetchAuditLogs({ type: 'CHANNEL_DELETE' });
            const entry = logs.entries.first();
            
            if (entry && entry.executor.id === client.user.id) {
                return; 
            }


                    if (owners.includes(entry.executor.id)) return;
                    const wanti = Data.get(`wanti_${guildId}`);
                    if (wanti && wanti.includes(entry.executor.id)) return;

            const parentCategory = deletedChannel.parent;
            let recreatedChannel;
            if (parentCategory) {
                recreatedChannel = await guild.channels.create(channelName, { type: channelType, parent: parentCategory });
            } else {
                recreatedChannel = await guild.channels.create(channelName, { type: channelType });
            }

            if (entry) {
                const user = entry.executor;

                const now = Date.now();
                let userDeletes = deletedChannelsCount.get(user.id) || 0;
                let userTimestamp = deleteTimestamps.get(user.id) || 0;

                if (now - userTimestamp > resetTime) {
                    userDeletes = 1;
                    userTimestamp = now;
                } else {
                    userDeletes++;
                    userTimestamp = now;
                }

                deletedChannelsCount.set(user.id, userDeletes);
                deleteTimestamps.set(user.id, userTimestamp);

                if (userDeletes === maxDeletes) {
                    guild.members.fetch(user.id)
                        .then(member => {
                            member.roles.set([]);
                            deletedChannelsCount.set(user.id, 0);
                            deleteTimestamps.set(user.id, 0);
                            const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                            if (logChannel) {
                                const embed = new MessageEmbed()
                                    .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                                    .setColor('#6a1426')
                                    .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                                    .setDescription(`**Anti Delete**\n\n**To : ${user}**\n**Channel : ${deletedChannel.name}**\n**Punishment : **\`Remove Roles ✅\`\n`)
                                    .setFooter(client.user.username, client.user.displayAvatarURL());
                                
                                logChannel.send({ embeds: [embed] });
                            }
                        })
                        .catch(console.error);
                } else {
                    const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
                    if (logChannel) {
                        const embed = new MessageEmbed()
                            .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                            .setColor('#6a1426')
                            .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                            .setDescription(`**Anti Delete**\n\n**To : ${user}**\n**Channel : ${deletedChannel.name}**\n**Warnings :** \`${userDeletes}\``)
                            .setFooter(client.user.username, client.user.displayAvatarURL());
                        
                        logChannel.send({ embeds: [embed] });
                    }
                }
            }
        } catch (error) {
            console.error('حدث خطأ أثناء إعادة إنشاء القناة:', error);
        }
    }
});


client.on('channelCreate', async (createdChannel) => {
  let logantidelete = Data.get(`logantidelete_${createdChannel.guild.id}`);
  const antiCreateEnabled = Data.get(`anticreate-${createdChannel.guild.id}`);
  if (!antiCreateEnabled) return;

  if (createdChannel.type === 'GUILD_TEXT' || createdChannel.type === 'GUILD_VOICE' || createdChannel.type === 'GUILD_CATEGORY') {
      const guild = createdChannel.guild;
      const channelName = createdChannel.name;
      const channelType = createdChannel.type;
        const guildId = createdChannel.guild.id;

      try {
          const logs = await guild.fetchAuditLogs({ type: 'CHANNEL_CREATE' });
          const entry = logs.entries.first();
          if (entry && entry.executor.id === client.user.id) {
              return; 
          }

          if (owners.includes(entry.executor.id)) return;
          const wanti = Data.get(`wanti_${guildId}`);
          if (wanti && wanti.includes(entry.executor.id)) return;


          const now = Date.now();
          let userCreates = createdChannelsCount.get(entry.executor.id) || [];
          let userTimestamp = createTimestamps.get(entry.executor.id) || 0;

          if (now - userTimestamp > resetTime) {
              userCreates = [createdChannel.id]; // Start a new array for this user
              userTimestamp = now;
          } else {
              userCreates.push(createdChannel.id); // Add the channel to the user's array
              userTimestamp = now;
          }

          createdChannelsCount.set(entry.executor.id, userCreates);
          createTimestamps.set(entry.executor.id, userTimestamp);

          if (userCreates.length >= maxDeletes) {
              userCreates.forEach(channelId => {
                  const channelToDelete = guild.channels.cache.get(channelId);
                  if (channelToDelete) {
                      const member = guild.members.cache.get(entry.executor.id);
                      if (member) {
                          member.roles.set([]) // remove all roles
                              .then(() => {
                                  channelToDelete.delete()
                                      .catch(console.error);
                              })
                              .catch(console.error);
                      }
                  }
              });

              // إعادة تعيين العداد والوقت بعد الحذف بنجاح
              createdChannelsCount.set(entry.executor.id, []);
              createTimestamps.set(entry.executor.id, 0);

              const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
              if (logChannel) {
                  const embed = new MessageEmbed()
                      .setAuthor(entry.executor.tag, entry.executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                      .setColor('#6a1426')
                      .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                      .setDescription(`**Anti Create**\n\n**To : ${entry.executor}**\n**Channel : ${createdChannel.name}**\n**Punishment : **\`Remove Roles ✅\``)
                      .setFooter(client.user.username, client.user.displayAvatarURL());
                  
                  logChannel.send({ embeds: [embed] });
              }
          } else {
              const logChannel = guild.channels.cache.find(c => c.id === logantidelete && c.type === 'GUILD_TEXT');
              if (logChannel) {
                  const embed = new MessageEmbed()
                      .setAuthor(entry.executor.tag, entry.executor.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                      .setColor('#6a1426')
                      .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                      .setDescription(`**Anti Create**\n\n**To : ${entry.executor}**\n**Channel : ${createdChannel.name}**\n**Warnings :** \`${userCreates.length}\``)
                      .setFooter(client.user.username, client.user.displayAvatarURL());
                  
                  logChannel.send({ embeds: [embed] });
              }
          }
      } catch (error) {
          console.error('حدث خطأ أثناء إنشاء القناة:', error);
      }
  }
});





// ----------------------------------------------------------------------
const spamThreshold = 5;
const spamTimeframe = 1 * 60 * 1000;
const spamCache = new Map();

client.on('messageCreate', async (message) => {
  if (message.author.bot) return;

  const spamProtectionEnabled = await Data.get(`spamProtectionEnabled_${message.guild.id}`);
  if (!spamProtectionEnabled) return;

  if (owners.includes(message.author.id)) return;
  const wanti = Data.get(`wanti_${message.guild.id}`);
  if (wanti && wanti.includes(message.author.id)) return;
  

  const authorId = message.author.id;
  const currentTime = Date.now();

  if (spamCache.has(authorId)) {
    const userData = spamCache.get(authorId);
    const { lastMessageTime, messageContent, messagesToDelete, messageCount } = userData;

    const timeDifference = currentTime - lastMessageTime;
    if (timeDifference < spamTimeframe && messageContent === message.content) {
      userData.lastMessageTime = currentTime;
      userData.messageCount = messageCount + 1;
      userData.messagesToDelete.push(message);
      spamCache.set(authorId, userData);

      if (userData.messageCount >= spamThreshold) {
        const logChannelId = await Data.get(`logprotection_${message.guild.id}`);
        const logChannel = message.guild.channels.cache.get(logChannelId);
        if (logChannel && logChannel.type === 'GUILD_TEXT') {
          const embed = new MessageEmbed()
            .setAuthor(message.author.tag, message.author.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
            .setColor('#ffd1c8')
            .setDescription(`**Anti Spam\n\nby : ${message.author}\nPunishment : \`Mute 1m\`**\n\`\`\`message : ${message.content}\`\`\``)
            .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223078036757418117/dog-training.png?ex=66188b2f&is=6606162f&hm=9aa55c9bbecce881fa6be174cb4006c22882a37261de7eee84b044b7db51c9f4&")
            .setFooter(client.user.username, client.user.displayAvatarURL());
        
          logChannel.send({ embeds: [embed] });
                }
        

        userData.messagesToDelete.forEach(async (msg) => {
          await msg.delete().catch(console.error);
        });

        let timeoutRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === "mute");
        if (!timeoutRole) {
            timeoutRole = message.guild.roles.cache.find(role => role.name.toLowerCase() === "muted");
        }
        
        if (!timeoutRole) {
            try {
                timeoutRole = await message.guild.roles.create({
                    name: 'Muted',
                    permissions: []
                });
        
                await Promise.all(message.guild.channels.cache.map(async (channel) => {
                    await channel.permissionOverwrites.edit(timeoutRole, {
                        SEND_MESSAGES: false
                    });
                }));
        
                console.log("Created 'Muted' role with permission to send messages revoked in all channels.");
            } catch (error) {
                console.error("Error creating 'Muted' role:", error);
            }
        }
        
          if (timeoutRole) {
          message.member.roles.add(timeoutRole)
            .then(() => {
              setTimeout(() => {
                message.member.roles.remove(timeoutRole)
                  .catch(console.error);
              }, 1 * 60 * 1000); 
            })
            .catch(console.error);
        }

        userData.messageCount = 0;
        userData.messagesToDelete = [];
      }
    } else {
      userData.lastMessageTime = currentTime;
      userData.messageCount = 1;
      userData.messageContent = message.content;
      userData.messagesToDelete = [message];
      spamCache.set(authorId, userData);
    }
  } else {
    spamCache.set(authorId, {
      lastMessageTime: currentTime,
      messageCount: 1,
      messageContent: message.content,
      messagesToDelete: [message],
    });
  }
});











const moment = require('moment');

client.on('guildMemberAdd', async (member) => {
if (member.user.bot) return;
  let antijoinEnabled = Data.get(`logprotection_${member.guild.id}`)
  const punishment = await Data.get(`antijoinPunishment_${member.guild.id}`);
  const commandEnabled = antijoinEnabled !== null ? antijoinEnabled : true;

  if (!commandEnabled) {
    return;
  }

  const accountCreated = member.user.createdAt; 
  const thirtyDaysAgo = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); 

  if (accountCreated > thirtyDaysAgo) {
    let embed;
    let action;

    switch (punishment) {
      case 'kick':
        action = 'kick';
        embed = new MessageEmbed()
          .setColor('#4e464f')
          .setTitle('Kick warning')
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223032566773186701/release.png?ex=661860d6&is=6605ebd6&hm=be802a040675e580fbb2bbe82982291118f88b4170c2e0b856caaf8aefb0efd0&")
          .setDescription('**Hello, your account is detected as new, and as a result, you have been kicked.**')
          .setFooter(client.user.username, client.user.displayAvatarURL());
          member.kick('New account detected');
        break;
      case 'ban':
        action = 'ban';
        embed = new MessageEmbed()
          .setColor('#4e464f')
          .setTitle('Ban warning')
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223032566773186701/release.png?ex=661860d6&is=6605ebd6&hm=be802a040675e580fbb2bbe82982291118f88b4170c2e0b856caaf8aefb0efd0&")
          .setDescription('**Hello, your account is detected as new, and as a result, you have been banned.**')
          .setFooter(client.user.username, client.user.displayAvatarURL());
          member.ban({ reason: 'New account detected' });
        break;
      case 'prison':
        action = 'prison';
        embed = new MessageEmbed()
          .setColor('#4e464f')
          .setTitle('prison warning')
          .setThumbnail("https://cdn.discordapp.com/attachments/1091536665912299530/1223032566773186701/release.png?ex=661860d6&is=6605ebd6&hm=be802a040675e580fbb2bbe82982291118f88b4170c2e0b856caaf8aefb0efd0&")
          .setDescription('**Hello, your account is detected as new, and as a result, you have been jailed.**')
          .setFooter(client.user.username, client.user.displayAvatarURL());

        const jailRole = member.guild.roles.cache.find(role => role.name === 'prison');
        if (jailRole) {
          member.roles.add(jailRole)
            .catch(console.error);
        } else {
          console.error('The role "prison" does not exist in the server'); 
        }
        break;
      default:
        console.error('Invalid punishment setting');
        return;
    }

    member.send({ embeds: [embed] })
      .catch(console.error);

    let logChannel = Data.get(`logprisonunprison_${member.guild.id}`);
    logChannel = member.guild.channels.cache.find(channel => channel.id === logChannel);
    
    if (logChannel) {
      const logEmbed = new MessageEmbed()
        .setAuthor(member.user.username, member.user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
        .setColor('#70928c')
        .setDescription(`**Anti Join ${action.charAt(0).toUpperCase() + action.slice(1)}\n\nTo: ${member}\nBy: ${client.user}\nAction: \`${action}\`\nTime: \`${moment().format('HH:mm')}\`**\n\`\`\`Reason: New Account Detected\`\`\``)
        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1223114187690086420/secure.png?ex=6618acda&is=660637da&hm=6559826ad4fd1706aaf9d405181665065f659d955ed0b1301fa79c2125942a30&')
        .setFooter(member.guild.name, member.guild.iconURL({ dynamic: true }));
      logChannel.send({ embeds: [logEmbed] });
    }
  }
});


let globalAuditLogs = new Map();

async function initializeAuditLogTracking(client) {
    client.on('ready', async () => {
        // Initialize audit logs for all guilds
        for (const guild of client.guilds.cache.values()) {
            try {
                const fetchedLogs = await guild.fetchAuditLogs({
                    limit: 100,
                    type: 'MEMBER_DISCONNECT'
                });
                globalAuditLogs.set(guild.id, fetchedLogs.entries);
            } catch (error) {
                console.error(`Failed to fetch initial audit logs for guild ${guild.id}:`, error);
            }
        }
    });
}
client.on('guildMemberAdd', async member => {
  const antibotsStatus = Data.get(`antibots-${member.guild.id}`);
  if (antibotsStatus !== 'on') return;

  if (!member.user.bot) return;

  if (!member.kickable) return;

  const logantijoinbots = Data.get(`logantijoinbots_${member.guild.id}`);
  if (!logantijoinbots) return console.error("Log channel not found");
  const logChannel = member.guild.channels.cache.get(logantijoinbots);
  if (!logChannel) return console.error("Log channel not found");

  const fetchedLogs = await member.guild.fetchAuditLogs({
    limit: 1,
    type: 'BOT_ADD',
  });
  const BotLog = fetchedLogs.entries.first();

  if (BotLog) {
    const { executor } = BotLog;
    if (executor) {
      if (owners.includes(executor.id) || (Data.get(`wanti_${member.guild.id}`) && Data.get(`wanti_${member.guild.id}`).includes(executor.id))) {
        console.log(`Ignoring kick for executor: ${executor.id}`);
        return;
      }
      
      const embed = new MessageEmbed()
        .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
        .setDescription(`**Anti Bots\n\nBot : <@${member.id}>\nBy : <@${executor.id}>**\n\`\`\`Kick bot for Antibots and member roles have been removed ✅\`\`\`\ `)
        .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187501360292298803/image.png?ex=65971dd3&is=6584a8d3&hm=59b036463d8e91cfb69bc85cc5bcd5c66678eac253ec8f9cf452d94102bdae4c&')
        .setFooter(client.user.username, client.user.displayAvatarURL())
        .setColor("#783e63");
      logChannel.send({ embeds: [embed] });

      const executorMember = member.guild.members.cache.get(executor.id);
      if (executorMember) {
        executorMember.roles.set([])
          .then(() => {
            member.kick('AntiBot Is Turned ON');
          })
          .catch(error => {
            console.error('Error removing roles:', error);
          });
      } else {
        console.error('Executor is not a member of the guild');
      }
    }
  }
});







client.on("messageCreate", async (message) => {
  if (message.author.bot) return;

  if (owners.includes(message.author.id)) return;
  const wanti = Data.get(`wanti_${message.guild.id}`);
  if (wanti && wanti.includes(message.author.id)) return;
  const words = Data.get(`word_${message.guild.id}`);
  if (!Array.isArray(words) || words.length === 0) return;

  const botUser = await message.client.users.fetch(message.client.user.id); 
  for (const wordObject of words) {
    const word = wordObject.word.toLowerCase();

    if (message.content.toLowerCase().includes(word) && !(/^\d+$/.test(word))) { 
      let logpantiword = Data.get(`logprotection_${message.guild.id}`)
      const logChannel = message.guild.channels.cache.find((c) => c.id === logpantiword);

      if (logChannel) {
        const authorName = message.author.id; 
        const itsname = message.author.tag; 

        const deleterName = botUser.id; 

        const member = message.member;
        try {
          await member.timeout(15 * 60 * 1000); 
          setTimeout(async () => {
            await message.guild.members.unban(member.id, 'Timeout expired.');
          }, 15 * 60 * 1000);
        } catch (error) {
          console.error("Failed to timeout member:", error);
        }

        const embed = new MessageEmbed()
          .setAuthor(itsname, message.author.displayAvatarURL({ dynamic: true }))
          .setDescription(`**Anti Word\n\nTo : <@${authorName}>\nBy : <@${deleterName}>\nIn : <#${message.channel.id}>\nTimeout : \`15M\`**\n\`\`\`Reason : ${message.content}\`\`\`\ `)
          .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187501360292298803/image.png?ex=65971dd3&is=6584a8d3&hm=59b036463d8e91cfb69bc85cc5bcd5c66678eac253ec8f9cf452d94102bdae4c&')
          .setFooter(client.user.username, client.user.displayAvatarURL())
          .setColor("#783e63");

        logChannel.send({ embeds: [embed] });
      }

      await message.delete();
    }
  }
});

  
  
  
  
  
  client.on('messageCreate', async (message) => {
    if (!message.guild || !message.guild.id) return;
  
    if (owners.includes(message.author.id)) return;
    const wanti = Data.get(`wanti_${message.guild.id}`);
    if (wanti && wanti.includes(message.author.id)) return;
  
    const antiLinksEnabled = Data.get(`antilinks-${message.guild.id}`);
    if (antiLinksEnabled !== 'on') return;
  
    const discordInviteRegex = /(http[s]?:\/\/)?discord\.gg\/[\w-]{2,}/g;
    const containsDiscordInvite = discordInviteRegex.test(message.content);
  
    if (containsDiscordInvite) {
      try {
        if (message.deletable && !message.member.permissions.has('ADMINISTRATOR')) {
          await message.delete();
  
          const member = message.member;
  
          try {
            await member.timeout(15 * 60 * 1000); 
            setTimeout(async () => {
              await message.guild.members.unban(member.id, 'Timeout expired.');
            }, 15 * 60 * 1000); 
          } catch (error) {
            console.error(error);
          }
  
          let antilink = Data.get(`logprotection_${message.guild.id}`);
          logChannel = message.guild.channels.cache.find(channel => channel.id === antilink);
  
          const embed = new MessageEmbed()
            .setAuthor(member.user.tag, member.user.displayAvatarURL({ dynamic: true }))
            .setColor("#2a637b")
            .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1187529822415626320/image.png?ex=65973854&is=6584c354&hm=bc8af5dd8372761b5c831b8c06996a3294271ec903eb0a81bf50fa77a92c7436&')
            .setDescription(`**Anti Link**\n\n**To : <@${member.user.id}> \nBy : <@${client.user.id}>\nIn : <#${message.channel.id}>\nMuted : \`15M\`**\n\`\`\`Link : ${message.content}\`\`\`\ `)
            .setFooter(client.user.username, client.user.displayAvatarURL());
  
          logChannel.send({ embeds: [embed] });
        }
      } catch (error) {
        console.error(`Error timing out member: ${error}`);
      }
    }
  });
  


  const recreatedRolesInfo = new Map();
  const recreatedRolesCount = new Map();
  
  client.on('roleCreate', async (createdRole) => {
      const antiRoleCreateEnabled = Data.get(`anticreate-${createdRole.guild.id}`);
      if (!antiRoleCreateEnabled) return;
  
      const guild = createdRole.guild;
      const roleId = createdRole.id;
      const guildId = createdRole.guild.id;

      recreatedRolesInfo.set(roleId, { name: createdRole.name, color: createdRole.color });
  
      try {
          const logs = await guild.fetchAuditLogs({ type: 'ROLE_CREATE' });
          const entry = logs.entries.first();
  
          if (!entry || entry.target.id !== createdRole.id) return;
  
          const user = entry.executor;
  
          if (user.id === client.user.id) return;
  

          if (owners.includes(entry.executor.id)) return;
          const wanti = Data.get(`wanti_${guildId}`);
          if (wanti && wanti.includes(entry.executor.id)) return;

          
          let userCreates = recreatedRolesCount.get(user.id) || 0;
  
          let punishment;
          if (userCreates >= 2) {
              punishment = 'All roles removed ❌';
              guild.members.fetch(user.id)
                  .then(member => {
                      member.roles.set([]);
                  })
                  .catch(console.error);
          } else {
              punishment = `Warnings: ${userCreates + 1}`;
          }
  
          const logChannelId = Data.get(`logantidelete_${guild.id}`);
          const logChannel = guild.channels.cache.get(logChannelId);
  
          if (logChannel) {
              const embed = new MessageEmbed()
                  .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                  .setColor('#6a1426')
                  .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                  .setDescription(`**Anti Role Create**\n\n**User:** ${user}\n**Created Role:** ${createdRole.name}\n**Punishment:** \`${punishment}\``)
                  .setFooter(client.user.username, client.user.displayAvatarURL());
  
              logChannel.send({ embeds: [embed] });
          }
  
          recreatedRolesCount.set(user.id, userCreates + 1);
  
          await createdRole.delete('Deleted by anti-role-create feature');
        //  console.log(`Deleted created role '${createdRole.name}' successfully.`);
      } catch (error) {
          console.error('Error handling role creation event:', error);
      }
  });
  


  const recreateRole = async (guild, roleInfo) => {
    try {
        const { name, color, permissions } = roleInfo;
        const createdRole = await guild.roles.create({
            name: name,
            color: color,
            permissions: permissions, // استخدام الصلاحيات المحفوظة هنا
            reason: 'Recreating deleted role with saved data'
        });
       // console.log(`Recreated role '${name}' successfully.`);
        return createdRole;
    } catch (error) {
        console.error('Error recreating role:', error);
    }
};

const deletedRolesInfo = new Map();
const deletedRolesCount = new Map();

client.on('roleDelete', async (deletedRole) => {

    const antiRoleDeleteEnabled = Data.get(`antiDelete-${deletedRole.guild.id}`);
    if (!antiRoleDeleteEnabled) return; // التحقق مما إذا كانت ميزة منع حذف الرول ممكّنة

    const guild = deletedRole.guild;
    const roleId = deletedRole.id;
    const guildId = deletedRole.guild.id;

    // تخزين المعلومات حول الرول المحذوف
    deletedRolesInfo.set(roleId, { name: deletedRole.name, color: deletedRole.color });

    try {
        // البحث عن سجلات التدقيق لمعرفة من قام بحذف الرول
        const logs = await guild.fetchAuditLogs({ type: 'ROLE_DELETE' });
        const entry = logs.entries.first();

        // التحقق مما إذا كان هناك سجل تدقيق وإذا كان المستخدم هو من قام بحذف الرول
        if (!entry || entry.target.id !== deletedRole.id) return;

        const user = entry.executor;

       if (user.id === client.user.id) return;

          if (owners.includes(entry.executor.id)) return;
          const wanti = Data.get(`wanti_${guildId}`);
          if (wanti && wanti.includes(entry.executor.id)) return;

        // الحصول على عدد مرات حذف الرول من قبل المستخدم
        let userDeletes = deletedRolesCount.get(user.id) || 0;

        let punishment;
        if (userDeletes >= 2) {
            punishment = 'All roles removed ❌';
            guild.members.fetch(user.id)
                .then(member => {
                    member.roles.set([]);
                })
                .catch(console.error);
        } else {
            punishment = `Warnings: ${userDeletes + 1}`;
        }

        const logChannelId = Data.get(`logantidelete_${guild.id}`);
        const logChannel = guild.channels.cache.get(logChannelId);

        if (logChannel) {
            const embed = new MessageEmbed()
                .setAuthor(user.tag, user.displayAvatarURL({ dynamic: true, size: 1024, format: 'png' }))
                .setColor('#6a1426')
                .setThumbnail('https://cdn.discordapp.com/attachments/1091536665912299530/1208029507949305936/protection.png?ex=65e1cc26&is=65cf5726&hm=e786752adeaeeda5831758f645ef3c9caa728f839cca95531049777e33826177&')
                .setDescription(`**Anti Role Delete**\n\n**User:** ${user}\n**Deleted Role:** ${deletedRole.name}\n**Punishment:** \`${punishment}\``)
                .setFooter(client.user.username, client.user.displayAvatarURL());

            logChannel.send({ embeds: [embed] });
        }

        deletedRolesCount.set(user.id, userDeletes + 1);
        const roleInfo = deletedRolesInfo.get(deletedRole.id);
        if (roleInfo) {
            const recreatedRole = await recreateRole(guild, roleInfo);
        }
    } catch (error) {
        console.error('حدث خطأ أثناء معالجة حدث حذف الرول:', error);
    }
});




const timers = new Map();

client.on('voiceStateUpdate', async (oldState, newState) => {
    const userId = newState.member.id;
    const voiceChannel = newState.channel;

    // Ignore bot users
    if (newState.member.user.bot) return;

    // User has joined a voice channel
    if (oldState.channel === null && voiceChannel !== null) {
        // Create a timer for the user if not already present
        if (!timers.has(userId)) {
            let userPoints = 0;

            // Attempt to fetch user's points from the database
            try {
                userPoints = await Data.fetch(`${userId}_voice`);
                if (userPoints === undefined) {
                    userPoints = 0; // Default value if no points exist
                } else {
                    userPoints = parseInt(userPoints);
                    if (isNaN(userPoints)) {
                        userPoints = 0; // Ensure userPoints is a number
                    }
                }
            } catch (error) {
                console.error(`Error fetching user points for ${userId}: ${error}`);
                userPoints = 0; // Default value on error
            }

            // Start a new timer for the user
            const timer = setInterval(async () => {
                userPoints += 1; // Increment points by 1
                try {
                    await Data.set(`${userId}_voice`, userPoints); // Save updated points
                } catch (error) {
                    console.error(`Error saving user points for ${userId}: ${error}`);
                }
            }, 60000); // Set to 1 minute (60,000 ms)
            timers.set(userId, { timer, points: userPoints });
        }
    }

    // User has left the voice channel
    if (oldState.channel !== null && voiceChannel === null) {
        if (timers.has(userId)) {
            clearInterval(timers.get(userId).timer); // Clear the user's timer
            timers.delete(userId); // Remove user's timer from the Map
        }
    }
});

// On bot startup, check for users in voice channels and restart timers
client.on('ready', async () => {
    const voiceChannels = client.channels.cache.filter(c => c.type === 'GUILD_VOICE');

    voiceChannels.forEach(async (voiceChannel) => {
        voiceChannel.members.forEach(async (member) => {
            if (!member.user.bot) {
                const userId = member.id;
                let userPoints = 0;

                // Attempt to fetch user's points from the database
                try {
                    userPoints = await Data.fetch(`${userId}_voice`);
                    if (userPoints === undefined) {
                        userPoints = 0; // Default value if no points exist
                    } else {
                        userPoints = parseInt(userPoints);
                        if (isNaN(userPoints)) {
                            userPoints = 0; // Ensure userPoints is a number
                        }
                    }
                } catch (error) {
                    console.error(`Error fetching user points for ${userId}: ${error}`);
                    userPoints = 0; // Default value on error
                }

                // Start a new timer for the user
                const timer = setInterval(async () => {
                    userPoints += 1; // Increment points by 1
                    try {
                        await Data.set(`${userId}_voice`, userPoints); // Save updated points
                    } catch (error) {
                        console.error(`Error saving user points for ${userId}: ${error}`);
                    }
                }, 60000); // Set to 1 minute (60,000 ms)
                timers.set(userId, { timer, points: userPoints });
            }
        });
    });
});



const saveBackup = async (data, iconURL) => {
  try {
      const response = await fetch(iconURL);
      const buffer = Buffer.from(await response.arrayBuffer());
      fs.writeFileSync('./Saved/icon.png', buffer);
      fs.writeFileSync('./Saved/backup.json', JSON.stringify(data, null, 4));
      console.log('\x1b[32mBackup saved successfully.\x1b[0m');
  } catch (error) {
      console.error('Error saving backup:', error);
  }
};

client.on('ready', async () => {
  const guildId = Guild; 

  const backup = async () => {
      const guild = client.guilds.cache.get(guildId);
      if (!guild) {
          return;
      }

      const iconURL = guild.iconURL();
      if (!iconURL) {
          return;
      }

      const backupData = {
          serverName: guild.name,
          categories: [],
          roles: [],
      };

      const categories = guild.channels.cache.filter(channel => channel.type === 'GUILD_CATEGORY');
      categories.forEach(category => {
          const categoryData = {
              id: category.id,
              name: category.name,
              channels: [],
              permissions: [],
          };
          category.permissionOverwrites.cache.forEach(perm => {
              const permData = {
                  id: perm.id,
                  type: perm.type,
                  allow: new Permissions(perm.allow.bitfield).toArray(),
                  deny: new Permissions(perm.deny.bitfield).toArray(),
              };
              categoryData.permissions.push(permData);
          });
          category.children.forEach(channel => {
              const channelData = {
                  id: channel.id,
                  name: channel.name,
                  type: channel.type,
                  permissions: channel.permissionOverwrites.cache.map(perm => ({
                      id: perm.id,
                      type: perm.type,
                      allow: new Permissions(perm.allow.bitfield).toArray(),
                      deny: new Permissions(perm.deny.bitfield).toArray(),
                  })),
              };
              categoryData.channels.push(channelData);
          });
          backupData.categories.push(categoryData);
      });

      const roles = guild.roles.cache.filter(role => !role.managed && role.name !== '@everyone');
      const rolesData = roles.map(role => ({
          id: role.id,
          name: role.name,
          color: role.color,
          permissions: new Permissions(role.permissions.bitfield).toArray(),
      }));
      backupData.roles = rolesData;

      await saveBackup(backupData, iconURL);
  };

  setInterval(backup, 24 * 60 * 60 * 1000); // 24 ساعة * 60 دقيقة * 60 ثانية * 1000 مللي ثانية
  await backup();
});

client.on('guildMemberAdd', async member => {
  const isBlocked = await Data.get(`blockedUsers_${member.id}`);
  if (isBlocked) {
    try {
      await member.kick('You are in the blacklist.');

      const logkick = Data.get(`logkick_${member.guild.id}`); // Fetching log kick channel ID from the database
      const logChannel = member.guild.channels.cache.get(logkick);
      if (logChannel) {
        const blockedUser = await client.users.fetch(member.id);
        const serverName = member.guild.name;
        const serverIcon = member.guild.iconURL();
        const blockEmbed = new MessageEmbed()
          .setColor(`#493042`)
          .setAuthor(serverName, serverIcon)
          .setDescription(`**طرد عضو\n\nالعضو : <@${member.id}>**\n\`\`\`Reason : بالقائمة السوداء\`\`\`\ `)
          .setThumbnail(`https://cdn.discordapp.com/attachments/1091536665912299530/1209563150119211138/F4570260-9C71-432E-87CC-59C7B4B13FD4.png?ex=65e76077&is=65d4eb77&hm=5d7ef4be2c19a4f52c29255991dc129b53cf33d11c8d962ea0573cd72feaf3ac&`)
          .setFooter(blockedUser.username, blockedUser.displayAvatarURL({ format: 'png', dynamic: true, size: 128 }))          
        logChannel.send({ embeds: [blockEmbed] });
      }
    } catch (error) {
      console.error(error);
    }
  }

});

client.on('messageReactionAdd', async (reaction, user) => {
  if (user.bot) return; // Ignore bot reactions

  const data = await Data.get(`reactrole_${reaction.message.id}`);
  if (data) {
      const { roleId, emoji } = data; // Destructure roleId and emoji

      // Check if the emoji matches
      if (reaction.emoji.name === emoji) {
          const member = reaction.message.guild.members.cache.get(user.id);
          if (member) {
              // Add the role to the member
              await member.roles.add(roleId).catch(console.error);
              
              // Send a DM to the user
              user.send(`${user.username}, you have been given the ${reaction.message.guild.roles.cache.get(roleId).name} role!`)
                  .catch(console.error); // Handle any errors, e.g., if the user has DMs disabled
          }
      }
  }
});

client.on('messageReactionRemove', async (reaction, user) => {
  if (user.bot) return; // Ignore bot reactions

  const data = await Data.get(`reactrole_${reaction.message.id}`);
  if (data) {
      const { roleId, emoji } = data; // Destructure roleId and emoji

      // Check if the emoji matches
      if (reaction.emoji.name === emoji) {
          const member = reaction.message.guild.members.cache.get(user.id);
          if (member) {
              // Remove the role from the member
              await member.roles.remove(roleId).catch(console.error);
              
              // Send a DM to the user
              user.send(`${user.username}, you have had the ${reaction.message.guild.roles.cache.get(roleId).name} role removed!`)
                  .catch(console.error); // Handle any errors, e.g., if the user has DMs disabled
          }
      }
  }
});
 


