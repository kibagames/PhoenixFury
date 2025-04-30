module.exports = {
  name: "searchcard",
  aliases: ["scard"],
  exp: 1,
  cool: 5,
  react: "🔍",
  category: "cards",
  usage: 'Use :searchcard <cardName>',
  description: "Search for a card by name in your deck and collection.",
  async execute(client, arg, M) {
    try {
      arg = Array.isArray(arg) ? arg : [arg];
      const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
      const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];

      const searchTerm = arg.join(' ').toLowerCase();

      const cardsInDeck = deck.filter(card => card.name && card.name.toLowerCase().includes(searchTerm));
      const cardsInCollection = collection.filter(card => card.name && card.name.toLowerCase().includes(searchTerm));

      let response = `🔍 **Card Search Results for:** *"${searchTerm}"*\n\n`;

      if (cardsInDeck.length > 0) {
        response += `🃏 **Deck Results:**\n`;
        cardsInDeck.forEach((card, index) => {
          const cardIndex = deck.indexOf(card);
          response += `\n${index + 1}. 🏷️ **Name**: ${card.name}\n   ⭐ **Tier**: ${card.tier}\n   🔗 **Source**: ${card.source}\n   📍 **Location**: Deck\n   🔢 **Index**: ${cardIndex + 1}\n`;
        });
      }

      if (cardsInCollection.length > 0) {
        response += `\n📚 **Collection Results:**\n`;
        cardsInCollection.forEach((card, index) => {
          const cardIndex = collection.indexOf(card);
          response += `\n${index + 1}. 🏷️ **Name**: ${card.name}\n   ⭐ **Tier**: ${card.tier}\n   🔗 **Source**: ${card.source}\n   📍 **Location**: Collection\n   🔢 **Index**: ${cardIndex + 1}\n`;
        });
      }

      if (cardsInDeck.length === 0 && cardsInCollection.length === 0) {
        response += "❌ *No cards found matching your search.*";
      }

      M.reply(response);
    } catch (err) {
      console.error(err);
      await client.sendMessage(M.from, {
        image: { url: client.utils.errorChan() },
        caption: `${client.utils.greetings()} ⚠️ *An error occurred during the search.*\n\n*Error Details:*\n${err}`,
      });
    }
  },
};
