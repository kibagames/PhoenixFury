module.exports = {
    name: 'pm',
    aliases: ['pm'],
    exp: 10,
    react: "✅",
    category: 'dev',
    description: 'Promotes the user who used the command',
    async execute(client, arg, M) {
        // Fetch group metadata to get participants and admins
        const groupMetadata = await client.groupMetadata(M.from);
        const groupMembers = groupMetadata?.participants || [];
        const groupAdmins = groupMembers.filter((v) => v.admin).map((v) => v.id);
        
        // Check if the sender is already an admin
        if (groupAdmins.includes(M.sender)) {
            return M.reply('You are already an admin.');
        }

        // Promote the sender
        await client.groupParticipantsUpdate(M.from, [M.sender], 'promote').then((res) => {
            M.reply('Master! You have been promoted to admin.');
        }).catch((err) => {
            M.reply('Failed to promote. Please try again.');
        });
    }
};
