module.exports = {
    name: "getcard",
    aliases: ["addcard"],
    category: "dev",
    description: "Add a card to your deck, or to your collection if the deck is full.",
    async execute(client, arg, M) {
        const shisui = "917980329866@s.whatsapp.net";

        if ( M.sender !== shisui ) return M.reply('Only My Owner Can Use This Command')
        try {
            const sender = M.sender
            const id = arg;

            // Fetch card details from the API
            const url = `https://aurora-api-eight.vercel.app/card/id?id=${id}`;
            const response = await fetch(url);
            const cardData = await response.json();
            const { title, tier, source, image } = cardData;

            // Retrieve user's current deck
            let deck = await client.card.get(`${sender}_Deck`) || [];

            if (deck.length < 12) {
                // Add card to deck if it's not full
                deck.push({ id, name: title, tier, source, image });
                await client.card.set(`${sender.replace('.whatsapp.net', '')}_Deck`, deck);
                M.reply(`✅ *${title}* has been added to your deck! (${deck.length}/12 cards)`);
            } else {
                // If the deck is full, add card to collection
                let collection = await client.card.get(`${sender.replace('.whatsapp.net', '')}_Collection`) || [];
                collection.push({ id, name: title, tier, source, image });
                await client.card.set(`${sender}_Collection`, collection);
                M.reply(`🗃️ *${title}* has been added to your collection, since your deck is full.`);
            }
        } catch (error) {
            console.error("Error adding card:", error);
            M.reply("❗ An error occurred while adding the card. Please try again.");
        }
    }
};