module.exports = {
  name: "searchcard-anime",
  aliases: ["sca"],
  exp: 1,
  cool: 5,
  react: "🔍",
  category: "cards",
  usage: 'Use :searchcard-anime <sourceText>',
  description: "Searches for cards by source text in your deck and collection.",
  async execute(client, arg, M) {
    try {
      arg = Array.isArray(arg) ? arg : [arg];
      const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
      const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];

      const searchTerm = arg.join(' ').toLowerCase();

      const cardsInDeck = deck.filter(card => card.source && card.source.toLowerCase().includes(searchTerm));
      const cardsInCollection = collection.filter(card => card.source && card.source.toLowerCase().includes(searchTerm));

      let response = `🔍 **Card Search Results for:** *"${searchTerm}"*\n\n`;

      // Helper function to group cards by tier
      const groupByTier = (cards) => {
        return cards.reduce((acc, card) => {
          const tier = card.tier || "Unknown";
          if (!acc[tier]) acc[tier] = [];
          acc[tier].push(card);
          return acc;
        }, {});
      };

      // Process and format deck results
      if (cardsInDeck.length > 0) {
        const groupedDeck = groupByTier(cardsInDeck);
        response += `🃏 **Deck Results:**\n`;
        Object.keys(groupedDeck).forEach(tier => {
          response += `\n✨ **Tier ${tier}:**\n`;
          groupedDeck[tier].forEach((card, index) => {
            const cardIndex = deck.indexOf(card);
            response += `   ${index + 1}. 🏷️ *Name*: ${card.name} (Deck: ${cardIndex + 1})\n`;
          });
        });
      }

      // Process and format collection results
      if (cardsInCollection.length > 0) {
        const groupedCollection = groupByTier(cardsInCollection);
        response += `\n📚 **Collection Results:**\n`;
        Object.keys(groupedCollection).forEach(tier => {
          response += `\n✨ **Tier ${tier}:**\n`;
          groupedCollection[tier].forEach((card, index) => {
            const cardIndex = collection.indexOf(card);
            response += `   ${index + 1}. 🏷️ *Name*: ${card.name} (Collection: ${cardIndex + 1})\n`;
          });
        });
      }

      // If no results
      if (cardsInDeck.length === 0 && cardsInCollection.length === 0) {
        response += "❌ *No cards found matching your search.*";
      }

      // Reply with the formatted response
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
                
