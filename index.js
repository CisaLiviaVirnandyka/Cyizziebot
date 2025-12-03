// ================== SETUP & IMPORT ================== //
require("dotenv").config();
const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    PermissionsBitField,
    Events,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ChannelType,
    AttachmentBuilder
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
const TICKET_CATEGORY_ID   = "1443163855042641921";   // <-- ganti dengan ID kategori ticket
const TICKET_BASE_CHANNEL = "1443163855042641921"; // tempat semua thread dibuat
const STAFF_ROLE_ID        = "902169418962985010";   // role yang harus ikut di ticket


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

    // simple reply
    if (message.content === "halo") return message.reply("haii aku assistant cyizzie 🤍");
    if (message.content === "?ping") return message.reply(`pong! delay: ${client.ws.ping}ms`);

    // test welcome
    if (message.content === "!testwelcome") {
        client.emit(Events.GuildMemberAdd, message.member);
        return;
    }

 // ================== FORM NETFLIX ================== //
    if (message.content === "?formnet") {
        const formnet = `**NETFLIX ORDER FORM**
ㅤ
✧ Nama:
✧ Nomor WhatsApp:
✧ Merk & Tipe Perangkat:
✧ Lokasi:
✧ Jenis Plan : (1P1U / 1P2U / Private / Semi)
✧ Durasi:
✧ Catatan Tambahan (opsional):`;

        return message.reply(formnet);
    }

    // ================== FORM APLIKASI / PREMIUM APPS ================== //
    if (message.content === "?formapk") {
        const formapk = `**PREMIUM APPS ORDER FORM**
ㅤ
✧ Nama:
✧ Nomor WhatsApp:
✧ Tanggal Order:
✧ Durasi:
✧ Email & Password:
✧ Metode Pembayaran : (DANA / QRIS)
✧ Catatan Tambahan (opsional):`;

        return message.reply(formapk);
    }

    // form order
    if (message.content.startsWith("?form")) {
        const form = `## 🧁 ──  form data akun
ㅤ
💌 email :
🔑 password :
📦 produk : (nitro / decoration / app premium)
⏱️ durasi :
📌 note tambahan : (opsional)`;

        return message.reply(form);
    }

    // ================== PAYMENT INFO (!cyzpay) ================== //
    if (message.content === "?cpay") {

        // cuma ADMIN yang bisa pake
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator)) {
            return message.reply("kamu belum punya izin buat pake command ini ✨");
        }

        const payEmbed = new EmbedBuilder()
            .setTitle("💳 PAYMENT INFO")
            .setColor(0xFFC0CB)
            .addFields(
                {
                    name: "PAYMENT DANA",
                    value:
                        "ʚɞ ⁺ ˖ 🎀💭DANA : **081368819354**\n" +
                        "an. Cisa Lxx Vxx\n" +
                        "_top-up from bank +1k_"
                },
                {
                    name: "PAYMENT QRIS",
                    value:
                        "🪷 ʚ QRISֹ a.n **aiyselle store**\n" +
                        "Silakan scan QR di bawah ini untuk pembayaran via QRIS."
                }
            )
            // ganti URL di bawah ini dengan link gambar QRIS kamu
            .setImage("https://cdn.discordapp.com/attachments/977100232972181544/1445469196782932150/cyzpay.jpg?ex=69307598&is=692f2418&hm=9c12199b2be6e8559c7929baecae91505c9f06faf0254418ac0a01d8a63e5881&")
            .setFooter({
                text:
                    "🛼 note :  please send proof of payment clearly without cutting, editing & etc. thank uu 💗"
            })
            .setTimestamp();

        return message.reply({ embeds: [payEmbed] });
    }

     // ================== TICKET PANEL COMMAND ================== //
    if (message.content === "?ticketpanel") {
        const ticketEmbed = new EmbedBuilder()
            .setTitle("🎟️・Open a Ticket")
            .setDescription("Silakan pilih kebutuhan kamu di bawah ini ✨\nPrefer DM allowed / recommended ticket 💌")
            .setColor("#FFC0DC");

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("buy").setLabel("Buy Product").setStyle(ButtonStyle.Primary).setEmoji("🛒"),
            new ButtonBuilder().setCustomId("ask").setLabel("Ask").setStyle(ButtonStyle.Success).setEmoji("❓"),
            new ButtonBuilder().setCustomId("custom").setLabel("Custom Req").setStyle(ButtonStyle.Secondary).setEmoji("📦")
        );

        return message.channel.send({ embeds: [ticketEmbed], components: [buttons] });
    }

    // ================== PRICE LIST (?pl / ?cpl) ================== //
if (message.content === "?pl" || message.content === "?cpl") {
    const plEmbed = new EmbedBuilder()
        .setTitle("🌷💗 AiySelle’s Store — Price List App Premium")
        .setDescription(
            "Silakan cek kategori aplikasi di bawah dan pilih yang kamu mau.\n" +
            "Kalau bingung, boleh tanya dulu / open ticket yaa 🌸\n" +
            "\u200B"
        )
        .addFields(
            {
                name: "🍓✨ STREAMING APPS",
                value:
                    "• Catchplay 1b — 10k\n" +
                    "• Catchplay 6b — 18k\n" +
                    "• Catchplay 12b — 25k\n\n" +

                    "• MovieBox 1b — 12k\n" +
                    "• MovieBox 3b — 20k\n" +
                    "• MovieBox 12b — 30k\n\n" +

                    "• Sunshiroll 12b — 20k\n\n" +

                    "• Prime Video share 1b — 10k\n" +
                    "• Prime share (2u) 1b — 13k\n" +
                    "• Prime private 1b — 20k\n\n" +

                    "• Fizzo 1b — 10k\n" +
                    "• Fizzo 6b — 18k\n" +
                    "• Fizzo 12b — 22k\n\n" +

                    "• Vidio Platinum 12b — 15k (TV only)\n" +
                    "• Vidio share 2u1b — 22k\n" +
                    "• Vidio private 1b — 40k\n\n" +

                    "• Crunchyroll 12b — 15k\n\n" +

                    "• HBO/MAX standar 1b — 20k\n" +
                    "• HBO/MAX ultimate 1b — 22k\n\n" +

                    "• WeTV 5u1b — 12k\n" +
                    "• WeTV 3u1b — 20k\n\n" +

                    "• Bstation 1b — 10k\n" +
                    "• Bstation 12b — 20k\n\n" +

                    "• IQIYI standar 1b — 10k\n" +
                    "• IQIYI premium 1b — 13k\n" +
                    "• IQIYI premium 3b — 20k\n" +
                    "• IQIYI premium 12b — 30k\n\n" +

                    "• Youku 1b — 10k\n" +
                    "• Youku 3b — 20k\n" +
                    "• Youku 12b — 30k\n\n" +

                    "• VIU anlim 1b — 8k\n" +
                    "• VIU anlim 6b — 12k\n" +
                    "• VIU anlim 12b — 15k\n" +
                    "• VIU anlim lifetime — 20k\n\n" +

                    "• DrakorID 1b — 8k\n" +
                    "• DrakorID 3b — 12k\n" +
                    "• DrakorID 6b — 18k\n" +
                    "• DrakorID 12b — 25k\n\n"+
                    "\u200B"
            },
            {
                name: "🎀 NETFLIX",
                value:
                    "• **1P1U**\n" +
                    "   1h — 6k\n" +
                    "   3h — 12k\n" +
                    "   7h — 13k\n" +
                    "   1b — 30k\n" +
                    "   2b — 60k\n\n" +

                    "• **1P2U**\n" +
                    "   1h — 5k\n" +
                    "   3h — 9k\n" +
                    "   7h — 12k\n" +
                    "   1b — 22k\n\n" +

                    "• Private 7h — 45k\n" +
                    "• Semi Private 1b — 40k\n\n"+
                    "\u200B"
            },
            {
                name: "💗🎀 EDITING APPS",
                value:
                    "• Picsart private 1b — 20k\n" +
                    "• Picsart share 1b — 10k\n\n" +

                    "• CapCut share 1b — 12k\n" +
                    "• CapCut private 1b — 22k\n" +
                    "• CapCut private 7d — 10k\n" +
                    "• CapCut share 7d — 7k\n\n" +

                    "• VSCO 12b — 5k\n" +
                    "• Polar 12b — 7k\n\n" +

                    "• CamScanner 1b — 10k\n" +
                    "• CamScanner 12b — 20k\n\n" +

                    "• Lightroom 12b — 15k\n" +
                    "• IbisPaintX 12b — 15k\n\n" +

                    "• Canva member 1b — 7k\n" +
                    "• Canva EDU 6b — 15k\n" +
                    "• Canva lifetime gar 6b — 25k\n\n" +

                    "• Alight Motion private 6b — 10k\n" +
                    "• Alight Motion share 12b — 10k\n\n" +

                    "• OldRoll Lifetime — 20k\n\n"+
                    "\u200B"
            },
            {
                name: "🌸✨ OTHER APPS",
                value:
                    "• Perplexity private 1b (fullgar) — 22k\n" +
                    "• Perplexity private 1b (nogar) — 12k\n\n" +

                    "• ChatGPT Plus private 1b — 25k\n" +
                    "• ChatGPT share 1b — 20k\n\n" +

                    "• Apple Music 1b — 10k\n" +
                    "• Apple Music head 1b — 15k\n\n" +

                    "• Spotify 1b — 35k\n" +
                    "• Spotify 2b — 35k\n\n" +

                    "• Zoom 14d — 8k\n" +
                    "• Zoom 1b — 15k\n\n" +

                    "• Scribd private 1b — 10k\n\n" +

                    "• Grammarly share 1b — 15k\n" +
                    "• Quillbot share 1b — 7k\n" +
                    "• Quillbot private 1b — 29k\n\n" +

                    "• Wattpad 12b — 15k"
            }
        )
        .setFooter({ text: "Cyizzie Shop • App Premium Pricelist" })
        .setTimestamp();

    return message.reply({ embeds: [plEmbed] });
}

});

    // ================== SHOP OPEN ================== //
    client.on(Events.MessageCreate, async (message) => {
    if (message.content === "?open") {
        if (!message.member.permissions.has(PermissionsBitField.Flags.Administrator))
            return message.reply("kamu belum punya izin buat pake command ini ✨");

        const channel = message.guild.channels.cache.get(ANNOUNCE_CHANNEL_ID);
        if (!channel) return message.reply("Channel announce belum di-set dengan benar.");

        const openEmbed = new EmbedBuilder()
            .setTitle("🌸・SHOP STATUS: OPEN")
            .setColor("#FFB6C1")
            .setDescription(`
> Toko lagi **OPEN** sekarang 💌  
Silakan order ya 🤍

🛍 **Available Products**
✧ Nitro Boost
✧ Decoration
✧ App Premium

💳 **Payment**
・ DANA / QRIS

📩 **Need help or want to buy?**
・ *DM / Open Ticket → <#1443163855042641921>*
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
        if (!channel) return message.reply("Channel announce belum di-set dengan benar.");

        const holdEmbed = new EmbedBuilder()
            .setTitle("⏳・SHOP STATUS: HOLD")
            .setColor("#F7D774")
            .setDescription(`
> Toko lagi **ON HOLD** dulu yaa 🤍

📌 **Reason**
・ Admin lagi ada kerjaan bentar / lagi break ✨

📨 **Want to reserve order?**
・ Boleh kirim form dulu, send ke → <#1443163855042641921> nanti diproses langsung saat OPEN lagi 🤍

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
        if (!channel) return message.reply("Channel announce belum di-set dengan benar.");

        const closeEmbed = new EmbedBuilder()
            .setTitle("💤・SHOP STATUS: CLOSED")
            .setColor("#d72323")
            .setDescription(`
> Untuk sementara **CLOSED** dulu yaa 💤  

💗 **Orders already placed still being processed**
✧ Order yang sudah masuk tetap diproses kok!

📩 **Want to ask something?**
✧ *Boleh DM / Open Ticket* dulu — nanti di-respond saat OPEN ✨

>🌙 See you when we open again!
`)
            .setTimestamp();

        await channel.send({ content: "@everyone **SHOP IS CLOSED**", embeds: [closeEmbed] });
        return;
    }

    // ---------- STAFF TOOLS (HANYA DI TICKET THREAD) ---------- //
    if (message.content === "?wait") {

         const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);

    const inTicketThread =
        message.channel.type === ChannelType.PrivateThread ||
        message.channel.type === ChannelType.PublicThread;
        if (!isStaff)
            return message.reply("command ini khusus **staff** ✨");
        if (!inTicketThread)
            return message.reply("command ini cuma boleh dipakai di **ticket thread** ✨");

        const embed = new EmbedBuilder()
            .setTitle("⏳・Order Status: On Process")
            .setColor("#F7D774")
            .setDescription(`
Order kamu lagi **diproses** yaa 🤍  

📌 **Info penting**
・ Mohon standby, terutama kalau order Nitro (perlu verifikasi akun)
・ Jangan ganti email / password dulu sampai selesai
・ Cek ticket ini secara berkala untuk update ✨
`)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (message.content === "?proses") {

         const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);

    const inTicketThread =
        message.channel.type === ChannelType.PrivateThread ||
        message.channel.type === ChannelType.PublicThread;

        if (!isStaff)
            return message.reply("command ini khusus **staff** ✨");
        if (!inTicketThread)
            return message.reply("command ini cuma boleh dipakai di **ticket thread** ✨");

        const embed = new EmbedBuilder()
            .setTitle("🛠️・ORDER STATUS: IN PROCESS")
            .setColor("#03A9F4")
            .setDescription("Order kamu lagi **dikerjakan** yaa 💗\nMohon ditunggu sebentar.")
            .setFooter({ text: `Updated by ${message.author.tag}` })
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }

    if (message.content === "?done") {

         const isStaff = message.member.roles.cache.has(STAFF_ROLE_ID);

    const inTicketThread =
        message.channel.type === ChannelType.PrivateThread ||
        message.channel.type === ChannelType.PublicThread;

        if (!isStaff)
            return message.reply("command ini khusus **staff** ✨");
        if (!inTicketThread)
            return message.reply("command ini cuma boleh dipakai di **ticket thread** ✨");

        const embed = new EmbedBuilder()
            .setTitle("✅・Order Selesai")
            .setColor("#A3E635")
            .setDescription(`
Order kamu sudah **SELESAI** 🧾  
Terima kasih sudah belanja di **Cyizzie Shop** 🤍  

💌 **Testimoni**
Silakan kirim testi di <#1437113270598242406>  
wajib pakai **screenshot produk** ✨

<a:PinkRightArrowBounce:1444894009435881524> Ga testi dalam 24 jam setelah produk diterima, **no garansi**  
<a:PinkRightArrowBounce:1444894009435881524> Testi **wajib pakai screenshot** product  
<a:PinkRightArrowBounce:1444894009435881524> Leave server = **garansi void / hangus**
`)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
});

// ================== BUTTON INTERACTION (TICKET + CLOSE + TRANSCRIPT) ================== //
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const user  = interaction.user;

    // =============== CLOSE TICKET =============== //
if (interaction.customId === "close_ticket") {
    const thread = interaction.channel;

    if (thread.type !== ChannelType.PublicThread && thread.type !== ChannelType.PrivateThread) {
        return interaction.reply({ content: "Ini cuma bisa dipakai di ticket thread ✨", ephemeral: true });
    }

    await interaction.reply({
        content: "Menyusun transcript & menutup ticket... 🔒",
        ephemeral: true
    });

    // Fetch messages
    const msgs = await thread.messages.fetch({ limit: 100 });
    const sorted = Array.from(msgs.values()).sort(
        (a, b) => a.createdTimestamp - b.createdTimestamp
    );

    // TEXT TRANSCRIPT
    let txt = `Ticket Transcript - ${thread.name} (${thread.id})\n`;
    txt += `Guild: ${guild.name} (${guild.id})\n`;
    txt += `Closed By: ${user.tag} (${user.id})\n`;
    txt += `Closed At: ${new Date().toLocaleString()}\n`;
    txt += `----------------------------------------\n\n`;

    for (const m of sorted) {
        const time = new Date(m.createdTimestamp).toLocaleString();
        const author = m.author ? `${m.author.tag}` : "Unknown";
        const content = m.content || "";
        const attach = m.attachments.size
            ? ` [attachments: ${m.attachments.map(a => a.url).join(", ")}]`
            : "";

        txt += `[${time}] ${author}: ${content}${attach}\n`;
    }

    const buffer = Buffer.from(txt, "utf8");
    const file = new AttachmentBuilder(buffer, {
        name: `ticket-${thread.id}.txt`
    });

    // Upload online — paste.gg
    const axios = require("axios");
    let onlineURL = "Unavailable";

    try {
        const res = await axios.post("https://api.paste.gg/v1/pastes", {
            name: `Ticket-${thread.id}`,
            description: "Cyizzie Shop Ticket Transcript",
            files: [
                {
                    name: `ticket-${thread.id}.txt`,
                    content: {
                        format: "text",
                        value: txt
                    }
                }
            ]
        });
        onlineURL = res.data.result.url;
    } catch (e) {
        console.log("Gagal upload transcript:", e);
    }

    // Aesthetic embed
    const openedBy = sorted[0]?.author ?? user;
    const createdAt = Math.floor(thread.createdTimestamp / 1000);
    const closedAt = Math.floor(Date.now() / 1000);

    const embedClose = new EmbedBuilder()
        .setColor("#FFC4D8")
        .setAuthor({
            name: "FrEzzFamily • Ticket Log",
            iconURL: guild.iconURL({ size: 1024 })
        })
        .setTitle("🌸 Ticket Closed")
        .addFields(
            { name: "🔢 Ticket ID", value: `\`${thread.id}\``, inline: true },
            { name: "🟢 Opened By", value: `<@${openedBy.id}>`, inline: true },
            { name: "🔴 Closed By", value: `<@${user.id}>`, inline: true },
            { name: "🕒 Open Time", value: `<t:${createdAt}:f>`, inline: true },
            { name: "🟣 Claimed By", value: `Not claimed`, inline: true },
            { name: "📘 Reason", value: "No reason specified" }
        )
        .setFooter({ text: "Cyizzie Shop — soft pink aesthetic ♡" })
        .setTimestamp();

    // Buttons
    const rowButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("📄 View Online Transcript")
            .setURL(onlineURL),

        new ButtonBuilder()
            .setStyle(ButtonStyle.Link)
            .setLabel("🔗 View Thread")
            .setURL(`https://discord.com/channels/${guild.id}/${thread.id}`)
    );

    // Send DM to user
    await user.send({
        content: "haii, ini recap ticket kamu yaa ✨",
        embeds: [embedClose],
        files: [file],
        components: [rowButtons]
    }).catch(() => {});

    // Archive + lock + delete
    await thread.setArchived(true).catch(() => {});
    await thread.setLocked(true).catch(() => {});

    setTimeout(() => {
        thread.delete().catch(() => {});
    }, 1500);

    return;
}

    // =============== CREATE TICKET (buy / ask / custom) =============== //
    if (!["buy", "ask", "custom"].includes(interaction.customId)) return;

    const ticketBase = guild.channels.cache.get(TICKET_BASE_CHANNEL);
    if (!ticketBase) {
        return interaction.reply({
            content: "Channel ticket base tidak ditemukan, cek ID!",
            ephemeral: true
        });
    }

    const ticketName = `ticket-${user.username}`; // username tanpa di-edit

    // Cek apakah masih ada thread dengan nama itu yang BELUM ke-delete
    const existing = ticketBase.threads.cache.find(
        t => t.name === ticketName && !t.archived
    );
    if (existing) {
        return interaction.reply({
            content: "kamu sudah punya ticket aktif ✨",
            ephemeral: true
        });
    }

    // Create thread baru
    const thread = await ticketBase.threads.create({
        name: ticketName,
        autoArchiveDuration: 1440, // 24 jam
        reason: "Ticket created"
    });

    // Hapus pesan system otomatis (kalau ada)
    try {
        const systemMsg = await ticketBase.messages.fetch({ limit: 1 });
        systemMsg.first()?.delete().catch(() => {});
    } catch {}

    // Add user ke thread
    await thread.members.add(user.id).catch(() => {});

    await interaction.reply({
        content: `Ticket berhasil dibuat → <#${thread.id}>`,
        ephemeral: true
    });

    const openEmbed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Created")
        .setDescription(`Hai <@${user.id}>! Makasii sudah buka ticket ✨\nAdmin segera respon yaa 💗`)
        .addFields({ name: "Ticket Type", value: `\`${interaction.customId}\`` })
        .setColor("#FF91C9");

    const closeBtn = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("close_ticket")
            .setLabel("Close Ticket")
            .setStyle(ButtonStyle.Danger)
            .setEmoji("🔒")
    );

        await thread.send({
        content: `<@${user.id}> <@&${STAFF_ROLE_ID}>`,
        embeds: [openEmbed],
        components: [closeBtn]
    });
});

// ================== LOGIN ================== //
client.login(process.env.DISCORD_TOKEN);
