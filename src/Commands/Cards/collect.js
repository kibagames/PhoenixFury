const lock = new Set();

module.exports = {
    name: "collect",
    aliases: ["collect"],
    exp: 1,
    cool: 4,
    react: "✅",
    category: "cards",
    usage: 'Use :collect <captcha>',
    description: "Claim the card that is spawned.",
    async execute(client, arg, M) {
        try {
            const groupMetadata = await client.groupMetadata(M.from);
            if (groupMetadata.announce) {
                return M.reply('🔒 The group is currently closed. You cannot claim any cards now!');
            }


            const cardKey = M.from;
            if (lock.has(cardKey)) {
                return M.reply("🚫 Another user is currently collecting the card. Please wait and try again.");
            }

            lock.add(cardKey);

            const card = await client.cardMap.get(M.from);
            if (!card) {
                return M.reply("🙅‍♀️ Sorry, there are currently no available cards to claim!");
            }

            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });
            const wallet = economy ? economy.coin : 0;

            if (wallet === 0) {
                return M.reply("❌ Your wallet is empty. Please earn some credits before claiming.");
            }

            const cardPrice = card.price;
            if (wallet < cardPrice) {
                return M.reply(
                    `❌ Insufficient funds! You need *${cardPrice} Credits*, but you only have *${wallet} Credits*.`
                );
            }

            // Validate captcha (case-insensitive)
            if (arg.toLowerCase() !== card.captcha.toLowerCase()) {
                return M.reply("❌ Incorrect captcha! Please try again with the correct captcha.");
            }

            // Deduct credits and add the card to the deck or collection
            const { tier, name } = card.card;
            const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];

            if (deck.length < 12) {
                await client.card.push(`${M.sender.replace('.whatsapp.net', '')}_Deck`, card.card);
                await M.reply(
                    `🎉 Congratulations! You have successfully claimed *${name} - ${tier}* for *${cardPrice} Credits*!`
                );
            } else {
                await client.card.push(`${M.sender.replace('.whatsapp.net', '')}_Collection`, card.card);
                await M.reply(
                    `🎉 You have successfully added *${name} - ${tier}* to your collection for *${cardPrice} Credits*!`
                );
            }

            // Notify admins
            await client.sendMessage(client.groups.modsGroup, {
                text: `User @${M.sender.split('@')[0]} has collected *${name} - ${tier}* in ${M.from}`,
                mentions: [M.sender],
            });

            // Update economy
            if (economy) {
                economy.coin = wallet - cardPrice;
                await economy.save();
            }

            // Remove the claimed card from the card map
            await client.cardMap.delete(M.from)
        } catch (error) {
            console.error('Error in collect command:', error);
            await M.reply("❌ An unexpected error occurred while claiming the card. Please try again later.");
        } finally {
            lock.delete(M.from);
        }
    },
};
