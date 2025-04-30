module.exports = {
    name: 'demote',
    aliases: ['dem'],
    exp: 2,
    cool: 4,
    react: "✅",
    category: 'moderation',
    usage: 'Use :demote @tag',
    description: 'Demotes the tagged user',
    async execute(client, arg, M) {

        if (!M.mentions.length) return M.reply('You must tag the user before using!');

        const groupMetadata = await client.groupMetadata(M.from);
        const groupMembers = groupMetadata?.participants || [];
        const groupAdmins = groupMembers.filter((v) => v.isAdmin).map((v) => v.id);

        const usersToDemote = M.mentions.filter((user) => groupAdmins.includes(user));
        if (usersToDemote.length === 0) {
            return M.reply('None of the tagged users are admins.');
        }

        await client.groupParticipantsUpdate(M.from, usersToDemote, 'demote')
            .then(() => {
                M.reply(`Done! Demoted ${usersToDemote.length} user(s).`);
            })
            .catch((err) => {
                console.error(err);
                M.reply('An error occurred while trying to demote the user(s).');
            });
    }
};
