module.exports = {
  name: "auction",
  aliases: ["auction"],
  exp: 1,
  cool: 5,
  react: "✅",
  category: "cards",
  usage: "Usage: :auction start|index|price, end, eliminate, reset",
  description: "Initiate or manage a card auction where the highest bid wins the card.",

  async execute(client, arg, M) {
    try {
      if (!client.mods.includes(M.sender.split('@')[0])) {
        return M.reply("🚫 Access Denied: You are not authorized to manage auctions.");
      }

      const win = client.DB.get(`${M.from}_win`);

      if (arg.startsWith('start')) {
        const auctionInProgress = await client.aucMap.get(M.from);
        if (auctionInProgress && auctionInProgress.progress) {
          return M.reply("🚨 An auction is already active! Complete the current auction before starting a new one.");
        }

        const splitArgs = arg.split('|');
        if (splitArgs.length !== 3) {
          return M.reply("⚠️ Please specify the card index and starting price separated by '|', e.g., start|1|100.");
        }

        const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];
        if (deck.length === 0) {
          return M.reply("🔍 You have no cards in your deck available for auction.");
        }

        const cardIndex = parseInt(splitArgs[1]) - 1;
        if (isNaN(cardIndex) || cardIndex < 0 || cardIndex >= deck.length) {
          return M.reply("🚫 Invalid card index. Please provide a valid card number.");
        }

        const startingPrice = parseInt(splitArgs[2]);
        if (isNaN(startingPrice) || startingPrice <= 0) {
          return M.reply("🚫 Invalid starting price. Please provide a valid price.");
        }

        const card = deck[cardIndex];
        const imageUrl = card.image;
        const text = `💎 **Auction for Card** 💎\n\n` +
                     `🌊 *Name:* ${card.name}\n` +
                     `🌟 *Tier:* ${card.tier}\n` +
                     `💰 *Starting Price:* ${startingPrice}\n` +
                     `♦️ *Source:* ${card.source}\n\n` +
                     `🎉 **Bid now to win!** 🎉\n` +
                     `🔰 Use :bid <amount> to place your bid.`;

        const file = await client.utils.getBuffer(imageUrl);
        const isGif = imageUrl.endsWith('.gif');

        if (isGif) {
          const giffed = await client.utils.gifToMp4(file);
          await client.sendMessage(M.from, { video: giffed, gifPlayback: true, caption: text, quoted: M });
        } else {
          await client.sendMessage(M.from, { image: file, caption: text, quoted: M });
        }

        await client.aucMap.set(M.from, {
          card: { name: card.name, tier: card.tier, id: card.id, source: card.source, image: card.image },
          bid: startingPrice,
          winner: '',
          bidders: [],
          progress: true
        });

        deck.splice(cardIndex, 1);
        await client.card.set(`${M.sender.replace('.whatsapp.net', '')}_Deck`, deck);
        return;
      }

      if (arg === 'eliminate') {
        const user = M.mentions[0] || (M.quoted && M.quoted.participant);
        const auc = await client.aucMap.get(M.from);
        if (!auc || !auc.progress) {
          return M.reply("⚠️ No active auction to eliminate users from.");
        }

        auc.bidders = auc.bidders.filter(bidder => bidder.userId !== user);
        await client.aucMap.set(M.from, auc);

        return M.reply(`🚫 @${user.split('@')[0]} has been eliminated from the auction.`);
      }

      if (arg === 'end') {
        const auc = await client.aucMap.get(M.from);
        if (!auc) {
          return M.reply("⚠️ No auction is currently in progress.");
        }

        const { bid, winner, card } = auc;
        if (!winner) {
          return M.reply("🔚 No bids placed. Auction ended with no winner.");
        }

        const winnerDeck = await client.card.get(`${winner.replace('.whatsapp.net', '')}_Deck`) || [];

        if (!winnerDeck.some(c => c.id === card.id)) {
          const cardData = { name: card.name, tier: card.tier, id: card.id, source: card.source, image: card.image };
          if (winnerDeck.length < 12) {
            await client.card.push(`${winner.replace('.whatsapp.net', '')}_Deck`, cardData);
          } else {
            await client.card.push(`${winner.replace('.whatsapp.net', '')}_Collection`, cardData);
          }
        }

        const economy = await client.econ.findOne({ userId: winner });
        economy.coin -= bid;
        await economy.save();

        await client.card.add(`${M.sender}_Auctions`, 1);
        await client.aucMap.delete(M.from);

        const auctionDetails = await client.DB.get('AUCTIONS') || [];
        auctionDetails.push({
          name: card.name,
          tier: card.tier,
          winner: winner,
          bid: bid
        });
        await client.DB.set('AUCTIONS', auctionDetails);

        await client.sendMessage(M.from, {
          text: `✨🎉 **Auction Ended** 🎉✨\n\n` +
                `🏆 Winner: @${winner.split('@')[0]}\n` +
                `💎 *Card:* ${card.name}\n` +
                `🌟 *Tier:* ${card.tier}\n` +
                `💰 *Winning Bid:* ${bid}\n\n` +
                `The card has been added to the winner's ${winnerDeck.length < 12 ? 'deck' : 'collection'}.`,
          mentions: [winner]
        });
        return;
      }

      if (arg === 'reset') {
        await client.aucMap.delete(M.from);
        return M.reply("✅ Auction has been fully reset, including bids, eliminations, and winners.");
      }

    } catch (err) {
      console.error(err);
      await client.sendMessage(M.from, {
        image: { url: client.utils.errorChan() },
        caption: `🚨 ${client.utils.greetings()} Error detected!\n\n**Error Details:**\n${err.message}`,
        quoted: M
      });
    }
  }
};
