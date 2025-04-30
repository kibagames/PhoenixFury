module.exports = {
    name: 'su',
    aliases: ['setuser'],
    category: 'dev',
    exp: 5,
    cool: 4,
    react: "✅",
    usage: 'Use :setgem <type> <amount> @taguser',
    description: 'Set gem attributes (coins, luckpotions, peppersprays, pokeballs) for a user',
    async execute(client, arg, M) {
        
        const recipient = M.mentions[0] || (M.quoted && M.quoted.participant);

        if (!recipient) return M.reply('You must mention someone to set gem attributes for.');

        const args = arg.split(' ');
        if (args.length < 2) return M.reply('Please provide the type of gem and the amount.');

        const type = args[0];
        const amount = parseInt(args[1]);

        if (isNaN(amount) || amount <= 0) return M.reply('Please provide a valid positive amount.');

        const validTypes = ['coins', 'luckpotions', 'peppersprays', 'pokeballs'];
        if (!validTypes.includes(type)) return M.reply(`Invalid gem type. Valid types are: ${validTypes.join(', ')}`);

        const recipientEconomy = await client.econ.findOne({ userId: recipient });
        if (!recipientEconomy) return M.reply('User not found in the economy database.');

        switch (type) {
            case 'coins':
                recipientEconomy.coin = amount;
                break;
            case 'luckpotions':
                recipientEconomy.luckpotions = amount;
                break;
            case 'peppersprays':
                recipientEconomy.peppersprays = amount;
                break;
            case 'pokeballs':
                recipientEconomy.pokeballs = amount;
                break;
        }

        await recipientEconomy.save();

        const recipientName = recipient.split('@')[0];
        await client.sendMessage(M.from, { text: `${type} has been set to ${amount} for ${recipientName}`, mentions: [recipient] });
    }
};
