const locks = new Set();

module.exports = {
    name: "buycard",
    aliases: ['bcard'],
    exp: 1,
    cool: 4,
    react: "🛒",
    category: "cards",
    usage: 'Use :buycard',
    description: "Purchase a card from an active sale",
    async execute(client, arg, M) {
        const saleKey = M.from;

        if (locks.has(saleKey)) {
            return M.reply("⚠️ Another transaction is in progress. Please wait a moment and try again.");
        }

        locks.add(saleKey);

        try {
            await buyCard(client, M);
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, {
                image: { url: client.utils.errorChan() },
                caption: `❗Oops! Something went wrong.\n\n*Error Details:*\n${err}`,
            });
        } finally {
            locks.delete(saleKey);
        }
    },
};

async function buyCard(client, M) {
    const saleData = await client.sellMap.get(M.from);
    if (!saleData) {
        return M.reply("❌ This sale has either expired or does not exist.");
    }

    const { seller, price, card, index } = saleData;
    const buyer = M.sender;

    const sellerDeck = await client.card.get(`${seller.replace('.whatsapp.net', '')}_Deck`) || [];
    const buyerDeck = await client.card.get(`${buyer.replace('.whatsapp.net', '')}_Deck`) || [];
    const buyerCollection = await client.card.get(`${buyer.replace('.whatsapp.net', '')}_Collection`) || [];

    if (index >= sellerDeck.length) {
        return M.reply("❌ The seller's deck does not contain this card.");
    }

    const buyerEconomy = await client.econ.findOne({ userId: buyer });
    const sellerEconomy = await client.econ.findOne({ userId: seller });

    if (!buyerEconomy || !sellerEconomy) {
        return M.reply("⚠️ Economy data not found for the buyer or seller.");
    }

    if (buyerEconomy.coin < price) {
        return M.reply("⛔ You do not have enough gems to complete this purchase.");
    }

    // Process the transaction
    buyerEconomy.coin -= price;
    sellerEconomy.coin += price;

    // Remove the card from seller's deck
    sellerDeck.splice(index, 1);

    // Add the card to buyer's deck or collection
    if (buyerDeck.length >= 12) {
        buyerCollection.push(card);
        await client.card.set(`${buyer.replace('.whatsapp.net', '')}_Collection`, buyerCollection);
    } else {
        buyerDeck.push(card);
        await client.card.set(`${buyer.replace('.whatsapp.net', '')}_Deck`, buyerDeck);
    }

    // Save changes to economy and decks
    await buyerEconomy.save();
    await sellerEconomy.save();
    await client.card.set(`${seller.replace('.whatsapp.net', '')}_Deck`, sellerDeck);

    await client.sellMap.delete(M.from);
    await client.DB.set(`${seller}_Sell`, false);

    const completionText = `✅ Transaction successful!\n\n@${buyer.split('@')[0]} has paid ${price} gems to @${seller.split('@')[0]} to purchase *${card.name} - ${card.tier}*.`;
    await client.sendMessage(M.from, { text: completionText, mentions: [buyer, seller] });
    await client.sendMessage(client.groups.adminsGroup, { text: completionText, mentions: [buyer, seller] });
}
