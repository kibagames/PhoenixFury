module.exports = {
    name: 'group',
    aliases: ['gc'],
    exp: 2,
    cool: 4,
    react: "✅",
    category: 'moderation',
    usage: 'Use :group close/open/link',
    description: 'used for group related activity',
    async execute(client, arg, M) {
        const group = ['open', 'close', 'link'];
        if (!arg) return M.reply('Sorry, you did not specify any term!');
        if (!group.includes(arg)) return M.reply('Sorry, you did not specify a valid term!');
        
        const groupMetadata = await client.groupMetadata(M.from);
        
        switch (arg) {
            case 'open':
                if (!groupMetadata.announce) return M.reply('The group is already open!');
                await client.groupSettingUpdate(M.from, 'not_announcement');
                return M.reply('Group opened');
            case 'close':
                if (groupMetadata.announce) return M.reply('The group is already closed!');
                await client.groupSettingUpdate(M.from, 'announcement');
                return M.reply('Group closed');
            case 'link':
                const code = await client.groupInviteCode(M.from);   
                return M.reply('https://chat.whatsapp.com/' + code);
        }
    }
}
