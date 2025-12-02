// ================== SETUP & IMPORT ================== //
require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
    Events
} = require("discord.js");

// ================== CLIENT ================== //
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

// ================== CONFIG ID ================== //
const WELCOME_CHANNEL_ID   = "862261084697264149";   // channel welcome
const AUTO_ROLE_ID         = "894948896248320003";   // role autorole
const ANNOUNCE_CHANNEL_ID  = "1437112719412039771";  // channel announce open/close

// ================== READY + CUSTOM STATUS ================== //
client.once(Events.ClientReady, () => {
    console.log(`Bot online sebagai ${client.user.tag}`);

    // Status yang kamu mau
    const statuses = [
        "🌸 Cyizzie Shop - OPEN",
        "💛 Check availability first",
        "🎟️ Order via ticket",
        "💌 Lihat review di channel Testimoni",
        "✨ Premium Services Available",
        "🪷 Nitro • Decoration • Premium Apps"
    ];

    let i = 0;

    // Ganti status tiap 5 detik
    setInterval(() => {
        client.user.setPresence({
            activities: [
                {
                    name: statuses[i],
                    type: 0 // "Playing"
                }
            ],
            status: "online"
        });

        i++;
        if (i >= statuses.length) i = 0;
    }, 5000);
});

// ================== WELCOME + AUTOROLE ================== //
client.on(Events.GuildMemberAdd, async (member) => {
    // Autorole
    try {
        await member.roles.add(AUTO_ROLE_ID);
        console.log(`Autorole diberikan ke ${member.user.tag}`);
    } catch (err) {
        console.error("Gagal memberi autorole:", err);
    }

    // Welcome embed
    const channel = member.guild.channels.cache.get(WELCOME_CHANNEL_ID);
    if (!channel) return;

    const welcomeEmbed = new EmbedBuilder()
        .setTitle("✦ Welcome to FrEzzFamily ✦")
        .setDescription(`A new member has arrived!  
﹒<@${member.id}> ! <33

｡ﾟ•┈୨♡୧┈• ｡ﾟ

<a:PinkRightArrowBounce:1444894009435881524>  Read the rules in <#1206891153769627648>  
<a:PinkRightArrowBounce:1444894009435881524>  Pick your roles in <#903615895321051168>  
<a:PinkRightArrowBounce:1444894009435881524>  Chat in <#862268013881327646>  
<a:PinkRightArrowBounce:1444894009435881524>  Shop in <#1437113103413416028>

｡ﾟ•┈୨♡୧┈• ｡ﾟ

We hope you enjoy your stay! <33`)
        .setColor(0xFF69B4)
        .setThumbnail(member.user.displayAvatarURL({ dynamic: true, size: 1024 }))
        .setFooter({ text: `Member Count: ${member.guild.memberCount}` })
        .setTimestamp();

    channel.send({
        content: `Hi & Welc, <@${member.id}>!`,
        embeds: [welcomeEmbed]
    });
});

// ================== MESSAGE COMMANDS ================== //
client.on(Events.MessageCreate, async (message) => {
    if (!message.guild || message.author.bot) return;

    // simple respon
    if (message.content === "halo") {
        return message.reply("haii aku assistant cyizzie 🤍");
    }

    if (message.content === "?ping") {
        return message.reply(`pong! delay: ${client.ws.ping}ms`);
    }

    // test welcome
    if (message.content === "!testwelcome") {
        client.emit(Events.GuildMemberAdd, message.member);
        return;
    }

    // ================== FORM ORDER ================== //
    if (message.content.startsWith("?order")) {
        const form = `## 🧁 ──  form data akun

💌 email :
🔑 password :
📦 produk : (nitro / decoration / app premium)
⏱️ durasi :
📌 note tambahan : (opsional)`;

        return message.reply(form);
    }

    // ================== SHOP OPEN (ADMIN ONLY) ================== //
    if (message.content === "?open") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("kamu belum punya izin buat pake command ini ✨");
        }

        const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID) || message.channel;

        const openEmbed = new EmbedBuilder()
            .setTitle("🌸・SHOP STATUS: OPEN")
            .setDescription(
`> Toko lagi **OPEN** sekarang 💌  

｡ﾟ•┈୨♡୧┈•｡ﾟ

🛒 Produk:
・ Nitro Boost
・ Decoration  
・ App Premium

💳 Pembayaran:
・ DANA / QRIS`
            )
            .setColor(0xFFB6C1)
            .setTimestamp();

        await channel.send({
            content: "@everyone **SHOP IS NOW OPEN!**",
            embeds: [openEmbed]
        });

        if (channel.id !== message.channel.id) {
            return message.reply("udah aku announce di channel toko 💗");
        }
        return;
    }

    // ================== SHOP CLOSE (ADMIN ONLY) ================== //
    if (message.content === "?close") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("kamu belum punya izin buat pake command ini ✨");
        }

        const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID) || message.channel;

        const closeEmbed = new EmbedBuilder()
            .setTitle("💤・SHOP STATUS: CLOSED")
            .setDescription(
`> Untuk sementara **CLOSED** dulu yaa 💤  
Order yang sudah masuk tetap diproses, jangan khawatir 💗

Kalau mau titip order, boleh kirim form dulu  
nanti di-respond pas toko buka lagi! ✨`
            )
            .setColor(0x808080)
            .setTimestamp();

        await channel.send({ embeds: [closeEmbed] });

        if (channel.id !== message.channel.id) {
            return message.reply("udah aku announce kalau shop close di channel toko 🌙");
        }
        return;
    }
});

// ================== LOGIN ================== //
client.login(process.env.DISCORD_TOKEN);
