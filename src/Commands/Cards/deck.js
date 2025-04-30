const fs = require('fs');
const { createCollage } = require('../../lib/collage'); // Import the collage module

module.exports = {
  name: 'deck',
  aliases: ['deck'],
  exp: 1,
  cool: 4,
  react: "✅",
  category: 'cards',
  usage: 'Use :deck or :deck <index>',
  description: 'Claim the card from your deck',
  async execute(client, arg, M) {
    const senderId = M.sender.replace('.whatsapp.net', '');
    const deck = await client.card.get(`${senderId}_Deck`);
    if (!deck || deck.length === 0) {
      M.reply('❌ *No Deck Found*');
      return;
    }

    try {
      const background = await client.DB.get(`${M.sender}_BG`);
      const backgroundUrl = background && background.url ? background.url : null;

      if (arg) {
        const index = parseInt(arg) - 1;

        // Ensure the index is valid and within bounds
        if (isNaN(index) || index < 0 || index >= deck.length) {
          M.reply(`❌ *Invalid card index!* Your deck has *${deck.length}* cards.`);
          return;
        }

        const card = deck[index];
        const title = card.name;
        const tier = card.tier;
        const source = card.source;
        const url = card.image;
        const text = `🃏 *Total Cards in Deck:* ${deck.length}\n\n🏮 *Username:* @${M.sender.split('@')[0]}\n*#${index + 1}*\n🃏 *Name:* ${title}\n🪄 *Tier:* ${tier}\n♦️ *Source:* ${source}\n`;

        const file = await client.utils.getBuffer(url);

        if (tier.includes('6') || tier.includes('S')) {
          const giffed = await client.utils.gifToMp4(file);
          await client.sendMessage(M.from, {
            video: giffed,
            gifPlayback: true,
            caption: text,
            mentions: [M.sender]
          }, { quoted: M});
        } else {
          await client.sendMessage(M.from, { image: { url: url }, caption: text }, { quoted: M });
        }
      } else {
        const deckImages = deck.map(card => card.image);
        const outputPath = `deck.png`; // Path for the final deck image

        await createCollage(deckImages, outputPath, backgroundUrl); // Create deck collage

        const more = String.fromCharCode(8206);
        const readMore = more.repeat(4001);

        let cardText = "";
        deck.forEach((card, i) => {
          cardText += `#${i + 1})\n💎 *Name:* ${card.name}\n🌟 *Tier:* ${card.tier}\n\n`;
        });

        const caption = `♠️ | @${M.pushName}'s Deck | ${readMore}♠️\n\n🃏 *Total Cards: ${deck.length}*\n\n${cardText}`;
        await client.sendMessage(M.from, {
          image: { url: outputPath },
          caption: caption,
          mentions: [M.sender],
        }, { quoted: M });

        // Cleanup temporary files
        fs.unlinkSync(outputPath);
      }
    } catch (err) {
      console.error(err);
      await client.sendMessage(M.from, {
        image: { url: `${client.utils.errorChan()}` },
        caption: `${client.utils.greetings()} ⚠️ Error Occurred\n\n*Error Details:*\n${err.message}`,
      });
    }
  },
};
