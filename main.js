const { Client, GatewayIntentBits } = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildPresences,
    ],
});

const TOKEN = 'MTMwNzcwODcwOTk1MDE5MzY4NA.GV_ohi.igyAv3eimAPAjkDeLwsiqYa8omB1htGCEW0bto';
const VANITY_PATTERNS = [
    'discord.gg/breakthecode',
    '.gg/breakthecode'
].map((pattern) => pattern.toLowerCase());

const ROLE_ID = '1307701848081174588';

client.on('ready', async () => {
    console.log(`Logged in as ${client.user.tag}`);

    setInterval(() => checkAllMembers(client), 5 * 60 * 1000);
});

client.on('presenceUpdate', async (oldPresence, newPresence) => {
    if (!newPresence || !newPresence.member) return;

    await updateMemberRole(newPresence.member, newPresence.activities);
});

async function checkAllMembers(client) {
    for (const guild of client.guilds.cache.values()) {
        const role = guild.roles.cache.get(ROLE_ID);
        if (!role) {
            console.error(`Role not found in guild ${guild.name}`);
            continue;
        }

        for (const member of guild.members.cache.values()) {
            if (member.user.bot) continue; // Skip bots

            const activities = member.presence?.activities || [];
            await updateMemberRole(member, activities);
        }
    }
}

async function updateMemberRole(member, activities) {
    const role = member.guild.roles.cache.get(ROLE_ID);
    if (!role) {
        console.error(`Role not found in guild ${member.guild.name}`);
        return;
    }

    const customStatus = activities.find((activity) => activity.type === 4); // Type 4 = Custom Status
    const customStatusText = customStatus?.state?.toLowerCase() || '';

    const hasVanity = VANITY_PATTERNS.some((pattern) => customStatusText.includes(pattern));

    try {
        if (hasVanity) {
            if (!member.roles.cache.has(ROLE_ID)) {
                await member.roles.add(role);
                console.log(`Role assigned to ${member.user.tag} (Vanity found).`);
            }
        } else {
            if (member.roles.cache.has(ROLE_ID)) {
                await member.roles.remove(role);
                console.log(`Role removed from ${member.user.tag} (Vanity not found).`);
            }
        }
    } catch (err) {
        console.error(`Error managing roles for ${member.user.tag}: ${err}`);
    }
}

client.login(TOKEN)
