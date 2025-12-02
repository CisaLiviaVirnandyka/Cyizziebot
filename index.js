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

    const statuses = [
        "🌸 Cyizzie Shop - OPEN",
        "💛 Check availability first",
        "🎟️ Order via ticket",
        "💌 Lihat review di channel Testimoni",
        "✨ Premium Services Available",
        "🪷 Nitro • Decoration • Premium Apps"
    ];

    let i = 0;

    setInterval(() => {
        client.user.setPresence({
            activities: [{ name: statuses[i], type: 0 }],
            status: "online"
        });

        i = (i + 1) % statuses.length;
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

    if (message.content === "halo") return message.reply("haii aku assistant cyizzie 🤍");
    if (message.content === "?ping") return message.reply(`pong! delay: ${client.ws.ping}ms`);

    if (message.content === "!testwelcome") {
        client.emit(Events.GuildMemberAdd, message.member);
        return;
    }

    if (message.content.startsWith("?order")) {
        const form = `## 🧁 ──  form data akun

💌 email :
🔑 password :
📦 produk : (nitro / decoration / app premium)
⏱️ durasi :
📌 note tambahan : (opsional)`;

        return message.reply(form);
    }

    // ================== SHOP OPEN ================== //
    if (message.content === "?open") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply("kamu belum punya izin buat pake command ini ✨");

        const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);

        const openEmbed = new EmbedBuilder()
            .setTitle("🌸・SHOP STATUS: OPEN")
            .setColor("#FFB6C1")
            .setDescription(`
> Toko lagi **OPEN** sekarang 💌  
Silahkan order ya sayangg 🤍

╭────────⋅⋅⋅༺♡༻⋅⋅⋅────────╮
🛍 **Available Products**
✧ Nitro Boost
✧ Decoration
✧ App Premium

💳 **Payment**
・ DANA / QRIS

📩 **Need help or want to buy?**
・ *Boleh DM / Recommended Open Ticket*
╰────────⋅⋅⋅༺♡༻⋅⋅⋅────────╯

✨ Feel free to ask price list anytime!
`)
            .setTimestamp();

        await channel.send({ content: "@everyone **SHOP IS NOW OPEN!**", embeds: [openEmbed] });
        return;
    }

 // ================== SHOP HOLD ================== //
if (message.content === "?hold") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply("kamu belum punya izin buat pake command ini ✨");

    const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);

    const holdEmbed = new EmbedBuilder()
        .setTitle("⏳・SHOP STATUS: HOLD")
        .setColor("#F7D774")
        .setDescription(`
> Toko **ON HOLD** dulu yaa, sabar bentarr 🤍

╭────────────────⋅⋅⋅༺♡༻⋅⋅⋅────────────────╮
📌 **Reason**
・ Admin lagi ngurus order / break sebentar

📨 **Want to reserve order?**
・ Boleh kirim form dulu!

📩 **Recommended**
・ *DM / Open Ticket available*
╰────────────────⋅⋅⋅༺♡༻⋅⋅⋅────────────────╯

🫶 Thanks for waiting!
`)
        .setTimestamp();

    await channel.send({ content: "@everyone **SHOP ON HOLD**", embeds: [holdEmbed] });
    return;
}

// ================== SHOP CLOSE ================== //
if (message.content === "?close") {
    if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
        return message.reply("kamu belum punya izin buat pake command ini ✨");

    const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);

    const closeEmbed = new EmbedBuilder()
        .setTitle("💤・SHOP STATUS: CLOSED")
        .setColor("#808080")
        .setDescription(`
> Untuk sementara **CLOSED** dulu yaa 💤  

╭─────────────────⋅⋅⋅༺♡༻⋅⋅⋅─────────────────────╮
💗 **Orders already placed still being processed**
✧ Order yang sudah masuk tetap diproses kok!

📩 **Want to ask something?**
✧ *Boleh DM / Open Ticket* dulu — nanti di-respond saat OPEN ✨
╰─────────────────────⋅⋅⋅༺♡༻⋅⋅⋅─────────────────────╯

🌙 **See you when we open again!**
`)
        .setTimestamp();

    await channel.send({ content: "@everyone **SHOP IS CLOSED**", embeds: [closeEmbed] });
    return;
}

// ================== CYZPAY - PAYMENT COMMAND ================== //
if (message.content === "!cyzpay") {
    const paymentEmbed = new EmbedBuilder()
        .setTitle("💳・PAYMENT INFORMATION")
        .setColor("#FFC8D9")
        .setDescription(`
## 🩷 PAYMENT DANA

> ʚɞ ⁺ ˖🎀💭 dana : **081368819354**  
> a.n. **Cisa Lxx Vxx**  
> top-up from bank +1k

---

## 🌸 PAYMENT QRIS
> 🌺 𖦹 qris a.n **aiyselle store**
`)
        .setImage("https://cdn.discordapp.com/attachments/977100232972181544/1445469196782932150/cyzpay.jpg?ex=69307598&is=692f2418&hm=9c12199b2be6e8559c7929baecae91505c9f06faf0254418ac0a01d8a63e5881&") // ganti dengan link QRIS kamu
        .setFooter({
            text: "🛼 note :  please send proof of payment clearly without cutting, editing & etc. thank uu 💗"
        })
        .setTimestamp();

    return message.reply({ embeds: [paymentEmbed] });
}


// ================== LOGIN ================== //
client.login(process.env.DISCORD_TOKEN);
