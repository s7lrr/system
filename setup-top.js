
const fs = require("fs");
const path = require("path");

const indexPath = path.join(__dirname, "index.js");
const backupPath = path.join(__dirname, "index.backup.js");

if (!fs.existsSync(indexPath)) {
  console.error("❌ ملف index.js غير موجود في نفس المجلد");
  process.exit(1);
}

let code = fs.readFileSync(indexPath, "utf8");

if (code.includes("TOP_TRACKER_INSTALLED")) {
  console.log("✅ نظام TopTracker موجود مسبقًا");
  process.exit(0);
}

const marker = "client.prefix = prefix;";

if (!code.includes(marker)) {
  console.error("❌ لم أجد مكان إضافة TopTracker");
  process.exit(1);
}

const tracker = `

// ========================================
// TOP_TRACKER_INSTALLED
// نظام التوب - الرسائل والصوت
// ========================================

const topVoiceSessions = new Map();

function updateTopStats(guildId, userId, changes) {
  const key = \`top_stats_\${guildId}\`;
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

// احتساب دقائق الصوت
function saveVoiceMinutes(key, now = Date.now()) {
  const session = topVoiceSessions.get(key);
  if (!session) return;

  const minutes = Math.floor(
    (now - session.startedAt) / 60000
  );

  if (minutes < 1) return;

  updateTopStats(session.guildId, session.userId, {
    voice: minutes,
    points: minutes
  });

  session.startedAt += minutes * 60000;
}

// دخول وخروج الصوت
client.on("voiceStateUpdate", (oldState, newState) => {
  const member = newState.member || oldState.member;

  if (!member || member.user.bot) return;

  const key = \`\${newState.guild.id}_\${member.id}\`;
  const wasInVoice = Boolean(oldState.channelId);
  const isInVoice = Boolean(newState.channelId);

  if (!wasInVoice && isInVoice) {
    topVoiceSessions.set(key, {
      guildId: newState.guild.id,
      userId: member.id,
      startedAt: Date.now()
    });
  }

  if (wasInVoice && !isInVoice) {
    saveVoiceMinutes(key);
    topVoiceSessions.delete(key);
  }
});

// تسجيل الأعضاء الموجودين بالصوت عند التشغيل
client.once("ready", () => {
  for (const guild of client.guilds.cache.values()) {
    for (const channel of guild.channels.cache.values()) {
      if (
        channel.type !== "GUILD_VOICE" &&
        channel.type !== "GUILD_STAGE_VOICE"
      ) continue;

      for (const member of channel.members.values()) {
        if (member.user.bot) continue;

        const key = \`\${guild.id}_\${member.id}\`;

        if (!topVoiceSessions.has(key)) {
          topVoiceSessions.set(key, {
            guildId: guild.id,
            userId: member.id,
            startedAt: Date.now()
          });
        }
      }
    }
  }

  console.log("✅ TopTracker Ready");
});

// حفظ الدقائق كل دقيقة
setInterval(() => {
  const now = Date.now();

  for (const key of topVoiceSessions.keys()) {
    saveVoiceMinutes(key, now);
  }
}, 60000);

// ========================================
// END TOP TRACKER
// ========================================

`;

fs.copyFileSync(indexPath, backupPath);

code = code.replace(marker, marker + tracker);

fs.writeFileSync(indexPath, code, "utf8");

console.log("✅ تم تعديل index.js كاملًا");
console.log("✅ تمت إضافة TopTracker");
console.log("✅ تم حفظ نسخة احتياطية index.backup.js");
console.log("✅ جميع أكوادك القديمة محفوظة");
