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

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildMembers
    ]
});

client.on("error", console.error);
process.on("unhandledRejection", console.error);

const WELCOME_CHANNEL_ID   = "862261084697264149";
const AUTO_ROLE_ID         = "894948896248320003";
const ANNOUNCE_CHANNEL_ID  = "1437112719412039771";
const TICKET_BASE_CHANNEL  = "1443163855042641921";
const STAFF_ROLE_ID        = "902169418962985010";

const formatTime = (d) => {
    const dt = new Date(d);
    return dt.toLocaleString("id-ID")
};
