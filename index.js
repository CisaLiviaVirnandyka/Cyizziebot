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
    AttachmentBuilder,
    StringSelectMenuBuilder
} = require("discord.js");
const axios = require("axios");

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
const WELCOME_CHANNEL_ID   = "862261084697264149";
const AUTO_ROLE_ID         = "894948896248320003";
const ANNOUNCE_CHANNEL_ID  = "1437112719412039771";
const TICKET_CATEGORY_ID   = "1443163855042641921";
const TICKET_BASE_CHANNEL  = "1443163855042641921";
const STAFF_ROLE_ID        = "902169418962985010";

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

    // ================== FORM APLIKASI / PREMIUM APPS ================== //
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
            .setColor("#FFC0DC");

        const buttons = new ActionRowBuilder().addComponents(
            new ButtonBuilder().setCustomId("buy").setLabel("Buy Product").setStyle(ButtonStyle.Primary).setEmoji("🛒"),
            new ButtonBuilder().setCustomId("ask").setLabel("Ask").setStyle(ButtonStyle.Success).setEmoji("❓"),
            new ButtonBuilder().setCustomId("custom").setLabel("Custom Req").setStyle(ButtonStyle.Secondary).setEmoji("📦")
        );

        return message.channel.send({ embeds: [ticketEmbed], components: [buttons] });
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
            .setTimestamp();

        await channel.send({ content: "@everyone **SHOP IS CLOSED**", embeds: [closeEmbed] });
        return;
    }

    // ================== STAFF TOOLS (HANYA DI TICKET THREAD) ================== //
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
<a:PinkRightArrowBounce:1444894009435881524> Testi **wajib pakai screenshot** product dan word (nama produk + review) 
<a:PinkRightArrowBounce:1444894009435881524> Leave server = **garansi void / hangus**
`)
            .setTimestamp();

        return message.channel.send({ embeds: [embed] });
    }
});

// ================== INTERACTION HANDLER — PREMIUM APPS + TICKET ================== //
client.on(Events.InteractionCreate, async (interaction) => {

    // ================== SELECT MENU PREMIUM APPS ================== //
    if (interaction.isStringSelectMenu() && interaction.customId === "premium_app_select") {

        const selected = interaction.values[0];
        let appEmbed;
        
        // ========== NETFLIX ==========
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


        // ========== CRUNCHYROLL ==========
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

        // ========== CAPCUT ==========
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

        // ========== APPLE MUSIC ==========
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

        // ========== WATTPAD ==========
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

        // ========== YOUTUBE ==========
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

        // ========== CANVA ==========
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


        // ========== SPOTIFY ==========
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

        return interaction.reply({ embeds: [appEmbed], ephemeral: true });
    }

    // ================== BUTTON INTERACTION (TICKET) ================== //
    if (!interaction.isButton()) return;

    const guild = interaction.guild;
    const user  = interaction.user;

    // =============== CLOSE TICKET =============== //
    if (interaction.customId === "close_ticket") {
        const thread = interaction.channel;

        if (
            !thread ||
            (thread.type !== ChannelType.PublicThread &&
             thread.type !== ChannelType.PrivateThread)
        ) {
            return interaction.reply({
                content: "Perintah ini hanya bisa dipakai di dalam ticket thread ✨",
                ephemeral: true
            });
        }

        await interaction.deferReply({ ephemeral: true });

        try {
            const msgs = await thread.messages.fetch({ limit: 100 });
            const sorted = Array.from(msgs.values()).sort(
                (a, b) => a.createdTimestamp - b.createdTimestamp
            );

            const openedMsg = sorted[0];
            let openedBy = openedMsg?.author;
            let ticketOwnerMember = null;

            if (openedMsg && openedMsg.content) {
                const match = openedMsg.content.match(/<@(\d+)>/);
                if (match) {
                    ticketOwnerMember = await thread.guild.members
                        .fetch(match[1])
                        .catch(() => null);
                }
            }
            if (ticketOwnerMember) openedBy = ticketOwnerMember.user;

            let txt = `Ticket Transcript — ${thread.name}\n\n`;
            for (const m of sorted) {
                txt += `[${new Date(m.createdTimestamp).toLocaleString()}] ${m.author.tag}: ${m.content}\n`;
            }

            const buffer = Buffer.from(txt, "utf8");
            const file = new AttachmentBuilder(buffer, {
                name: `ticket-${thread.id}.txt`
            });

            const embed = new EmbedBuilder()
                .setColor("#FFB6D5")
                .setTitle("🌸 Ticket Closed")
                .setDescription("Ticket kamu sudah ditutup & transcript berhasil dibuat 💗")
                .addFields(
                    { name: "Opened By", value: `<@${openedBy.id}>` },
                    { name: "Closed By", value: `<@${user.id}>` }
                )
                .setTimestamp();

            const row = new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setStyle(ButtonStyle.Link)
                    .setLabel("🔗 View Thread")
                    .setURL(`https://discord.com/channels/${guild.id}/${thread.id}`)
            );

            if (ticketOwnerMember && !ticketOwnerMember.user.bot) {
                await ticketOwnerMember.send({
                    content: "Haiii 💗 ini recap ticket kamu yaa ✨",
                    embeds: [embed],
                    files: [file],
                    components: [row]
                }).catch(() => {});
            }

            await user.send({
                content: "Haiii 💗 ini recap ticket kamu yaa ✨",
                embeds: [embed],
                files: [file],
                components: [row]
            }).catch(() => {});

            await interaction.editReply({
                content: "Ticket ditutup & transcript sudah dikirim ke DM kamu 💗"
            });

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
    if (!["buy", "ask", "custom"].includes(interaction.customId)) return;

    const ticketBase = guild.channels.cache.get(TICKET_BASE_CHANNEL);
    if (!ticketBase) {
        return interaction.reply({
            content: "Channel ticket base tidak ditemukan, cek ID!",
            ephemeral: true
        });
    }

    const ticketName = `ticket-${user.username}`;
    const existing = ticketBase.threads.cache.find(
        t => t.name === ticketName && !t.archived
    );
    if (existing) {
        return interaction.reply({
            content: "kamu sudah punya ticket aktif ✨",
            ephemeral: true
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
