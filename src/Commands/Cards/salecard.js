module.exports = {
    name: "sellcard",
    aliases: [''],
    exp: 1,
    cool: 4,
    react: "✅",
    category: 'cards',
    usage: 'sellcard <index>|<price>',
    description: 'Initiates a card sale',
    async execute(client, arg, M) {
        const isAlreadySelling = await client.DB.get(`${M.sender}_Sell`) || false;
        if (isAlreadySelling === true) {
            return M.reply('You are already selling a card in a group!');
        }

        try {
            await initiateSale(client, arg, M);
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, {
                image: { url: client.utils.errorChan() },
                caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}`,
            });
        }
    },
};

async function initiateSale(client, arg, M) {
    const selling = await client.sellMap.get(M.from);
    if (selling && selling.progress === true) return M.reply("Sale is already in progress.");

    const seller = M.sender;
    const splitArgs = arg.split('|');
    if (splitArgs.length !== 2) {
        return M.reply("❌ Please provide both index and price in the format 'index|price'.");
    }

    const cardIndex = parseInt(splitArgs[0]) - 1;
    const price = parseInt(splitArgs[1]);

    if (isNaN(cardIndex) || isNaN(price) || cardIndex < 0 || price <= 0) {
        return M.reply("❌ Please provide a valid index and price.");
    }

    const deck = await client.card.get(`${seller.replace('.whatsapp.net', '')}_Deck`) || [];
    if (deck.length === 0) {
        return M.reply("❗ You do not have any cards in your deck!");
    }

    const card = deck[cardIndex];
    if (!card) {
        return M.reply("❗ The card index you provided is invalid!");
    }

    const tierPriceLimits = {
        1: 150000,
        2: 300000,
        3: 440000,
        4: 500000,
        5: 1000000,
        6: 3000000,
        S: 5000000
    };

    const cardTier = card.tier;
    const maxPrice = tierPriceLimits[cardTier];

    if (price > maxPrice) {
        return M.reply(`❌ The price for a ${cardTier} card should be between 1 and ${maxPrice}.`);
    }

    const cardUrl = card.image;
    const cardName = card.name;
    const isGif = cardUrl.endsWith('.gif');
    const text = `💎 Card on sale 💎\n\n🌊 Name: ${cardName}\n🌟 Tier: ${cardTier}\n📝 Price: ${price}\n♦️ *Source:* ${card.source}\n\n🔰 Use :buycard to purchase`;

    if (isGif) {
    await client.sendMessage(M.from, {
      video: { url: cardUrl },
      caption: text,
      gifPlayback: true
    })
    } else {
        await client.sendMessage(M.from, {
            image: { url: cardUrl },
            caption: text
          }) 
    }

    await client.sellMap.set(M.from, {
        card: { name: card.name, tier: card.tier, id: card.id, source: card.source, image: card.image },
        price,
        seller,
        progress: true,
        index: cardIndex
    });

    await client.DB.set(`${M.sender}_Sell`, true);

    setTimeout(async () => {
        const isStillSelling = await client.DB.get(`${M.sender}_Sell`);
        if (isStillSelling === true) {
            await client.sellMap.delete(M.from);
            await client.DB.set(`${M.sender}_Sell`, false);

            await client.sendMessage(M.from, {
                text: `⚠️ *The card sale for ${card.name} has been canceled due to no purchase within 10 minutes.*`, mentions: [M.sender]
            });
        }
    }, 600000); // 10 minutes
}
