module.exports = {
  name: 'bid',
  aliases: ['auction-bid'],
  category: 'economy',
  exp: 1,
  cool: 5,
  react: "🔨",
  usage: 'Use :bid <amount>',
  description: 'Place a bid on the current auction to try winning a card.',
  async execute(client, arg, M) {
    try {
      const userId = M.sender;
      const economy = await client.econ.findOne({ userId });

      if (!economy) {
        return M.reply('📉 You need an economy account to participate. Please create one first.');
      }

      const auc = await client.aucMap.get(M.from);

      if (!auc || !auc.progress) {
        return M.reply("⚠️ There is no active auction right now.");
      }

      const eliminatedUsers = await client.DB.get(`${M.from}_AUCS`) || [];
      if (eliminatedUsers.includes(userId)) {
        return M.reply('🚫 You have been disqualified from this auction.');
      }

      if (!arg) {
        return M.reply('💸 Please specify the amount you want to bid.');
      }

      const amount = parseInt(arg);
      if (isNaN(amount) || amount <= 0) {
        return M.reply('❌ Enter a valid, positive amount for your bid.');
      }

      const currentBid = auc.bid;
      const credits = economy.coin;

      if (amount <= currentBid) {
        return M.reply(`📈 Your bid needs to be higher than the current bid of ${currentBid} coins.`);
      }

      if (amount > credits) {
        return M.reply('💰 Insufficient funds. You don\'t have enough coins for this bid.');
      }

      // Update or add user's bid in the auction's bid list
      auc.bidders = auc.bidders || [];
      const existingBid = auc.bidders.find(bidder => bidder.userId === userId);

      if (existingBid) {
        existingBid.amount = amount;
      } else {
        auc.bidders.push({ userId, amount });
      }

      // Update the highest bid and winner
      auc.bid = amount;
      auc.winner = userId;
      await client.aucMap.set(M.from, auc);

      // Generate a message showing all bidders and their bids
      let bidMessage = `🪙 *Auction Standings:* 🪙\n\n`;
      auc.bidders.sort((a, b) => b.amount - a.amount); // Sort bidders by bid amount
      auc.bidders.forEach((bidder, index) => {
        bidMessage += `#${index + 1} @${bidder.userId.split('@')[0]} - 💰 ${bidder.amount}\n`;
      });

      bidMessage += `\n🔝 *Highest Bidder:* @${auc.winner.split('@')[0]}\n💰 *Current Highest Bid:* ${auc.bid}`;

      await client.sendMessage(M.from, {
        text: bidMessage,
        mentions: auc.bidders.map(b => b.userId)
      });

    } catch (err) {
      console.error(err);
      await client.sendMessage(M.from, {
        text: `🚨 An error occurred while processing your bid:\n\n${err.message}`,
        quoted: M
      });
    }
  }
};
