module.exports = {
    name: "discard",
    aliases: ["discard"],
    exp: 1,
    cool: 3,
    react: "❌",
    category: "core",
    usage: "Use :discard <type>|<index> or :discard <type> without an index to discard everything.",
    description: "Discard a card or Pokémon from your collection. If no index is provided, the entire deck/collection will be discarded. **Note: This action is irreversible!**",
    async execute(client, arg, M) {
        try {
            // Ensure the arguments are provided
            if (!arg || arg.trim().length === 0) {
                return M.reply("⚠️ **Please provide the type and index in the format 'type|index' or just 'type' to discard everything.**");
            }

            // Split the argument string by '|'
            const splitArgs = arg.split('|').map(item => item.trim());
            const type = splitArgs[0].toLowerCase();
            const index = splitArgs[1] ? parseInt(splitArgs[1]) : null;

            // Handle discarding from Pokémon Party
            if (type === "party") {
                const party = await client.pkmn.get(`${M.sender}_Party`) || [];
                if (index !== null) {
                    // Validate the index
                    if (isNaN(index) || index <= 0 || index > party.length) {
                        return M.reply("❗ **Invalid index. Index out of range for party.**");
                    }
                    // Remove the Pokémon at the specified index from the party
                    party.splice(index - 1, 1);
                    await client.pkmn.set(`${M.sender}_Party`, party);
                    return M.reply("✅ **Successfully discarded the Pokémon from your party.**");
                } else {
                    // Discard the entire party
                    await client.pkmn.set(`${M.sender}_Party`, []);
                    return M.reply("🚮 **Successfully discarded your entire party.**");
                }

            // Handle discarding from Pokémon Storage System (PSS)
            } else if (type === "pss") {
                const pss = await client.pkmn.get(`${M.sender}_PSS`) || [];
                if (index !== null) {
                    // Validate the index
                    if (isNaN(index) || index <= 0 || index > pss.length) {
                        return M.reply("❗ **Invalid index. Index out of range for Pokémon storage.**");
                    }
                    // Remove the Pokémon at the specified index from the PSS
                    pss.splice(index - 1, 1);
                    await client.pkmn.set(`${M.sender}_PSS`, pss);
                    return M.reply("✅ **Successfully discarded the Pokémon from your storage.**");
                } else {
                    // Discard the entire PSS
                    await client.pkmn.set(`${M.sender}_PSS`, []);
                    return M.reply("🚮 **Successfully discarded your entire Pokémon storage.**");
                }

            // Handle discarding from card collection
            } else if (type === "coll") {
                const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
                if (index !== null) {
                    // Validate the index
                    if (isNaN(index) || index <= 0 || index > collection.length) {
                        return M.reply("❗ **Invalid index. Index out of range for card collection.**");
                    }
                    // Remove the card at the specified index from the collection
                    collection.splice(index - 1, 1);
                    await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Collection`, collection);
                    return M.reply("✅ **Successfully discarded the card from your collection.**");
                } else {
                    // Discard the entire collection
                    await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Collection`, []);
                    return M.reply("🚮 **Successfully discarded your entire card collection.**");
                }

            // Handle discarding from card deck
            } else if (type === "deck") {
                const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
                if (index !== null) {
                    // Validate the index
                    if (isNaN(index) || index <= 0 || index > deck.length) {
                        return M.reply("❗ **Invalid index. Index out of range for deck.**");
                    }
                    // Remove the card at the specified index from the deck
                    deck.splice(index - 1, 1);
                    await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, deck);
                    return M.reply("✅ **Successfully discarded the card from your deck.**");
                } else {
                    // Discard the entire deck
                    await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, []);
                    return M.reply("🚮 **Successfully discarded your entire card deck.**");
                }

            } else {
                return M.reply("❗ **Invalid type. Please specify 'party', 'pss', 'coll', or 'deck'.**");
            }
        } catch (err) {
            console.error(err);
            await client.sendMessage(M.from, {
                text: "🚨 **An error occurred while processing your discard command.**"
            });
        }
    },
};
