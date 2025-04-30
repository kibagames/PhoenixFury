module.exports = {
  name: "t2deck",
  aliases: ["todeck", "2deck"],
  exp: 1,
  cool: 4,
  react: "✅",
  category: "cards",
  usage: 'Use :t2deck <card_index>',
  description: "Send a card from collection to deck",
  async execute(client, arg, M) {
     try {

      const index = parseInt(arg) - 1; // The index in the array is 0-based
      
      const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
      const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
      
      if (collection.length === 0) {
        return M.reply("I'm sorry, it appears that you currently don't have any cards in your collection. 😔 Keep collecting more cards to expand your collection! 🃏");
      }
      
      if (isNaN(index) || index < 0 || index >= collection.length) {
        return M.reply(`❌Invalid card index. Your collection has ${collection.length} cards.`);
      }
      
      const card = collection[index];
      
      if (deck.length === 12) {
        return M.reply("❌Your deck is full");
      }
      
      collection.splice(index, 1);
      deck.push(card);
      
      await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Collection`, collection);
      await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, deck);
        
      const replyMsg = `*${card.name} - ${card.tier}* has been sent from your collection to your deck!`;
      
      M.reply(replyMsg);
  await client.sendMessage(client.groups.adminsGroup, { text: `user @${M.sender.split('@')[0]} has sended his card ${replyMsg}` })
    } catch (err) {
      await client.sendMessage(M.from, { image: { url: `${client.utils.errorChan()}` }, caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}` });
    }
  },
};
