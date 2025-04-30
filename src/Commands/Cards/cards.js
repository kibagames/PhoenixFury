const axios = require('axios');

module.exports = {
  name: 'card',
  aliases: ['cards'],
  exp: 1,
  cool: 4,
  react: "✅",
  category: 'cards',
  usage: 'Use: :cards --tier/--name/--events',
  description: 'Display all your cards, combined from deck and collection.',
  async execute(client, arg, M) {
    try {
      // Fetch collection and deck
      const collection = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Collection`) || [];
      const deck = await client.card.get(`${M.sender.replace('.whatsapp.net', '')}_Deck`) || [];

      // Handle empty collection and deck
      if (collection.length === 0 && deck.length === 0) {
        return M.reply("❌ Oops! You don't have any cards in your collection or deck.");
      }

      let tag = M.sender.substring(3, 7);
      let tr = `*🃏 Name:* ${(await client.contact.getContact(M.sender, client)).username} #${tag}\n\n`;

      const tierEmojis = {
        'S': '👑',
        '6': '💎',
        '5': '🔮',
        '4': '🌟',
        '3': '🎐',
        '2': '🪄',
        '1': '💠'
      };

      // Combine deck and collection
      const allCards = [...deck, ...collection];

      // Handle --events argument
      if (arg === "--events") {
        const eventCards = allCards.filter(card => card.id && card.id.startsWith('event'));
        if (eventCards.length === 0) {
          return M.reply("🚫 No event cards found.");
        }

        eventCards.forEach((card, index) => {
          tr += `*${index + 1}. ${card.name} (ID: ${card.id})*\n`;
        });

        // Attempt to fetch the image for the first event card
        const firstCard = eventCards[0];
        const url = firstCard.image;
        let file;

        if (url) {
          file = await axios.get(url, { responseType: 'arraybuffer' }).then(res => res.data);
        } else {
          return M.reply('🚫 **No image available for the event cards.**');
        }

        // Send image of the first event card
        return await client.sendMessage(M.from, { image: file, caption: tr }, { quoted: M });
      }

      // Sorting the cards based on the argument
      if (arg === "--name") {
        const groupedCards = {};

        // Grouping cards alphabetically
        allCards.forEach(card => {
          const name = card.name;
          const firstLetter = name[0].toLowerCase();
          if (!groupedCards[firstLetter]) groupedCards[firstLetter] = [];
          groupedCards[firstLetter].push(card);
        });

        // Sorting grouped cards alphabetically
        Object.keys(groupedCards).sort().forEach(letter => {
          tr += `*Cards starting with ${letter.toUpperCase()}*:\n`;
          groupedCards[letter].sort((a, b) => a.name.localeCompare(b.name)).forEach((card, index) => {
            tr += `${index + 1}. ${card.name} (Tier: ${card.tier})\n`;
          });
          tr += '\n';
        });
      } else if (arg === "--tier") {
        // Grouping cards by tier
        const tiers = {};
        allCards.forEach(card => {
          const tier = card.tier;
          if (!tiers[tier]) tiers[tier] = [];
          tiers[tier].push(card);
        });

        // Displaying cards tier-wise
        ['S', '6', '5', '4', '3', '2', '1'].forEach(tier => {
          if (tiers[tier]) {
            tr += `${tierEmojis[tier]} *Tier: ${tier}*\n\n`;
            tiers[tier].forEach((card, index) => {
              tr += `${index + 1} ➣ ${card.name}\n`;
            });
            tr += '\n';
          }
        });
      } else {
        // Displaying cards normally without sorting
        allCards.forEach((card, index) => {
          const name = card.name;
          const tier = card.tier;
          tr += `*${index + 1}. ${name} (Tier: ${tier})*\n`;
        });
      }

      // Attempting to fetch the image for the first card in the deck or collection
      const firstCard = allCards[0];
      const url = firstCard ? firstCard.image : '';
      let file;

      if (url) {
        file = await axios.get(url, { responseType: 'arraybuffer' }).then(res => res.data);
      } else {
        return M.reply('🚫 **No image available for the cards.**');
      }


      // Send video for high tier cards (6 or S), otherwise send image
      if (firstCard.tier.includes('6') || firstCard.tier.includes('S')) {
        const giffed = await client.utils.gifToMp4(file);
        return await client.sendMessage(M.from, { video: giffed, caption: tr, gifPlayback: true }, { quoted: M });
      } else {
        return await client.sendMessage(M.from, { image: file, caption: tr }, { quoted: M });
      }
    } catch (err) {
      // Handle errors gracefully with decorated messages
      await client.sendMessage(M.from, { image: { url: `${client.utils.errorChan()}` }, caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}` });
    }
  },
};
