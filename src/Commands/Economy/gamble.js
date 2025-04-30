const { Sticker } = require('wa-sticker-formatter');

module.exports = {
    name: 'gamble',
    aliases: ['gb'],
    category: 'economy',
    exp: 1,
    cool: 15,
    react: "✅",
    usage: 'Use :gamble <amount> <direction>',
    description: 'Gamble your wallet to increase or decrease it',
    async execute(client, arg, M) {
        const args = arg.split(' ');
        const userId = M.sender;
        const economy = await client.econ.findOne({ userId });

        if (!economy) {
            return M.reply(`💼 *You need to set up your economy first.*`);
        }

        let wallet = economy.coin || 0;

        if (!args[0] || !args[1]) {
            return M.reply(`❌ Usage: *${client.prefix}gamble <right/left> <amount>*`);
        }

        const direction = isDirection(args[0]) ? args[0] : isDirection(args[1]) ? args[1] : null;
        const amountArg = !isNaN(args[1]) ? args[1] : !isNaN(args[0]) ? args[0] : null;

        if (!direction || !amountArg) {
            return M.reply(`❌ Usage: *${client.prefix}gamble <right/left> <amount>*`);
        }

        let amount = Math.abs(parseInt(amountArg)) || 0;
        if (isNaN(amount)) return M.reply("❌ That's not a valid number.");
        if (amount < 100) return M.reply('🟨 The minimum amount for gambling is *100*');
        if (amount > 10000) return M.reply('🟨 The maximum amount for gambling is *10000*');
        if (wallet < amount) return M.reply(`🟨 You don’t have enough coins!`);

        // Determine win or loss
        const roll = Math.floor(Math.random() * 2) + 1;
        const win = (roll === 1 && direction === 'right') || (roll === 2 && direction === 'left');
        let resultText = `📉 You lost *${amount}* coins.`;
        const jackpot = Math.floor(Math.random() * 500) === 250; // 1/500 chance for a jackpot

        if (win) {
            const winnings = jackpot ? amount * 10 : amount;
            economy.coin += winnings;
            resultText = `${jackpot ? '🍀 *Jackpot!*' : '🎊 *Congratulations!*'} You won *${winnings}* coins!`;
        } else {
            economy.coin -= amount;
        }

        // Save economy state
        await economy.save();

        // Sticker URL based on result
        const stickerUrl = win
            ? 'https://i.ibb.co/SrtvnFH/ezgif-com-rotate.gif'
            : 'https://raw.githubusercontent.com/Dkhitman3/Hitman47/master/assets/gifs/left.gif';

        try {
            const sticker = new Sticker(stickerUrl, {
                pack: 'AURORA', // Pack name
                author: 'CASINO', // Author name
                quality: 90,
                type: 'full', // Sticker quality
                background: '#0000ffff' // Transparent background
            });

            await client.sendMessage(
                M.from,
                { sticker: await sticker.build() },
                { quoted: M }
            );
        } catch (error) {
            console.error("Error creating sticker:", error);
            await M.reply('🟥 *An error occurred while creating the sticker.*');
        }

        // Send result message
        await M.reply(resultText);
    }
};

function isDirection(str) {
    return ['left', 'right'].includes(str.toLowerCase());
}
