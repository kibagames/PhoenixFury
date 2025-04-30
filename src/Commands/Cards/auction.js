module.exports = {
  name: "auctions",
  aliases: ["aucs"],
  exp: 1,
  cool: 5,
  react: "✅",
  category: "cards",
  usage: "use :auctions",
  description: "Checks the auctions cards and thier owner.",
  async execute(client, arg, M) {
      try {
          const auctions = await client.DB.get('AUCTIONS') || [];
          
          if (auctions.length === 0) {
              return M.reply("⚠️ No completed auctions found at the moment.");
          }

          // Sort auctions by bid amount, highest to lowest
          auctions.sort((a, b) => b.bid - a.bid);

          let response = "📜 **Completed Auctions**\n\n";
          auctions.forEach((auction, index) => {
              response += `📌 **Auction #${index + 1}**\n` +
                          `🏷️ *Card Name:* ${auction.name}\n` +
                          `🌟 *Tier:* ${auction.tier}\n` +
                          `🏆 *Winner:* @${auction.winner.split('@')[0]}\n` +
                          `💸 *Final Bid:* ${auction.bid}\n\n`;
          });

          await client.sendMessage(M.from, { text: response }, { quoted: M });
      } catch (err) {
          console.error(err);
          await client.sendMessage(
              M.from,
              { 
                  image: { url: client.utils.errorChan() },
                  caption: `🚨 ${client.utils.greetings()} Error-Chan here!\n\nAn error occurred:\n${err.message}`
              }
          );
      }
  }
};
