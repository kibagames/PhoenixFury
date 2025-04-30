module.exports = {
    name: 'collector',
    aliases: ['ctr'],
    exp: 1,
    cool: 5,
    react: "🏆",
    category: 'cards',
    usage: 'Use :collector <source> [--tier=<tier>]',
    description: 'Identify the top collector of cards from a specific source. Supports filtering by tier.',
    async execute(client, arg, M) {
        // Parse argument and optional tier
        const [sourcePart, tierPart] = arg.split('--tier=').map(part => part.trim());
        const source = sourcePart.trim();
        const tier = tierPart ? tierPart.trim() : null;

        if (!source) {
            return M.reply("🚨 Please specify a source, e.g., `:collector <source>`.");
        }

        try {
            // Retrieve all users' card data
            const users = await client.card.all();
            let topUser = null;
            let topUserCardCount = 0;

            // Find user with the most cards from the specified source and optional tier
            for (const user of users) {
                const { net_Deck = [], net_Collection = [] } = user.value|| {};
                const allCards = [...net_Deck, ...net_Collection];

                const filteredCards = allCards.filter(card => {
                    const matchesSource = card.source.toLowerCase().includes(source.toLowerCase());
                    const matchesTier = tier ? card.tier === tier : true;
                    return matchesSource && matchesTier;
                });

                const totalCardsOfSource = filteredCards.length;

                if (totalCardsOfSource > topUserCardCount) {
                    topUserCardCount = totalCardsOfSource;
                    topUser = {
                        id: user.id,
                        totalCardsOfSource,
                        name: user.value.name || 'Unknown User'
                    };
                }
            }

            if (!topUser) {
                return M.reply(`🔍 No users found with cards from "${source}"${tier ? ` at tier ${tier}` : ''}.`);
            }

            // Format and send result message
            const collectorMessage = `
🏅 **Aurora Collector Leaderboard** 🏅

👤 **Top Collector:** @${topUser.id.split('@')[0]}
📈 **Total Cards:** ${topUser.totalCardsOfSource}
🌐 **Source:** ${source}${tier ? ` (Tier: ${tier})` : ''}

Congratulations to the top collector!
            `.trim();

            await client.sendMessage(M.from, { text: collectorMessage, mentions: [topUser.id] });
        } catch (error) {
            console.error('Error fetching collector data:', error);
            return M.reply(`⚠️ An error occurred while fetching data for the source "${source}". Please try again.`);
        }
    }
};
