module.exports = {
    name: 'delete',
    aliases: ['del'],
    category: 'moderation',
    exp: 2,
    cool: 4,
    react: "✅",
    usage: 'Use :delete quoted to the mesaege you want to delete',
    description: 'Deletes the quoted message',
    async execute(client, arg, M) {
    
        if (!M.quoted) return M.reply('Quote the message that you want me to delete, Baka!')
        try {
            await client.sendMessage(M.from, { delete: M.quoted.key })
            M.reply('Message deleted successfully!')
        } catch (error) {
            console.error('Error deleting message:', error)
            M.reply('Failed to delete message.')
        }
    }
}
