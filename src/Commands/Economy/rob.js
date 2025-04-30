const ms = require("ms");

module.exports = {
    name: "rob",
    aliases: ["steal"],
    category: "economy",
    exp: 1,
    cool: 10, // Cooldown in seconds
    react: "💰",
    usage: ":rob @user",
    description: "Attempt to rob another player. But beware, they might have defenses!",

    async execute(client, arg, M) {
        try {
            const target = M.mentions[0] || (M.quoted && M.quoted.participant);
            // Ensure a target is mentioned
            if (!target) {
                return M.reply("Please mention a user to rob! 🕵️‍♂️");
            }

            const robberId = M.sender;
            const victimId = target;

            // Fetch economy data for both users
            let robber = await client.econ.findOne({ userId: robberId }) || new client.econ({ userId: robberId, coin: 100, pepperspray: 0 });
            let victim = await client.econ.findOne({ userId: victimId }) || new client.econ({ userId: victimId, coin: 100, pepperspray: 0 });

            if (robberId === victimId) {
                return M.reply("You cannot rob yourself! 🤡");
            }

            // Check if the victim has at least one pepper spray
            if (victim.peppersprays && victim.peppersprays > 0) {
                victim.peppersprays -= 1; // Deduct one pepper spray
                await victim.save();
                return M.reply(`🚨 ${M.pushName} attempted to rob ${M.mentions[0]}, but got sprayed with pepper spray! 😵 The robbery failed.`);
            }

            // Ensure the victim has enough coins
            if (victim.coin < 50) {
                return M.reply("This person is broke! Nothing to steal. 🥲");
            }

            // Random success or failure
            const successRate = Math.random(); // Generates a value between 0 and 1

            if (successRate < 0.5) { // 50% success rate
                // Robbery Failed: Loses 10-25% of own money
                const lossAmount = Math.floor(robber.coin * (Math.random() * (0.25 - 0.1) + 0.1));
                
                lossAmount = Math.min(stealAmount, 5000);

                robber.coin = Math.max(0, robber.coin - lossAmount);

                await robber.save();

                return M.reply(`❌ You failed to rob ${M.mentionedJid[0]} and lost **${lossAmount}** coins in the process!`);
            }

            // Successful robbery: Steal 20-50% of victim's money, but cap it at 5000 coins
            let stealAmount = Math.floor(victim.coin * (Math.random() * (0.5 - 0.2) + 0.2));
            
            // Cap the amount stolen at 5000 coins
            stealAmount = Math.min(stealAmount, 5000);

            victim.coin = Math.max(0, victim.coin - stealAmount);
            robber.coin += stealAmount;

            // 5% chance of getting caught and losing stolen money
            if (Math.random() < 0.05) {
                robber.coin -= stealAmount;
                await Promise.all([victim.save(), robber.save()]);
                return M.reply(`🚔 Oh no! ${M.pushName} got caught by the police while robbing and lost all stolen money! 🚨`);
            }

            await Promise.all([victim.save(), robber.save()]);

            return M.reply(`💰 Success! ${M.pushName} successfully robbed **${stealAmount}** coins from ${M.mentions[0]}!`);
        } catch (error) {
            console.error("Error in rob command:", error);
            M.reply("An error occurred while processing the robbery attempt.");
        }
    }
};
