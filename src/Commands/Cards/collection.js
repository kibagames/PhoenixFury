module.exports = {
    name: "collection",
    aliases: ["coll", "collec"],
    exp: 1,
    cool: 5,
    react: "🃏",
    category: "cards",
    usage: 'Use :collection [card number]',
    description: "View your collected cards.",
    async execute(client, arg, M) {
        try {
            const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
            if (collection.length === 0) {
                return M.reply("❌ You currently don't have any cards in your collection.");
            }

            if (!arg) {
                let cardList = `*🃏 Your Card Collection: ♦️* (Total Cards: ${collection.length})\n`; // Added line to show total cards
                collection.forEach((card, index) => {
                    cardList += `${index + 1}) ${card.name} *(Tier: ${card.tier})*\n`;
                });
                return M.reply(cardList);
            } else {
                const index = parseInt(arg) - 1;
                if (isNaN(index) || index < 0 || index >= collection.length) {
                    return M.reply(`❌ Invalid card index! Your collection has ${collection.length} cards.`);
                }

                const card = collection[index];
                let cardInfo = `🃏 *Card Name:* ${card.name}\n🌟 *Tier:* ${card.tier}\n🔖 *Source:* ${card.source}\n🆔 *ID:* ${card.id}`;
                
                const imageUrl = card.image;
                if (imageUrl.endsWith(".gif")) {
                    const gifBuffer = await client.utils.getBuffer(imageUrl);
                    const video = await client.utils.gifToMp4(gifBuffer);
                    return await client.sendMessage(M.from, { video, caption: cardInfo, gifPlayback: true }, { quoted: M });
                } else if (imageUrl) {
                    return await client.sendMessage(M.from, { image: { url: imageUrl }, caption: cardInfo }, { quoted: M });
                } else {
                    return M.reply("⚠️ Error: Unable to find an image for this card.");
                }
            }
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, { text: "⚠️ An error occurred while fetching your card collection." });
        }
    }
};
