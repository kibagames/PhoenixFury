module.exports = {
    name: 'broadcast',
    aliases: ['bc'],
    category: 'dev',
    exp: 0,
    cool: 4,
    react: "✅",
    description: 'Will make a broadcast for groups where the bot is in. Can be used to make announcements.',
    async execute(client, arg, M) {
        try {
            if (!arg) return M.reply('🟥 *No query provided!*');

            let results = await client.getAllGroups(); // Get all groups the bot is in

            for (const result of results) {
                const text = `*「 ${client.name.toUpperCase()} BROADCAST 」*\n\n${arg}`;
                await client.sendMessage(result, {
                    text,
                    mentions: (await client.groupMetadata(result)).participants.map((x) => ({ "id": x.id, "tag": 1 }))
                });
            }

            const successMessage = `🟩 Successfully Broadcast in ${results.length} groups`;
            M.reply(successMessage);
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, {
                image: { url: `${client.utils.errorChan()}` },
                caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}`
            });
        }
    }
}
