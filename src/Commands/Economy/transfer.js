module.exports = {
    name: 'transfer',
    aliases: ['give', 'pay'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :transfer <amount> @taguser',
    description: 'Transfer credits to your friend',
    async execute(client, arg, M) {
        const args = arg.split(' ');
        const amount = parseInt(args[0]);
        const recipient = M.mentions[0] || (M.quoted && M.quoted.participant);

        // Validate input
        if (!recipient || recipient === M.sender) {
            return M.reply('You must mention someone to transfer credits to.');
        }
        if (isNaN(amount) || amount <= 0) {
            return M.reply('Please provide a valid positive amount.');
        }

        const userId = M.sender;

        // Check sender's economy
        const senderEconomy = await client.econ.findOne({ userId });
        if (!senderEconomy || senderEconomy.coin < amount) {
            return M.reply('You don\'t have enough credits in your wallet.');
        }

        // Check or create recipient economy
        const recipientEconomy = await client.econ.findOne({ userId: recipient });
        if (!recipientEconomy) {
            await client.econ.create({ userId: recipient, coin: amount });
        } else {
            recipientEconomy.coin += amount;
            await recipientEconomy.save();
        }

        // Deduct from sender and save
        senderEconomy.coin -= amount;
        await senderEconomy.save();

        // Notify users
        const senderName = M.sender.split('@')[0];
        const recipientName = recipient.split('@')[0];
        const message = `You transferred *${amount}* coins to *@${recipientName}*`;
        const adminMessage = `@${senderName} transferred ${amount} coins to @${recipientName}`;

        await client.sendMessage(M.from, { text: message, mentions: [recipient] });
        await client.sendMessage(client.groups.adminsGroup, { text: adminMessage, mentions: [M.sender, recipient] });
    }
};
