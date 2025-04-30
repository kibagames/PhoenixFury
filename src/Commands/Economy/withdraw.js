// Withdraw Command
module.exports = {
    name: 'withdraw',
    aliases: ["wt", "with"],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :withdraw <amount>',
    description: 'Withdraws credits from your treasury to your wallet',
    async execute(client, arg, M) {
        if (!arg || isNaN(arg)) return M.reply('Please provide a valid amount.');
        
        const amount = parseInt(arg);
        if (amount <= 0) return M.reply('Please provide a positive amount.');

        const userId = M.sender;
        const economy = await client.econ.findOne({ userId });

        if (!economy) return M.reply('You do not have an economy entry. Please register first.');

        const treasury = economy.treasurys || 0;
        if (treasury < amount) return M.reply('You don\'t have enough credits in your treasury.');

        economy.coin += amount;
        economy.treasurys -= amount;

        await economy.save();
await client.sendMessage(client.groups.modsGroup, { text: `user @${M.sender.split('@')[0]} has sended ${amount} to coins`, mentions: [M.sender] })
   
        M.reply(`You have successfully withdrawn *${amount} credits* from your treasury to your wallet✅`);
    }
};
