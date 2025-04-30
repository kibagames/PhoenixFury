const axios = require('axios');

module.exports = {
    name: 'treasury',
    aliases: ['at'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use: !treasury',
    description: 'Shows the wallet value',

    async execute(client, arg, M) {
        try {
            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });

            // Default wallet value if no economy data is found
            const wallet = economy ? economy.treasurys : 0;

            const username = M.pushName;
            const tag = `#${M.sender.substring(3, 7)}`;

            // Fetch the thumbnail image from a URL
            const { data: thumbnailBuffer } = await axios({
                url: 'https://i.ibb.co/YypVrb6/treasury.png',
                responseType: 'arraybuffer'
            });

            // Send the message with the thumbnail
            await client.sendMessage(M.from, {
                text: `💰 *Treasury*\n\n👤 *User:* ${username}\n🔖 *Tag:* ${tag}\n💵 *Coins:* ${wallet}`,
                contextInfo: {
                    externalAdReply: {
                        title: `Aurora Coins`,
                        body: 'Aurora 2024',
                        mediaType: 2,
                        thumbnail: thumbnailBuffer,
                        sourceUrl: '' // Add a source URL if needed
                    }
                }
            }, { quoted: M });
        } catch (err) {
            console.error('Error in treasury command:', err);
            await M.reply('An error occurred while fetching your treasury information. Please try again later.');
        }
    }
};
