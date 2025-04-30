const { SlotMachine, SlotSymbol } = require('slot-machine');

module.exports = {
    name: 'slot',
    aliases: ['slot'],
    category: 'economy',
    exp: 1,
    cool: 20,
    react: "👍",
    usage: 'Use: :slot <amount>',
    description: 'Slot the given amount of credits in a slot machine',
    async execute(client, arg, M) {
        const symbols = [
            new SlotSymbol('a', { display: '🍉', points: 2, weight: 1 }), // Higher points, very low weight
            new SlotSymbol('b', { display: '🥭', points: 1, weight: 4 }), // Lower points, medium weight
            new SlotSymbol('c', { display: '🍇', points: 0, weight: 10 }), // No points, high weight
            new SlotSymbol('d', { display: '🍓', points: 0, weight: 7 }),  // No points, medium-high weight
        ];

        if (!arg) return M.reply('Please provide the amount.');
        const amount = parseInt(arg);

        if (isNaN(amount) || amount <= 0) return M.reply('Please provide a valid positive amount.');
        if (amount > 15000) return M.reply('You cannot bet more than 15000 credits in the slot machine.');
        if (amount < 500) return M.reply('You cannot bet less than 500 credits in the slot machine.');

        try {
            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });
            if (!economy) return M.reply("Economy data not found.");

            const credits = economy.coin || 0;
            if (amount > credits) return M.reply("You don't have sufficient funds.");

            const machine = new SlotMachine(3, symbols).play();
            const points = machine.lines.reduce((total, line) => total + line.points, 0);

            // Calculate result amount based on points
            let resultAmount = points > 3 ? amount * points / 2 : -amount;

            // Ensure that the win amount is capped at 90,000 credits (excluding jackpots)
            if (resultAmount > 50000) {
                resultAmount = 50000;
            }

            // Apply a very low chance for a jackpot
            const jackpotChance = Math.random() < 0.0005;
            if (jackpotChance) {
                const jackpotWin = 100000;
                economy.coin += jackpotWin;
                await economy.save();
                return M.reply(`🎰 *SLOT MACHINE* 🎰\n🍉🍉🍉\n🍉🍉🍉\n🍉🍉🍉\nCongratulations! You hit the jackpot and won ${jackpotWin} coins! 🎉🎉`);
            }

            resultAmount = Math.round(resultAmount);

            let text = `🎰 *SLOT MACHINE* 🎰\n\n${machine.visualize()}`;

            if (resultAmount < 0) { // User loses
                if (economy.luckpotions > 0 && Math.random() < 0.1) { // 10% chance to use luck potion
                    resultAmount = 0; // Nullify the loss amount
                    economy.luckpotions -= 1;
                    text += '\n\n🍀 You have been saved by your luck potion! No loss this time.';
                } else {
                    economy.coin += resultAmount; // Deduct the loss amount from user's balance
                    text += `\n\n📉 You lost ${resultAmount} coins.`;
                }
            } else { // User wins
                economy.coin += resultAmount;
                text += `\n\n📈 You won ${resultAmount} coins.`;
            }

            // Save user data
            await economy.save();
            M.reply(text);

        } catch (error) {
            console.error(error);
            M.reply("An error occurred while processing your slot request.");
        }
    },
};
