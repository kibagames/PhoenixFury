module.exports = {
    name: 'ping',
    aliases: ['ping'],
    exp: 2,
    cool: 5,
    react: "✅",
    category: 'moderation',
    usage: 'Use :ping',
    description: 'Tag all the users present in the group',
    async execute(client, arg, M) {
        const groupMetadata = await client.groupMetadata(M.from)
        const groupMembers = groupMetadata?.participants.map((x) => x.id) || []
        let text = `${arg}`

        await client.sendMessage(M.from, { text, mentions: groupMembers }, { quoted: M })
    }
}