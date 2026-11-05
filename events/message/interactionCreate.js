
const { Client, intents, Collection, MessageEmbed, MessageAttachment, MessageActionRow, MessageButton, MessageSelectMenu, WebhookClient, MessageModal, Role, Modal, TextInputComponent } = require("discord.js");
const db = require("pro.db");



module.exports = async (client, interaction) => {
    if (interaction.isButton()) {
        if (interaction.customId === `Auto_Reply`) {
            const Services = new Modal().setCustomId(`Reply-Bot`).setTitle(`Reply`);
            const Service_1 = new TextInputComponent().setCustomId('Auto-Reply').setLabel(`اضف الرسالة الذي سوف يرد عليها البوت`).setStyle(`PARAGRAPH`).setPlaceholder(' ').setRequired(true)
            const Service_2 = new TextInputComponent().setCustomId('-Reply').setLabel(`إضف الرد هنا`).setStyle(`PARAGRAPH`).setPlaceholder(' ').setRequired(true)
            const Service1 = new MessageActionRow().addComponents(Service_1);
            const Service2 = new MessageActionRow().addComponents(Service_2);
            Services.addComponents(Service1, Service2);
            interaction.showModal(Services);
        }
    }
    if (interaction.isModalSubmit()) {
        if (interaction.customId === `Reply-Bot`) {
            const Service_1 = interaction.fields.getTextInputValue('Auto-Reply');
            const Service_2 = interaction.fields.getTextInputValue('-Reply');
            if (db.get(`Replys_${Service_1}`)) return interaction.reply({ content: `موجود بالفعل` })
            db.push(`Replys_${Service_1}`, { Word: Service_1, Reply: Service_2 })
            interaction.reply({ content: `${Service_1} | ${Service_2}` })
        }
    }
}
