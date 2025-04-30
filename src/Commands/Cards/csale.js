module.exports = {
  name: "cancelsell",
  aliases: ['csell'],
  exp: 1,
  cool: 4,
  react: "✅",
  category: "cards",
  usage: ':cancelsell',
  description: "Cancels a card sale",
  async execute(client, arg, M) {
      try {
          await cancelSale(client, M);
      } catch (err) {
          console.error(err);
          await client.sendMessage(M.from, {
              image: { url: client.utils.errorChan() },
              caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err.message || err}`,
          });
      }
  },
};

async function cancelSale(client, M) {
  // Fetch the sale data from the client sellMap
  const saleData = await client.sellMap.get(M.from);

  // Check if the sale data exists
  if (!saleData) {
      return M.reply("❌ No active sale found to cancel.");
  }

  // Check if the sender is the one who initiated the sale
  if (M.sender === saleData.seller) {
      await client.sellMap.delete(M.from);
    await client.DB.set(`${M.sender}_Sell`, false);
      // Provide feedback to the seller
      M.reply("✅ Sale canceled successfully.");
  } else {
      // If the sender is not the seller, send an error message
      M.reply("❌ You cannot cancel a sale that you did not initiate.");
  }
}
