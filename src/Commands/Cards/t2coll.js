module.exports = {
  name: "t2coll",
  aliases: ["tocoll", "2coll"],
  exp: 1,
  cool: 4,
  react: "✅",
  category: "cards",
  usage: 'Use :t2coll <card_index>',
  description: "Transfer a card from your deck to your collection",
  async execute(client, arg, M) {
    const saleData = await client.sellMap.get(M.from);
    if ( saleData && saleData.seller === M.from) return M.reply('you cannot transfer the card while selling')
    try {

      const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
      const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
      const indexOF = parseInt(arg.split(' ')[0]);

      if (!indexOF) {
        return M.reply("❌Please provide the index or name of the card you wish to transfer.");
      }

      const position = isNaN(indexOF) ? deck.findIndex((card) => card === indexOF) : parseInt(indexOF, 10) - 1;

      if (position < 0 || position >= deck.length) {
        return M.reply("❌Invalid card index.");
      }

      const card = deck[position];
      collection.push(card);
      deck.splice(position, 1);

      await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Collection`, collection);
      await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, deck);

  
      const replyMsg = `*${card.name} - ${card.tier}* has been sent from your deck to your collection!`

      M.reply(replyMsg);
      await client.sendMessage(client.groups.adminsGroup, { text: `user ${M.sender.split('@')[0]} has sended his card ${replyMsg}`, mentions: [M.sender] });
    } catch (err) {
      await client.sendMessage(M.from, { image: { url: `${client.utils.errorChan()}` }, caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}` });
    }
  }
};
