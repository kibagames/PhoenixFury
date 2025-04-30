module.exports = {
    name: "card-give",
    aliases: ["cg"],
    exp: 1,
    cool: 5,
    react: "🎁",
    category: "cards",
    description: "Give a card or all cards from your deck to another user's deck.",
    usage: 'card-give <index/all> <@user>',
    async execute(client, arg, M) {
        const saleData = await client.sellMap.get(M.from);
        if (saleData && saleData.seller === M.from) {
            return M.reply('🚫 You cannot transfer a card while selling.');
        }

        const args = arg.split(' ');
        const sender = M.sender;
        const senderDeck = await client.card.get(`${sender.replace('.whatsapp.net', '')}_Deck`) || [];
        const mentionedUser = M.mentions[0] || (M.quoted && M.quoted.participant);

        if (!mentionedUser) {
            return M.reply("❌ Please mention a user to give the card to!");
        }

        // Ensure the sender is not trying to give cards to themselves
        if (sender === mentionedUser) {
            return M.reply("🚫 You cannot give cards to yourself.");
        }

        const targetDeck = await client.card.get(`${mentionedUser.replace('.whatsapp.net', '')}_Deck`) || [];

        if (senderDeck.length === 0) {
            return M.reply("❌ Your card deck is empty!");
        }

        try {
            if (args[0].toLowerCase() === 'all') {
                // Transfer all cards
                if (targetDeck.length + senderDeck.length > 12) {
                    return M.reply('🚫 The receiver does not have enough space in their deck for all your cards.');
                }

                targetDeck.push(...senderDeck);
                await client.card.set(`${mentionedUser.replace('.whatsapp.net', '')}_Deck`, targetDeck);
                await client.card.set(`${sender.replace('.whatsapp.net', '')}_Deck`, []); // Clear sender's deck

                const text = `✔️ @${sender.split('@')[0]} has transferred all their cards to @${mentionedUser.split('@')[0]}.`;
                await client.sendMessage(M.from, { text, mentions: [sender, mentionedUser] });
                await client.sendMessage(client.groups.adminsGroup, { text: `${text} in ${M.from}`, mentions: [sender, mentionedUser] });
            } else {
                // Transfer a specific card
                const index = parseInt(args[0]);
                if (isNaN(index) || index <= 0 || index > senderDeck.length) {
                    return M.reply("❌ Please provide a valid index of the card you want to give.");
                }

                const card = senderDeck[index - 1];
                if (targetDeck.length >= 12) {
                    return M.reply('🚫 The receiver does not have space in their deck.');
                }

                senderDeck.splice(index - 1, 1); // Remove the card from sender's deck
                targetDeck.push(card); // Add the card to the target user's deck
                await client.card.set(`${sender.replace('.whatsapp.net', '')}_Deck`, senderDeck);
                await client.card.set(`${mentionedUser.replace('.whatsapp.net', '')}_Deck`, targetDeck);

                const text = `✔️ @${sender.split('@')[0]} has transferred *${card.name} - ${card.tier}* to @${mentionedUser.split('@')[0]}.`;
                await client.sendMessage(M.from, { text, mentions: [sender, mentionedUser] });
                await client.sendMessage(client.groups.modsGroup, { text: `${text} in ${M.from}`, mentions: [sender, mentionedUser] });
            }
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, {
                text: "⚠️ An error occurred while processing the card give operation."
            });
        }
    }
};
