module.exports = {
    name: 'economy',
    aliases: ['totalvalue', 'economyvalue'],
    category: 'economy',
    exp: 1,
    cool: 5,
    react: "✅",
    usage: 'Use :value',
    description: 'Shows the total value of gems and treasury across all users.',
    async execute(client, arg, M) {
        try {
            // Fetch all users from the economy collection
            const allUsers = await client.econ.find({});

            // Initialize total value variable
            let totalValue = 0;

            // Iterate through each user and calculate the total economy value
            allUsers.forEach(user => {
                // Calculate total gems (gems + treasury) for each user
                const userTotalGems = user.coin + user.treasurys;

                // Add user's total gems to the total value
                totalValue += userTotalGems;
            });

            // Function to format numbers as K, M, B, or T
            const formatNumber = (num) => {
                if (num >= 1_000_000_000_000) return (num / 1_000_000_000_000).toFixed(2) + 'T';
                if (num >= 1_000_000_000) return (num / 1_000_000_000).toFixed(2) + 'B';
                if (num >= 1_000_000) return (num / 1_000_000).toFixed(2) + 'M';
                if (num >= 1_000) return (num / 1_000).toFixed(2) + 'K';
                return num;
            };

            // Format the total value
            const formattedTotalValue = formatNumber(totalValue);

            // Display the total value in a formatted message
            const finalMessage = `🌟 *Total Economy Value:* 💰 *${formattedTotalValue} gems* across all users!`;

            await M.reply(finalMessage);
        } catch (error) {
            console.error("Error fetching economy data:", error);
            await M.reply("🟥 *An error occurred while calculating the total economy value.*");
        }
    }
};
