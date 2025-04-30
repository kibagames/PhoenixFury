// Inventory Command
module.exports = {
    name: 'inventory',
    aliases: ['inv'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :inv',
    description: 'Gives you details about your inventory',
    async execute(client, arg, M) {
        try {
            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });

            let pepper = economy ? economy.peppersprays : 0;
            let luck = economy ? economy.luckpotions : 0;
            let wallet = economy ? economy.coin : 0;
            let bank = economy ? economy.treasurys : 0;
            const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
            const coll = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
            const party = await client.pkmn.get(`${M.sender}_Party`) || [];
            const pc = await client.pkmn.get(`${M.sender}_PC`) || [];
            const act = await client.act.get(`${M.sender}_Points`) || 0;
            const points = Math.floor(act); // Use Math.floor to round down

            const totalGems = wallet + bank;
            const totalCards = deck.length + coll.length;
            const totalPoke = party.length + pc.length;

            let text = '🎒 *INVENTORY* 🎒\n\n';
            text += `🌶️ *Pepper Spray:* ${pepper}\n`;
            text += `🍀 *Luck Potion:* ${luck}\n`;
            text += `💰 *Total Coins:* ${totalGems}\n`;
            text += `🎴 *Total Cards:* ${totalCards}\n`;
            text += `🔴⚪️ *Total Pokemons:* ${totalPoke}\n`;
            text += `⭐️ *AP*: ${points}`

            // If inventory has more items, you can add them here

            M.reply(text);
        } catch (err) {
            console.error(err);
            M.reply("An error occurred while fetching your inventory.");
        }
    }
};
