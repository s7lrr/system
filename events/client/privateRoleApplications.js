
const {
  MessageEmbed,
  MessageActionRow,
  MessageButton
} = require("discord.js");

const {
  Modal,
  TextInputComponent,
  showModal
} = require("discord-modals");

const db = require("pro.db");

const processing = new Set();

function getSettings(guildId) {
  const data =
    db.get(`privateRoleApplySettings_${guildId}`) || {};

  return {
    channelId: data.channelId || null,
    reviewerRoles: Array.isArray(data.reviewerRoles)
      ? data.reviewerRoles
      : []
  };
}

function requestKey(guildId, requestId) {
  return `privateRoleRequest_${guildId}_${requestId}`;
}

function pendingKey(guildId, userId) {
  return `privateRolePending_${guildId}_${userId}`;
}

function isReviewer(member, settings) {
  return (
    member.permissions.has("ADMINISTRATOR") ||
    settings.reviewerRoles.some(id =>
      member.roles.cache.has(id)
    )
  );
}

function normalizeColor(value) {
  const color = String(value || "").trim();

  if (!/^#?[0-9a-fA-F]{6}$/.test(color)) {
    return null;
  }

  return "#" + color.replace("#", "").toUpperCase();
}

function getExistingRoles(guild, userId) {
  const saved = db.get(`userRoles_${userId}`);

  if (!Array.isArray(saved)) return [];

  return saved
    .map(id => guild.roles.cache.get(String(id)))
    .filter(Boolean);
}

function reviewButtons(requestId, disabled = false) {
  return new MessageActionRow().addComponents(
    new MessageButton()
      .setCustomId(`pra:accept:${requestId}`)
      .setLabel("قبول الطلب")
      .setEmoji("✅")
      .setStyle("SUCCESS")
      .setDisabled(disabled),

    new MessageButton()
      .setCustomId(`pra:reject:${requestId}`)
      .setLabel("رفض الطلب")
      .setEmoji("❌")
      .setStyle("DANGER")
      .setDisabled(disabled)
  );
}

async function notifyUser(client, userId, embed) {
  try {
    const user = await client.users.fetch(userId);
    await user.send({ embeds: [embed] });
    return true;
  } catch {
    return false;
  }
}

module.exports = client => {

  // فتح نموذج طلب الرول
  client.on("interactionCreate", async interaction => {
    if (!interaction.guild) return;
    if (!interaction.isSelectMenu()) return;

    if (!interaction.customId.startsWith(
      "private_apply_menu:"
    )) return;

    const targetId = interaction.customId.split(":")[1];

    if (interaction.user.id !== targetId) {
      return interaction.reply({
        content: "❌ هذه القائمة مخصصة للعضو المذكور فقط.",
        ephemeral: true
      });
    }

    if (interaction.values[0] !== "private_role") {
      return interaction.reply({
        content: "❌ هذا الخيار غير متاح حاليًا.",
        ephemeral: true
      });
    }

    if (getExistingRoles(
      interaction.guild,
      interaction.user.id
    ).length > 0) {
      return interaction.reply({
        content: "❌ عندك رول خاص بالفعل.",
        ephemeral: true
      });
    }

    const modal = new Modal()
      .setCustomId(
        `private_role_form:${interaction.guild.id}`
      )
      .setTitle("✦ طلب رول خاص");

    const roleName = new TextInputComponent()
      .setCustomId("role_name")
      .setLabel("اسم الرول الخاص")
      .setStyle("SHORT")
      .setPlaceholder("اكتب اسم الرول")
      .setMinLength(2)
      .setMaxLength(80)
      .setRequired(true);

    const colorOne = new TextInputComponent()
      .setCustomId("color_one")
      .setLabel("اللون الأول - إجباري")
      .setStyle("SHORT")
      .setPlaceholder("#5865F2")
      .setRequired(true);

    const colorTwo = new TextInputComponent()
      .setCustomId("color_two")
      .setLabel("اللون الثاني - اختياري")
      .setStyle("SHORT")
      .setPlaceholder("#9B59B6")
      .setRequired(false);

    modal.addComponents(
      roleName,
      colorOne,
      colorTwo
    );

    return showModal(modal, {
      client,
      interaction
    });
  });

  // استقبال نموذج التقديم
  client.on("modalSubmit", async modal => {
    if (!modal.customId.startsWith(
      "private_role_form:"
    )) return;

    try {
      const guildId = modal.customId.split(":")[1];
      const guild = client.guilds.cache.get(guildId);

      if (!guild) {
        return modal.reply({
          content: "❌ تعذر العثور على السيرفر.",
          ephemeral: true
        });
      }

      const settings = getSettings(guildId);

      const channel = settings.channelId
        ? await guild.channels.fetch(
            settings.channelId
          ).catch(() => null)
        : null;

      if (!channel || !channel.isText()) {
        return modal.reply({
          content: "❌ روم استقبال الطلبات غير متاح.",
          ephemeral: true
        });
      }


      // قراءة اسم الرول
      const roleName = String(
        modal.getTextInputValue("role_name") ?? ""
      ).trim();

      // قراءة اللون الأول (إجباري)
      const rawColorOne = String(
        modal.getTextInputValue("color_one") ?? ""
      ).trim();

      const colorOne = normalizeColor(rawColorOne);

      // قراءة اللون الثاني (اختياري)
      // إذا تركه العضو فاضيًا ما يسبب أي خطأ
      const rawColorTwo = String(
        modal.getTextInputValue("color_two") ?? ""
      ).trim();

      const colorTwo = rawColorTwo
        ? normalizeColor(rawColorTwo)
        : null;

      // التحقق من اسم الرول واللون الأول
      if (!roleName || !colorOne) {
        return modal.reply({
          content:
            "❌ اسم الرول أو اللون الأول غير صحيح. مثال: `#5865F2`",
          ephemeral: true
        });
      }

      // التحقق من اللون الثاني إذا كتبه العضو
      if (rawColorTwo && !colorTwo) {
        return modal.reply({
          content:
            "❌ اللون الثاني غير صحيح. مثال: `#9B59B6`",
          ephemeral: true
        });
      }


      if (getExistingRoles(guild, modal.user.id).length) {
        return modal.reply({
          content: "❌ عندك رول خاص بالفعل.",
          ephemeral: true
        });
      }

      const pending = pendingKey(
        guildId,
        modal.user.id
      );

      if (db.get(pending)) {
        return modal.reply({
          content: "⏳ عندك طلب قيد المراجعة بالفعل.",
          ephemeral: true
        });
      }

      const requestId =
        `${Date.now()}_${modal.user.id}`;

      const data = {
        guildId,
        userId: modal.user.id,
        roleName,
        colorOne,
        colorTwo,
        status: "pending",
        createdAt: Date.now()
      };

      db.set(requestKey(guildId, requestId), data);
      db.set(pending, requestId);

      const embed = new MessageEmbed()
        .setColor("#F1C40F")
        .setTitle("✦ طلب رول خاص جديد")
        .setThumbnail(
          modal.user.displayAvatarURL({
            dynamic: true
          })
        )
        .addFields(
          {
            name: "👤 مقدم الطلب",
            value: `<@${modal.user.id}>`,
            inline: true
          },
          {
            name: "🏷️ اسم الرول",
            value: roleName,
            inline: true
          },
          {
            name: " اللون الأول",
            value: `\`${colorOne}\``,
            inline: true
          },
          {
            name: " اللون الثاني",
            value: colorTwo
              ? `\`${colorTwo}\``
              : "غير محدد",
            inline: true
          },
          {
            name: "📋 حالة الطلب",
            value: "🟡 بانتظار مراجعة الإدارة"
          }
        )
        .setFooter({
          text: `رقم الطلب: ${requestId}`
        })
        .setTimestamp();

      try {
        await channel.send({
          embeds: [embed],
          components: [
            reviewButtons(requestId)
          ],
          allowedMentions: {
            parse: []
          }
        });
      } catch (error) {
        db.delete(requestKey(guildId, requestId));
        db.delete(pending);

        console.error("SEND ROLE REQUEST ERROR:", error);

        return modal.reply({
          content: "❌ تعذر إرسال الطلب للإدارة.",
          ephemeral: true
        });
      }

      return modal.reply({
        content:
          "✅ تم إرسال طلب الرول الخاص للإدارة بنجاح.",
        ephemeral: true
      });

    } catch (error) {
      console.error("ROLE MODAL ERROR:", error);

      return modal.reply({
        content: "❌ حدث خطأ أثناء إرسال الطلب.",
        ephemeral: true
      }).catch(() => {});
    }
  });

  // قبول أو رفض الطلب
  client.on("interactionCreate", async interaction => {
    if (!interaction.guild) return;
    if (!interaction.isButton()) return;

    if (!interaction.customId.startsWith("pra:")) {
      return;
    }

    const parts = interaction.customId.split(":");
    const action = parts[1];
    const requestId = parts.slice(2).join(":");

    if (!["accept", "reject"].includes(action)) {
      return;
    }

    const guild = interaction.guild;
    const settings = getSettings(guild.id);

    if (!isReviewer(interaction.member, settings)) {
      return interaction.reply({
        content: "❌ ما عندك صلاحية مراجعة الطلبات.",
        ephemeral: true
      });
    }

    const key = requestKey(guild.id, requestId);
    const data = db.get(key);

    if (!data || data.status !== "pending") {
      return interaction.reply({
        content: "❌ الطلب تمت معالجته مسبقًا.",
        ephemeral: true
      });
    }

    if (processing.has(key)) {
      return interaction.reply({
        content: "⏳ الطلب قيد المعالجة الآن.",
        ephemeral: true
      });
    }

    processing.add(key);

    try {
      await interaction.deferReply({
        ephemeral: true
      });

      const pending = pendingKey(
        guild.id,
        data.userId
      );

      let createdRole = null;

      if (action === "accept") {
        const botMember = guild.me;

        if (
          !botMember ||
          !botMember.permissions.has("MANAGE_ROLES")
        ) {
          return interaction.editReply({
            content: "❌ البوت يحتاج صلاحية Manage Roles."
          });
        }

        const member = await guild.members.fetch(
          data.userId
        ).catch(() => null);

        if (!member) {
          return interaction.editReply({
            content: "❌ صاحب الطلب غير موجود في السيرفر."
          });
        }

        if (getExistingRoles(guild, data.userId).length) {
          return interaction.editReply({
            content: "❌ العضو يمتلك رولًا خاصًا بالفعل."
          });
        }

        createdRole = await guild.roles.create({
          name: data.roleName,
          color: data.colorOne,
          reason:
            `Private role approved by ${interaction.user.tag}`
        });

        try {
          await member.roles.add(
            createdRole,
            "Approved private role application"
          );
        } catch (error) {
          await createdRole.delete().catch(() => {});
          throw error;
        }

        db.set(
          `userRoles_${data.userId}`,
          [createdRole.id]
        );

        data.status = "accepted";
        data.roleId = createdRole.id;
        data.reviewedBy = interaction.user.id;
        data.reviewedAt = Date.now();

      } else {
        data.status = "rejected";
        data.reviewedBy = interaction.user.id;
        data.reviewedAt = Date.now();
      }

      db.set(key, data);
      db.delete(pending);

      const accepted = action === "accept";

      const resultEmbed = new MessageEmbed()
        .setColor(accepted ? "#2ECC71" : "#E74C3C")
        .setTitle(
          accepted
            ? "✅ تم قبول طلب الرول الخاص"
            : "❌ تم رفض طلب الرول الخاص"
        )
        .addFields(
          {
            name: "👤 صاحب الطلب",
            value: `<@${data.userId}>`,
            inline: true
          },
          {
            name: "🏷️ اسم الرول",
            value: data.roleName,
            inline: true
          },
          {
            name: "🛡️ تمت المراجعة بواسطة",
            value: `<@${interaction.user.id}>`,
            inline: true
          },
          {
            name: "📋 النتيجة",
            value: accepted
              ? `تم إنشاء الرول ${createdRole} وإعطاؤه للعضو.`
              : "تم رفض الطلب ولم يتم إنشاء الرول."
          }
        )
        .setTimestamp();

      await interaction.message.edit({
        embeds: [resultEmbed],
        components: [
          reviewButtons(requestId, true)
        ],
        allowedMentions: {
          parse: []
        }
      }).catch(console.error);

      const userEmbed = new MessageEmbed()
        .setColor(accepted ? "#2ECC71" : "#E74C3C")
        .setTitle(
          accepted
            ? "🎉 تم قبول طلب الرول الخاص!"
            : "❌ تم رفض طلب الرول الخاص"
        )
        .setDescription(
          accepted
            ? `تم قبول طلبك في **${guild.name}**.\n\n` +
              `**اسم الرول:** ${data.roleName}\n` +
              `**اللون:** ${data.colorOne}\n\n` +
              `تم إنشاء الرول وإضافته لك بنجاح.`
            : `تم رفض طلب الرول الخاص في **${guild.name}**.\n\n` +
              `**اسم الرول المطلوب:** ${data.roleName}\n\n` +
              `لم يتم إنشاء أي رول.`
        )
        .setTimestamp();

      const dmSent = await notifyUser(
        client,
        data.userId,
        userEmbed
      );

      return interaction.editReply({
        content:
          (accepted
            ? "✅ تم قبول الطلب وإنشاء الرول وحفظه في قاعدة البيانات."
            : "✅ تم رفض الطلب بدون إنشاء رول.") +
          (dmSent
            ? "\n📩 تم إرسال النتيجة للعضو على الخاص."
            : "\n⚠️ تعذر إرسال الخاص للعضو.")
      });

    } catch (error) {
      console.error("ROLE REVIEW ERROR:", error);

      if (interaction.deferred) {
        await interaction.editReply({
          content: "❌ حدث خطأ أثناء معالجة الطلب."
        }).catch(() => {});
      }
    } finally {
      processing.delete(key);
    }
  });
};
