module.exports = {
  name: "cswap",
  aliases: ["swapcards"],
  exp: 1,
  cool: 4,
  react: "✅",
  category: "cards",
  usage: 'Use :cswap <index1> <index2>',
  description: "Swap two cards in your deck",
  async execute(client, arg, M) {
    const saleData = await client.sellMap.get(M.from);
    if ( saleData && saleData.seller === M.from) return M.reply('ayiu cannot transfer the card while selling')

    try {
      let deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];

      const [arg1, arg2] = arg.split(' ');

      if (!arg1 || isNaN(arg1) || arg1.includes("-") || arg1.includes("+") || (deck.length - parseInt(arg1)) < 0) {
        M.reply("❌Please provide a valid first card index.");
        return;
      }

      if (!arg2 || isNaN(arg2) || arg2.includes("-") || arg2.includes("+") || (deck.length - parseInt(arg2)) < 0) {
        M.reply("❌Please provide a valid second card index.");
        return;
      }

      const index1 = parseInt(arg1) - 1;
      const index2 = parseInt(arg2) - 1;

      if (index1 === index2) {
        M.reply("❌The two indices provided cannot be the same.");
        return;
      }

      if (index1 < 0 || index1 >= deck.length || index2 < 0 || index2 >= deck.length) {
        M.reply("❌One or both indices are out of range.");
        return;
      }

      // Swapping the cards
      [deck[index1], deck[index2]] = [deck[index2], deck[index1]];

      // Update the deck in the database
      await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, deck);

      const cardName1 = deck[index1].name;
      const cardName2 = deck[index2].name;

      M.reply(`✔ Cards at index ${index1 + 1} *(${cardName1})* and ${index2 + 1} *(${cardName2})* have been swapped.`);
    } catch (err) {
      console.log(err);
      await client.sendMessage(M.from, { image: { url: `${client.utils.errorChan()}` }, caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}` });
    }
  },
};
