const ms = require('parse-ms');

module.exports = {
    name: 'bonus',
    aliases: ['bonus'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :bonus',
    description: 'Claims your bonus',
    async execute(client, arg, M) {
        try {
            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });
            const bonusTimeout = 31536000000; // 1 year in milliseconds
            const bonusAmount = 30000;
            let text = '';

            if (economy && economy.lastBonuss !== null && bonusTimeout - (Date.now() - economy.lastBonuss) > 0) {
                const bonusTime = ms(bonusTimeout - (Date.now() - economy.lastBonuss));
                text += `*You have already claimed your bonus reward. You cannot claim it again.*`;
            } else {
                text += `*Welcome to our Aurora family! We are really happy to have you as our member. You have claimed your bonus reward 🎉: ${bonusAmount} coins.*`;
                

                if (!economy) {
                    const newEconomy = new client.econ({
                        userId,
                        coin: bonusAmount,
                        treasurys: 0,
                        luckpotions: 0,
                        peppersprays: 0,
                        lastBonuss: Date.now(),
                        lastDailys: null,
                        lastRobs: null,
                    });
                    await newEconomy.save();
                } else {
                    economy.coin += bonusAmount;
                    economy.lastBonuss = Date.now();
                    await economy.save();
                }
            }

            await client.sendMessage(
                M.from,
                {
                   text: text
                },
                {
                    quoted: M
                }
            );
        } catch (err) {
            console.error('Error processing bonus command:', err);
            await M.reply('An error occurred while claiming your bonus. Please try again later.');
        }
    }
};
