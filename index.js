// ================== SETUP & IMPORT ================== //
const {
    joinVoiceChannel,
    createAudioPlayer,
    NoSubscriberBehavior,
    getVoiceConnection
} = require("@discordjs/voice");
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
    AttachmentBuilder,
    StringSelectMenuBuilder,
    MessageFlags
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

// ================== GLOBAL ERROR HANDLER ================== //
client.on("error", (err) => console.error("Client error:", err));
process.on("unhandledRejection", (reason) =>
    console.error("Unhandled Rejection:", reason)
);

// ================== CONFIG ID ================== //
const WELCOME_CHANNEL_ID   = "862261084697264149";
const AUTO_ROLE_ID         = "894948896248320003";
const ANNOUNCE_CHANNEL_ID  = "1437112719412039771";
const TICKET_BASE_CHANNEL  = "1443163855042641921";
const STAFF_ROLE_ID        = "902169418962985010";

// mapping biar ticket type rapi di recap
const TICKET_TYPE_MAP = {
    buy: "Buy Product",
    ask: "Ask Question",
    custom: "Custom Request",
    warranty: "Warranty Claim"
};

// ============== UTIL: WAKTU FORMAT ID ================= //
const TIMEZONE = "Asia/Jakarta";

const formatTime = (d) => {
    const dt = new Date(d);
    return dt.toLocaleString("id-ID", {
        timeZone: TIMEZONE,
        day: "2-digit",
        month: "long",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
};

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
    try {
        await member.roles.add(AUTO_ROLE_ID);
        console.log(`Autorole diberikan ke ${member.user.tag}`);
    } catch (err) {
        console.error("Gagal memberi autorole:", err);
    }

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

    // ================== VOICE JOIN SIMPLE ================== //
    if (message.content === "?joinvc") {
        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return message.reply("kamu belum ada di voice channel mana pun 😿");
        }

        // kalau sudah ada koneksi lama di guild ini, destroy dulu biar bersih
        const existing = getVoiceConnection(message.guild.id);
        if (existing) {
            existing.destroy();
        }

        const connection = joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
            selfDeaf: false,
            selfMute: false,
        });

        // player dummy biar koneksi stabil
        const player = createAudioPlayer({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play,
            },
        });
        connection.subscribe(player);

        connection.on("stateChange", (oldState, newState) => {
            console.log(
                `Voice state ${message.guild.name}: ${oldState.status} -> ${newState.status}`
            );
        });

        connection.on("error", (err) => {
            console.error("Voice connection error:", err);
        });

        return message.reply(`aku udah masuk ke voice **${voiceChannel.name}** 🎧`);
    }

    // ================== VOICE LEAVE SIMPLE ================== //
    if (message.content === "?leavevc") {
        const connection = getVoiceConnection(message.guild.id);

        if (!connection) {
            return message.reply("aku lagi nggak ada di voice mana-mana kok 🐾");
        }

        connection.destroy();
        return message.reply("oke, aku udah keluar dari voice yaa 💗");
    }

    // test welcome
    if (message.content === "!testwelcome") {
        client.emit(Events.GuildMemberAdd, message.member);
        return;
    }

    // ================== FORM NETFLIX ================== //
    if (message.content === "?formnet") {
        return message.reply(`**NETFLIX ORDER FORM**
ㅤ
✧ Nama:
✧ Nomor WhatsApp:
✧ Merk & Tipe Perangkat:
✧ Lokasi:
✧ Jenis Plan : (1P1U / 1P2U / Private / Semi)
✧ Durasi:
✧ Catatan Tambahan (opsional):`);
    }

    // ================== FORM APPS ================== //
    if (message.content === "?formapk") {
        return message.reply(`**PREMIUM APPS ORDER FORM**
ㅤ
✧ Nama:
✧ Nomor WhatsApp:
✧ Tanggal Order:
✧ Durasi:
✧ Email & Password:
✧ Metode Pembayaran : (DANA / QRIS)
✧ Catatan Tambahan (opsional):`);
    }

    // ================== GENERIC FORM ================== //
    if (message.content.startsWith("?form")) {
        return message.reply(`## 🧁 ──  form data akun
ㅤ
💌 email :
🔑 password :
📦 produk : (nitro / decoration / app premium)
⏱️ durasi :
📌 note tambahan : (opsional)`);
    }

    // ================== DISCORD SHOP PANEL (?pldc) ================== //
    if (message.content === "?pldc") {
        const shopEmbed = new EmbedBuilder()
            .setTitle("<:Nitro_boost:1446372485183307907> DISCORD NEEDS ・⊹♡³")
            .setColor(0xFFC0DC)
            .setDescription(
`**୨୧  Discord Services ୨୧** 
**Nitro ┊ Decoration ┊ Server Boost**

Layanan untuk mempercantik tampilan akun dan server dengan nuansa
lebih expressive dan elegan. Semua proses dilakukan secara manual,
original, dan tetap mengutamakan keamanan akun.

Jika terdapat permintaan khusus atau layanan yang belum tercantum,
silakan request melalui ticket dan kami bantu menyesuaikan sesuai kebutuhanmu.

> buka ticket di <#1443163855042641921> untuk melanjutkan ˖🤍𓇼
`
            )
            .setTimestamp();

        const menu = new StringSelectMenuBuilder()
            .setCustomId("discord_shop_select")
            .setPlaceholder("Pilih kategori layanan yang kamu mau…")
            .addOptions(
                {
                    label: "Nitro Boost",
                    value: "nitro_boost",
                    description: "Langganan Nitro premium untuk akun Discord kamu.",
                    emoji: "<:Nitro_boost:1446372485183307907>"
                },
                {
                    label: "N!tro Promotion",
                    value: "nitro_promo",
                    description: "Paket promo Nitro 3 bulan untuk semua akun.",
                    emoji: "<:Nitro_boost:1446372485183307907>"
                },
                {
                    label: "Decoration & Profile Effect",
                    value: "decoration",
                    description: "Avatar decoration & efek profil eksklusif.",
                    emoji: "<a:PinkRibbonWhisper:1444892780118671381>"
                },
                {
                    label: "Boost Server & Server Tag",
                    value: "server_boost",
                    description: "Naikkan level & tampilan server dengan boost.",
                    emoji: "⚡"
                }
            );

        const row = new ActionRowBuilder().addComponents(menu);

        return message.channel.send({
            embeds: [shopEmbed],
            components: [row]
        });
    }

    // ================== PRICELIST PANEL FULL (?pl) ================== //
    if (message.content === "?pl") {
        const priceEmbed = new EmbedBuilder()
            .setTitle("🌸 Cyizzie Shop ・ Pricelist")
            .setColor(0xFFC0DC)
            .setDescription(
`Berikut rangkuman pricelist N!TRO di **Cyizzie Shop** <a:d_strawberrycake:1433157793782829157>  
Silakan cek detailnya di bawah ini, lalu open ticket bila sudah siap order ♡`
            )
            .addFields(
                {
                    name: "<:Nitro_boost:1446372485183307907> Nitro Boost",
                    value:
`・ Nitro Boost Vilog 1 Bulan : 75.000
・ Nitro Boost Vilog 1 Tahun : 700.000
・ Nitro Boost Gift 1 Tahun : 78.000
・ Nitro Boost Gift 1 Tahun : 730.000

_> Via vilog, garansi sesuai ketentuan toko._`,
                    inline: false
                },
                {
                    name: "<:Nitro_boost:1446372485183307907> N!tro Boost Vilog Promotion",
                    value:
`**Promotion 3 Month [ All/New User ]**
<a:PinkRightArrowBounce:1444894009435881524> **65.000 IDR**

**NOTE**
 <a:PinkRightArrowBounce:1444894009435881524> Berlaku untuk All User / Semua Akun
 <a:PinkRightArrowBounce:1444894009435881524> Akun tanpa subscriptions aktif
 <a:PinkRightArrowBounce:1444894009435881524> Wajib dicek dulu status bisa / tidaknya
 <a:PinkRightArrowBounce:1444894009435881524> Proses via Login Akun Discord

_> Paket promo hanya tersedia di periode tertentu._`,
                    inline: false
                },
                {
                    name: "<a:PinkRibbonWhisper:1444892780118671381> Decoration & Profile Effect",
                    value:
`<a:MyMelodySpin:1444891323596537917> **Dec0rations V!LOG**

With N!tr0 / Without N!tr0 :
33.000 / 39.500 IDR <a:PinkRightArrowBounce:1444894009435881524> 24.500 / 29.500 IDR
39.500 / 65.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 29.500 / 49.500 IDR
52.000 / 91.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 39.999 / 69.500 IDR
65.000 / 91.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 49.999 / 69.500 IDR
71.000 / 100.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 54.999 / 79.500 IDR
91.000 / 105.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 70.999 / 89.500 IDR
100.000 / 120.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 79.999 / 107.500 IDR`,
                    inline: false
                },
                {
                    name: "\u200b",
                    value:
`<a:PinkExclaimBounce:1444893885246734358>**NOTE :**
➝ Legally Paid
➝ Ultra High Quality (UHQ)
➝ Fast Process
➝ Require Email, Password & Backup Code
➝ Via Login`,
                    inline: false
                },
                {
                    name: "<a:Nitro:1446372229683216576> Boost Server & Server Tag",
                    value:
`**14x Server Boost 1 Month (24-30 Day) - 130K** 
**14x Server Boost 3 Month (80 - 90 Day) - 250K**

## OPEN SERVER TAG
**3x Server Boost 1 Month (24-30 Day) - 40K**
**3x Server Boost 3 Month (80 - 90 Day) - 50K**
ㅤ
➝ proses manual  
➝ no rush order  
➝ off anti raid  
➝ off community features  
➝ full warranty kecuali acc di kick / kena revoke wave  

_> Bisa request setting tampilan server sekalian, by request lewat ticket._`,
                    inline: false
                }
            )
            .setFooter({ text: "Cyizzie Shop • Elegance in every service. Comfort in every detail." })
            .setTimestamp();

        return message.channel.send({ embeds: [priceEmbed] });
    }

    // ================== PAYMENT INFO (?cpay) ================== //
    if (message.content === "?cpay") {
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
            .setImage("https://cdn.discordapp.com/attachments/977100232972181544/1445469196782932150/cyzpay.jpg")
            .setFooter({
                text: "🛼 note :  please send proof of payment clearly without cutting, editing & etc. thank uu 💗"
            })
            .setTimestamp();

        return message.reply({ embeds: [payEmbed] });
    }

    // ================== TICKET PANEL COMMAND ================== //
    if (message.content === "?ticketpanel") {
        const ticketEmbed = new EmbedBuilder()
            .setTitle("🎟️・Open a Ticket")
            .setDescription("Silakan pilih kebutuhan kamu di bawah ini ✨\nPrefer DM allowed / recommended ticket 💌")
            .setImage("https://media.discordapp.net/attachments/977100232972181544/1447492195958526042/IMG_8990.png?ex=6937d1a8&is=69368028&hm=643fc91e9e6f9f0cedd0444793a4e2f8121f85d66825c1a773ae5ccc11ab69a9&=&format=webp&quality=lossless&width=1448&height=815")
            .setColor("#FFC0DC");

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("buy").setLabel("Buy Product").setStyle(ButtonStyle.Primary).setEmoji("🛒"),
            new ButtonBuilder().setCustomId("ask").setLabel("Ask").setStyle(ButtonStyle.Success).setEmoji("❓"),
            new ButtonBuilder().setCustomId("custom").setLabel("Custom Req").setStyle(ButtonStyle.Secondary).setEmoji("📦")
        );

        return message.channel.send({ embeds: [ticketEmbed], components: [buttons] });
    }

    // ================== WARRANTY TICKET PANEL (PANEL TERPISAH) ================== //
    if (message.content === "?warrantypanel") {
        const warrantyEmbed = new EmbedBuilder()
            .setTitle("🧾・Claim Warranty Ticket")
            .setColor(0xFEB7D3)
            .setDescription(`
Panel khusus untuk **klaim garansi** layanan di Cyizzie Shop 💗

Sebelum klik tombol, siapkan dulu:

・ Screenshot problem / permasalahan  
・ Screenshot pas kirim testimoni produk   
・ Username & ID Discord yang dipakai  
・ Tanggal pembelian dan jenis produk  

> Garansi mengikuti ketentuan toko, mohon dibaca dulu sesuai snk rules/shop yaa ✨
        `)
            .setImage("https://cdn.discordapp.com/attachments/977100232972181544/1447492195056746506/IMG_8991.png?ex=6937d1a8&is=69368028&hm=641ecd7fd03d3ac74c2164c39a219f6fefbe105db66dc9cb22200b09932e1b29&");

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("warranty")
                .setLabel("Claim Warranty")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🧾")
        );

        return message.channel.send({ embeds: [warrantyEmbed], components: [row] });
    }

    // ================== PANEL PREMIUM APPS (SELECT MENU) ================== //
    if (message.content === "?apppanel") {
        const embed = new EmbedBuilder()
            .setTitle("🌷 Premium Apps ･ﾟ✧")
            .setColor(0xFFC0DC)
            .setDescription(`
✧ Tersedia semua aplikasi premium & kebutuhan sosmed.

Kalau aplikasi yang kamu cari belum ada di daftar, kamu bisa **request lewat ticket**,  
nanti aku bantu carikan versi yang paling cocok dan aman untuk kamu gunakan ✦

Seluruh layanan bersifat **original, aman, dan nyaman dipakai**, jadi kamu bisa menikmati fitur premiumnya tanpa worry ♡

Silakan pilih aplikasi di menu bawah yaa ˚₊‧♡
> “Yuk, pilih dulu aplikasinya di sini ↓”
`);

        const menu = new StringSelectMenuBuilder()
            .setCustomId("premium_app_select")
            .setPlaceholder("Pilih aplikasi yang kamu mau…")
            .addOptions(
                {
                    label: "Netflix",
                    value: "netflix",
                    description: "Harian / Mingguan / Bulanan / Private.",
                    emoji: "<:netflix:1446369911629807680>"
                },
                {
                    label: "Crunchyroll",
                    value: "crunchyroll",
                    description: "Crunchyroll Durasi Bulanan /Tahunan.",
                    emoji: "<:crunchyroll:1446373595679952921>"
                },
                {
                    label: "CapCut",
                    value: "capcut",
                    description: "CapCut PRO / Team.",
                    emoji: "<:Capcut:1446370939041349654>"
                },
                {
                    label: "Apple Music",
                    value: "apple_music",
                    description: "Apple Music Individual / Family.",
                    emoji: "<:Apple_Music:1446371969044844626>"
                },
                {
                    label: "Wattpad",
                    value: "wattpad",
                    description: "Wattpad Premium Durasi Bulanan /Tahunan.",
                    emoji: "<:Wattpad:1446373038110281833>"
                },
                {
                    label: "YouTube Premium",
                    value: "youtube",
                    description: "Famplan / Indplan / Head.",
                    emoji: "<:Youtubelogo:1446371208957399062>"
                },
                {
                    label: "Canva",
                    value: "canva",
                    description: "Canva Premium / EDU / Lifetime.",
                    emoji: "<:canva:1446371317396934787>"
                },
                {
                    label: "Spotify",
                    value: "spotify",
                    description: "Famplan / Indplan.",
                    emoji: "<:Spotify:1446370163610882060>"
                }
            );

        const row = new ActionRowBuilder().addComponents(menu);

        return message.channel.send({
            embeds: [embed],
            components: [row]
        });
    }

    // ================== SHOP STATUS ================== //
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
            .setImage("https://media.discordapp.net/attachments/977100232972181544/1447492226350317588/IMG_8984.png?ex=6937d1af&is=6936802f&hm=7c3aa3be1b282f557a99fdbf1ef6eb26a0855f0943cb29e9e88b194d27ac57ca&=&format=webp&quality=lossless&width=1448&height=815")
            .setTimestamp();

        await channel.send({ content: "@everyone **SHOP IS NOW OPEN!**", embeds: [openEmbed] });
        return;
    }

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
            .setImage("https://media.discordapp.net/attachments/977100232972181544/1447492225679233124/IMG_8983.png?ex=6937d1af&is=6936802f&hm=9900612faab2eb56aac31fd42ec607781db30d7a8916aa9be7ce4bf1152148ba&=&format=webp&quality=lossless&width=1448&height=815")
            .setTimestamp();

        await channel.send({ content: "@everyone **SHOP IS CLOSED**", embeds: [closeEmbed] });
        return;
    }

    // ================== STAFF TOOLS (ONLY TICKET THREAD) ================== //
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
            .setTitle("⏳・Order Status: On Waiting")
            .setColor("#F7D774")
            .setDescription(`
Order kamu lagi **diproses** yaa 🤍  

📌 **Info penting**
・ Mohon standby, terutama kalau order Nitro (perlu verify)
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
Silakan kirim testi di <#1437113270598242406> dan wajib pakai **screenshot produk** ✨

<a:PinkRightArrowBounce:1444894009435881524> Ga testi dalam 24 jam setelah produk diterima, **no garansi**  
<a:PinkRightArrowBounce:1444894009435881524> Testi **wajib pakai screenshot product**, NO FORWARD/DITERUSKAN!
<a:PinkRightArrowBounce:1444894009435881524> Leave server = **garansi void / hangus**
`)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
});

// ================== INTERACTION HANDLER ================== //
client.on(Events.InteractionCreate, async (interaction) => {

    // ===== SELECT MENU PREMIUM APPS ===== //
    if (interaction.isStringSelectMenu() && interaction.customId === "premium_app_select") {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selected = interaction.values[0];
        let appEmbed;

        // NETFLIX
        if (selected === "netflix") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:netflix:1446369911629807680> NETFLIX PRICELIST")
                .setColor("#E50914")
                .setDescription(`
╭────────꒰ **Netflix** ꒱

**˖˙⁠๑ 1p2u ˖⊹**
 › ◌ 1 bulan : 20.000
 › ◌ 2 bulan : 40.000
 › ◌ 3 bulan : 60.000

**˖˙⁠๑ 1p1u ˖⊹**
 › ◌ 7 hari : 13.000
 › ◌ 1 bulan : 30.000
 › ◌ 2 bulan : 60.000
 › ◌ 3 bulan : 90.000

**˖˙⁠๑ semi private ˖⊹**
 › ◌ 7 hari : 17.000
 › ◌ 1 bulan : 40.000
 › ◌ 2 bulan : 80.000
 › ◌ 3 bulan : 120.000

**˖˙⁠๑ private ˖⊹**
 › ◌ 7 hari : 60.000
 › ◌ 1 bulan : 160.000

**๑⁠˙⁠❥ notes**
˖⊹ acc s only
˖⊹ sharing 1u/2u login 1 dev only
˖⊹ sharing semi private login max 2 dev
˖⊹ private made by order
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // CRUNCHYROLL
        else if (selected === "crunchyroll") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:crunchyroll:1446373595679952921> CRUNCHYROLL PRICELIST")
                .setColor("#F47521")
                .setDescription(`
╭────────꒰ **CRUNCHYROLL** ꒱

**˖˙⁠๑ sharing ˖⊹**
 › ◌ 1 bulan : 12.000
 › ◌ 2 bulan : 18.000
 › ◌ 12 bulan : 25.000

**๑⁠˙⁠❥ notes**
˖⊹ acc s only
˖⊹ no renew
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // CAPCUT
        else if (selected === "capcut") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:Capcut:1446370939041349654> CAPCUT PRICELIST")
                .setColor("#000000")
                .setDescription(`
╭────────꒰ **CapCut Pro** ꒱

**˖˙⁠๑ sharing 3 user ˖⊹**
 › ◌ 7 hari : 7.000
 › ◌ 14 hari : 11.000
 › ◌ 1 bulan : 15.000

**˖˙⁠๑ private ˖⊹**
 › ◌ 7 hari : 12.000
 › ◌ 1 bulan : 20.000 (garansi 7 hari)
 › ◌ 1 bulan : 30.000 (full garansi)

**๑⁠˙⁠❥ notes**
˖⊹ acc s only
˖⊹ sharing gaboleh login pc / laptop!
˖⊹ login laptop wajib beli 2slot!
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // APPLE MUSIC
        else if (selected === "apple_music") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:Apple_Music:1446371969044844626> APPLE MUSIC PRICELIST")
                .setColor("#FA2D48")
                .setDescription(`
╭────────꒰ **Apple Music** ꒱

**˖˙⁠๑ imess ˖⊹**
› ◌ 1 bulan : 10.000
› ◌ 2 bulan : 20.000

**˖˙⁠๑ individual ˖⊹**
› ◌ 1 bulan : 15.000

**๑⁠˙⁠❥ notes**
˖⊹ via imess / ind butuh email atau apple id
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // WATTPAD
        else if (selected === "wattpad") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:Wattpad:1446373038110281833> WATTPAD PRICELIST")
                .setColor("#FF8C00")
                .setDescription(`
╭────────꒰ **Wattpad** ꒱

**˖˙⁠๑ famplan ˖⊹**
› ◌ 1 bulan : 8.000
› ◌ 12 bulan : 25.000

**๑⁠˙⁠❥ notes**
˖⊹ acc dari seller
˖⊹ durasi 1 tahun garansi 6 bulan
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // YOUTUBE
        else if (selected === "youtube") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:Youtubelogo:1446371208957399062> YOUTUBE PREMIUM PRICELIST")
                .setColor("#FF0000")
                .setDescription(`
╭────────꒰ **YouTube** ꒱

**˖˙⁠๑ famplan ˖⊹**
› ◌ 1 bulan : 7.000
› ◌ 2 bulan : 12.000

**˖˙⁠๑ indplan ˖⊹**
› ◌ 1 bulan : 10.000
› ◌ 3 bulan : 27.000 (renew) 
› ◌ 3 bulan : 40.000 (no renew, acc s ongly) 

**˖˙⁠๑ mixplan ˖⊹**
› ◌ 3 bulan : 20.000
› ◌ 4 bulan : 25.000
› ◌ 6 bulan : 35.000

**๑⁠˙⁠❥ notes**
˖⊹ acc s +2k
˖⊹ indplan bisa pakai acc c tapi wajib gmail fresh.
˖⊹ famplan max invite 1 tahun hanya 2×. jika c sudah terlanjur di invite namun sudah tidak bisa join family lagi maka no reff
˖⊹ pastikan sudah left family jika sebelumnya sudah pernah berlangganan.
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // CANVA
        else if (selected === "canva") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:canva:1446371317396934787> CANVA PRICELIST")
                .setColor("#00C4CC")
                .setDescription(`
╭────────꒰ **Canva Pro** ꒱

**˖˙⁠๑ member ˖⊹**
 › ◌ 1 bulan : 5.000
 › ◌ 2 bulan : 9.000
 › ◌ 3 bulan : 12.000
 › ◌ 6 bulan : 16.000
 › ◌ 1 tahun : 18.000

**˖˙⁠๑ education ˖⊹**
 › ◌ lifetime garansi 6 bulan : 20.000
 › ◌ lifetime garansi 12 bulan : 25.000

**๑⁠˙⁠❥ notes**
˖⊹ sistem via invite
˖⊹ durasi 1 tahun, garansi 7 bulan.
˖⊹ resiko pindah team utk durasi lebih dari 1 bulan
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        // SPOTIFY
        else if (selected === "spotify") {
            appEmbed = new EmbedBuilder()
                .setTitle("<:Spotify:1446370163610882060> SPOTIFY PRICELIST")
                .setColor("#1DB954")
                .setDescription(`
╭────────꒰ **Spotify** ꒱

**˖˙⁠๑ famplan/indplan ˖⊹**
 › ◌ 1 bulan : 20.000
 › ◌ 2 bulan : 35.000
 › ◌ 3 bulan : 45.000

**๑⁠˙⁠❥ notes**
˖⊹ acc s only
˖⊹ no renew (diusahakan)
˖⊹ durasi 1 bulan garansi 20 hari
˖⊹ durasi 2 bulan garansi 40 hari
˖⊹ durasi 3 bulan garansi 60 hari
`)
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        return interaction.editReply({ embeds: [appEmbed] });
    }

    // ===== SELECT MENU DISCORD SHOP ===== //
    if (interaction.isStringSelectMenu() && interaction.customId === "discord_shop_select") {

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        const selected = interaction.values[0];
        let priceEmbed;

        if (selected === "nitro_boost") {
            priceEmbed = new EmbedBuilder()
                .setTitle("<:Nitro_boost:1446372485183307907> Nitro Boost — Pricelist")
                .setColor(0xFF7FD3)
                .setDescription(
`🦢₊˚ Nitro Boost Vilog 1 Bulan : 75.000
🦢₊˚ Nitro Boost Vilog 1 Tahun : 700.000
🦢₊˚ Nitro Boost Gift 1 Bulan : 78.000
🦢₊˚ Nitro Boost Gift 1 Tahun : 730.000

**NOTE :**
➺ harga bisa berubah kapanpun, tanyakan stock melalui ticket disini
➺ [vilog] akun wajib send email, password + backup code (opsional)
➺ via login = no rush order / spamming`
                )
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        } else if (selected === "nitro_promo") {
            priceEmbed = new EmbedBuilder()
                .setTitle("<:Nitro_boost:1446372485183307907> N!tro Boost Vilog Promotion")
                .setColor(0xFF9AD9)
                .setDescription(
`**N!tro Promotion 3 Month [ All User ]**  
<a:PinkRightArrowBounce:1444894009435881524> **65.000 IDR**

**NOTE**  
➺ Berlaku untuk _all user_ / semua akun  
➺ Akun tidak memiliki subscription aktif  
➺ Wajib dicek terlebih dahulu status bisa / tidak  
➺ Proses via login akun discord`
                )
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        } else if (selected === "decoration") {
            priceEmbed = new EmbedBuilder()
                .setTitle("<a:PinkRibbonWhisper:1444892780118671381> Decoration & Profile Effect — Pricelist")
                .setColor(0xFFB6E1)
                .setDescription(
`<a:MyMelodySpin:1444891323596537917> **Dec0rations V!LOG**

**With N!tr0 / Without N!tr0 :**
33.000 / 39.500 IDR <a:PinkRightArrowBounce:1444894009435881524> 24.500 / 29.500 IDR
39.500 / 65.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 29.500 / 49.500 IDR
52.000 / 91.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 39.999 / 69.500 IDR
65.000 / 91.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 49.999 / 69.500 IDR
71.000 / 100.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 54.999 / 79.500 IDR
91.000 / 105.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 70.999 / 89.500 IDR
100.000 / 120.000 IDR <a:PinkRightArrowBounce:1444894009435881524> 79.999 / 107.500 IDR

<a:PinkExclaimBounce:1444893885246734358> **NOTE :**
➺ Legally Paid
➺ Ultra High Quality (UHQ)
➺ Fast Process
➺ Need Email, Pass & Backup Code
➺ Via Login`
                )
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        } else if (selected === "server_boost") {
            priceEmbed = new EmbedBuilder()
                .setTitle("<a:Nitro:1446372229683216576> Boost Server & Server Tag — Pricelist")
                .setColor(0xD5B4FF)
                .setDescription(
`**14x Server Boost 1 Month (24–30 Day) — 130K**  
**14x Server Boost 3 Month (80–90 Day) — 250K**

**OPEN SERVER TAG**  
**3x Server Boost 1 Month (24–30 Day) — 40K**  
**3x Server Boost 3 Month (80–90 Day) — 50K**  

**NOTE :**
➺ proses manual  
➺ no rush order  
➺ off anti raid  
➺ off community features  
➺ full warranty kecuali acc di kick / kena revoke wave

_> Bisa request sekalian setting tampilan server, cukup tulis di ticket._`
                )
                .setFooter({ text: `Dipilih oleh ${interaction.user.username}` })
                .setTimestamp();
        }

        return interaction.editReply({ embeds: [priceEmbed] });
    }

    // ================== BUTTON INTERACTION (TICKET) ================== //
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const user  = interaction.user;

    // ---------- STEP 1: MINTA KONFIRMASI CLOSE ---------- //
    if (interaction.customId === "close_ticket") {
        const thread = interaction.channel;

        if (
            !thread ||
            (thread.type !== ChannelType.PublicThread &&
             thread.type !== ChannelType.PrivateThread)
        ) {
            return interaction.reply({
                content: "Perintah ini hanya bisa dipakai di dalam ticket thread ✨",
                flags: MessageFlags.Ephemeral
            });
        }

        const row = new ActionRowBuilder().addComponents(
            new ButtonBuilder()
                .setCustomId("confirm_close_ticket")
                .setLabel("Ya, tutup ticket")
                .setStyle(ButtonStyle.Danger)
                .setEmoji("🔒"),
            new ButtonBuilder()
                .setCustomId("cancel_close_ticket")
                .setLabel("Batal")
                .setStyle(ButtonStyle.Secondary)
                .setEmoji("❌")
        );

        return interaction.reply({
            content: "Yakin mau menutup ticket ini? Setelah ditutup, chat akan diarsip dan dibuat transcript-nya 💗",
            components: [row],
            flags: MessageFlags.Ephemeral
        });
    }

    // ---------- BATAL CLOSE ---------- //
    if (interaction.customId === "cancel_close_ticket") {
        return interaction.reply({
            content: "Penutupan ticket dibatalkan ✨",
            flags: MessageFlags.Ephemeral
        });
    }

    // ---------- STEP 2: CONFIRM & GENERATE TRANSCRIPT ---------- //
    if (interaction.customId === "confirm_close_ticket") {
        const thread = interaction.channel;

        if (
            !thread ||
            (thread.type !== ChannelType.PublicThread &&
             thread.type !== ChannelType.PrivateThread)
        ) {
            return interaction.reply({
                content: "Perintah ini hanya bisa dipakai di dalam ticket thread ✨",
                flags: MessageFlags.Ephemeral
            });
        }

        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        try {
            const msgs = await thread.messages.fetch({ limit: 100 });
            const sorted = Array.from(msgs.values()).sort(
                (a, b) => a.createdTimestamp - b.createdTimestamp
            );

            // cari message "Ticket Created" dari bot
            const ticketOpenMsg =
                sorted.find(
                    (m) =>
                        m.author.id === client.user.id &&
                        m.embeds.length &&
                        m.embeds[0].title === "🎟️ Ticket Created"
                ) || sorted[0];

            let ticketOwnerMember = null;
            let openedByUser = ticketOpenMsg.author;
            let openedAt = ticketOpenMsg.createdTimestamp;

            // ambil user yang di-mention di content (pemilik ticket)
            if (ticketOpenMsg && ticketOpenMsg.content) {
                const match = ticketOpenMsg.content.match(/<@(\d+)>/);
                if (match) {
                    const mem = await thread.guild.members
                        .fetch(match[1])
                        .catch(() => null);
                    if (mem) {
                        ticketOwnerMember = mem;
                        openedByUser = mem.user;
                    }
                }
            }

            const closedAt = Date.now();

            // ambil ticket type dari field embed
            let ticketTypeRaw = thread.name;
            const firstEmbed = ticketOpenMsg.embeds[0];
            const typeField = firstEmbed?.fields?.find(
                (f) => f.name === "Ticket Type"
            );
            if (typeField && typeField.value) {
                ticketTypeRaw = typeField.value.replace(/`/g, "");
            }

            const ticketType = TICKET_TYPE_MAP[ticketTypeRaw] || ticketTypeRaw;

            // ========== BUAT TRANSCRIPT TEXT ========== //
            let txt =
`Ticket Transcript — ${thread.name}
Ticket ID: ${thread.id}
Opened By: ${openedByUser.tag} (${openedByUser.id})
Opened At: ${formatTime(openedAt)}
Closed By: ${user.tag} (${user.id})
Closed At: ${formatTime(closedAt)}

`;

            for (const m of sorted) {
                const time = formatTime(m.createdTimestamp);
                const content = m.content || "[embed/attachment]";
                txt += `[${time}] ${m.author.tag}: ${content}\n`;
            }

            const buffer = Buffer.from(txt, "utf8");
            const file = new AttachmentBuilder(buffer, {
                name: `ticket-${thread.id}.txt`
            });

            // ========== EMBED RECAP (KAYA SS) ========== //
            const recapEmbed = new EmbedBuilder()
                .setColor(0xFFB6D5)
                .setTitle("🌸 Ticket Closed")
                .setDescription("Ticket kamu sudah ditutup & transcript berhasil dibuat 💗")
                .addFields(
                    {
                        name: "1️⃣2️⃣3️⃣4️⃣ Ticket ID",
                        value: thread.id,
                        inline: false
                    },
                    {
                        name: "🎂 Opened By",
                        value: `<@${openedByUser.id}>`,
                        inline: true
                    },
                    {
                        name: "💕 Closed By",
                        value: `<@${user.id}>`,
                        inline: true
                    },
                    {
                        name: "🕒 Open Time",
                        value: formatTime(openedAt),
                        inline: true
                    },
                    {
                        name: "🌙 Closed Time",
                        value: formatTime(closedAt),
                        inline: true
                    },
                    {
                        name: "📦 Ticket Type",
                        value: ticketType,
                        inline: false
                    }
                )
                .setFooter({ text: "Cyizzie Shop ♡" })
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("🔗 View Thread")
                    .setURL(`https://discord.com/channels/${guild.id}/${thread.id}`)
            );

            // DM ke pemilik ticket (kalau bukan bot)
            if (ticketOwnerMember && !ticketOwnerMember.user.bot) {
                await ticketOwnerMember.send({
                    content: "Haiii 💗 ini recap ticket kamu yaa ✨",
                    embeds: [recapEmbed],
                    files: [file],
                    components: [row]
                }).catch(() => {});
            }

            // DM ke yang menutup ticket
            await user.send({
                content: "Haiii 💗 ini recap ticket yang barusan kamu tutup yaa ✨",
                embeds: [recapEmbed],
                files: [file],
                components: [row]
            }).catch(() => {});

            // kirim recap di dalam ticket thread juga
            await thread.send({
                embeds: [recapEmbed],
                files: [file],
                components: [row]
            });

            await interaction.editReply({
                content: "Ticket ditutup & transcript sudah dibuat, cek DM kamu ya 💗"
            });

            // arsip & lock
            await thread.setArchived(true).catch(() => {});
            await thread.setLocked(true).catch(() => {});

        } catch (err) {
            console.error("Error saat close ticket:", err);
            if (interaction.deferred) {
                await interaction.editReply({
                    content: "Ada error saat menutup ticket, coba lagi ya 💗"
                }).catch(() => {});
            }
        }

        return;
    }

    // =============== CREATE TICKET =============== //
    const validTicketIds = Object.keys(TICKET_TYPE_MAP); // ['buy','ask','custom','warranty']

    if (!validTicketIds.includes(interaction.customId)) return;

    const ticketBase = guild.channels.cache.get(TICKET_BASE_CHANNEL);
    if (!ticketBase) {
        return interaction.reply({
            content: "Channel ticket base tidak ditemukan, cek ID!",
            flags: MessageFlags.Ephemeral
        });
    }

    const ticketName = `ticket-${user.username}`;
    const existing = ticketBase.threads.cache.find(
        t => t.name === ticketName && !t.archived
    );
    if (existing) {
        return interaction.reply({
            content: "kamu sudah punya ticket aktif ✨",
            flags: MessageFlags.Ephemeral
        });
    }

    const thread = await ticketBase.threads.create({
        name: ticketName,
        autoArchiveDuration: 1440,
        reason: "Ticket created"
    });

    await thread.members.add(user.id).catch(() => {});

    await interaction.reply({
        content: `Ticket berhasil dibuat → <#${thread.id}>`,
        flags: MessageFlags.Ephemeral
    });

    const openEmbed = new EmbedBuilder()
        .setTitle("🎟️ Ticket Created")
        .setDescription(`Hai <@${user.id}>! Makasii sudah buka ticket ✨\nAdmin segera respon yaa 💗`)
        .addFields({ name: "Ticket Type", value: `\`${interaction.customId}\`` })
        .setColor("#FF91C9")
        .setTimestamp();

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

    // Hapus system message "started a thread" di channel ticket base
    setTimeout(async () => {
        try {
            const msgs = await ticketBase.messages.fetch({ limit: 5 });
            msgs
                .filter(m => m.type === 21 || m.type === 18)
                .forEach(m => m.delete().catch(() => {}));
        } catch (e) {
            console.error("Gagal hapus system message thread:", e);
        }
    }, 500);
});

// ================== LOGIN ================== //
client.login(process.env.DISCORD_TOKEN);
