module.exports = {
    name: 'info',
    aliases: ['information'],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :info',
    description: 'Get bot information',
    async execute(client, arg, M) {
        const getGroups = await client.groupFetchAllParticipating();
        const groups = Object.entries(getGroups).map((entry) => entry[1]);
        // Count valid groups (excluding announcement and community groups)
        const validGroups = groups.filter(group => {
            const metadata = client.groupMetadata(group.id);
            return !(metadata.isCommunityAnnounce === true || metadata.isCommunity === true);
        });
        const validGroupCount = validGroups.length;

        const pad = (s) => (s < 10 ? '0' : '') + s;
        const formatTime = (seconds) => {
            const hours = Math.floor(seconds / (60 * 60));
            const minutes = Math.floor((seconds % (60 * 60)) / 60);
            const secs = Math.floor(seconds % 60);
            return `${pad(hours)}:${pad(minutes)}:${pad(secs)}`;
        };
        const uptime = formatTime(process.uptime());
        const modCount = client.mods.length;

        let text = `*${process.env.NAME}'s info*\n\n`;
        text += `💠 *Uptime:* ${uptime}\n`;
        text += `💠 *Users:* ${Object.values(await client.contactDB.all()).length}\n`;
        text += `💠 *Commands:* ${client.cmd.size}\n`;
        text += `💠 *Groups:* ${validGroupCount}\n`;
        text += `💠 *Mods:* ${modCount}\n`;

        await client.sendMessage(M.from, {
            text: text
        })
    }
};
