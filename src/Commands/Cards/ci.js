module.exports = {
    name: "cardinfo",
    aliases: ["ci"],
    exp: 1,
    cool: 5,
    react: "✅",
    category: "cards",
    usage: 'Use: :cardinfo <cardName>|<tier>',
    description: "🔍 Search for a card by name and tier in the Aurora database to view its details and know how many copies exist.",
    async execute(client, arg, M) {
        // Split the argument into card name and tier
        const [cardName, cardTier] = arg.trim().split('|').map(part => part.trim());

        if (!cardName || !cardTier) {
            return void M.reply("❗️ Please provide both a card name and a tier, e.g., `:cardinfo cardname|tier`.");
        }

        try {
            // Fetch all users' card data
            const users = await client.card.all();

            // Initialize variables to store owners and total copies
            let totalOwners = 0;
            let totalCopies = 0;

            // Filter users who have the specified card in their deck or collection
            const usersWithCard = users.filter(user => {
                const { _Deck = [], _Collection = [] } = user.value || {};

                const deckMatches = _Deck.filter(card => card.name && card.name.toLowerCase() === cardName.toLowerCase() && card.tier === cardTier);
                const collectionMatches = _Collection.filter(card => card.name && card.name.toLowerCase() === cardName.toLowerCase() && card.tier === cardTier);

                // Count total copies
                totalCopies += deckMatches.length + collectionMatches.length;

                // Check if the user has at least one matching card
                return deckMatches.length > 0 || collectionMatches.length > 0;
            });

            totalOwners = usersWithCard.length;

            if (totalOwners === 0) {
                return M.reply(`❗️ No users have the card "${cardName} | ${cardTier}".`);
            }

            let cardInfoMessage = `📑 *Card Info for* "${cardName} | ${cardTier.toUpperCase()}"\n\n🔢 *Total Owners:* ${totalOwners}\n🗂 *Total Copies:* ${totalCopies}\n`;

            // Get the image URL of the first matching card for the reply
            const { _Deck = [], _Collection = [] } = usersWithCard[0].value || {};
            const firstCard = _Deck.find(card => card.name && card.name.toLowerCase() === cardName.toLowerCase() && card.tier === cardTier) ||
                              _Collection.find(card => card.name && card.name.toLowerCase() === cardName.toLowerCase() && card.tier === cardTier);

            if (!firstCard) {
                return M.reply(`❗️ No users have the card "${cardName} | ${cardTier}".`);
            }

            // Add card info to the message
            cardInfoMessage += `\n#️⃣ *Name:* ${firstCard.name}\n🌟 *Tier:* ${firstCard.tier}\n🔖 *Source:* ${firstCard.source}\n🆔 *ID:* ${firstCard.id || 'N/A'}\n`;

            const isTier6orS = firstCard.tier === "6" || firstCard.tier.toUpperCase() === "S";
            const imageUrl = firstCard.image;

            const imageBuffer = await client.utils.getBuffer(imageUrl);

            if (isTier6orS && imageUrl.endsWith('.gif')) {
                const giffed = await client.utils.gifToMp4(imageBuffer);
                await client.sendMessage(M.from, {
                    video: giffed,
                    gifPlayback: true,
                    caption: cardInfoMessage,
                    quoted: M
                });
            } else {
                await client.sendMessage(M.from, {
                    image: imageBuffer,
                    caption: cardInfoMessage,
                    quoted: M
                });
            }
        } catch (error) {
            console.error('Error fetching card info or image:', error);
            return void M.reply(`❗️ An error occurred while fetching the card information for "${cardName} | ${cardTier}".`);
        }
    }
};
