const fs = require('fs').promises; // Use promises for async file reading
const path = require('path'); // Import the path module

// Wallet Command
module.exports = {
    name: 'coin',
    aliases: ['ac', 'coins'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :wallet',
    description: 'Shows the wallet value',
    async execute(client, arg, M) {
        try {
            const userId = M.sender;
            const economy = await client.econ.findOne({ userId });

            let wallet = economy ? economy.coin : 0;

            // Ensure wallet value is an integer
            wallet = Math.round(wallet);

            if (wallet < 0) { // Check if wallet is negative
                economy.coin = 0; // Set wallet to 0 if negative
                await economy.save();
            } else if (wallet !== Math.round(wallet)) { // Check if wallet is not an integer
                economy.coin = Math.round(wallet); // Round down wallet value to nearest integer
                await economy.save();
            }

            const username = M.pushName;
            const tag = `#${M.sender.substring(3, 7)}`;
            const thumbnailPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'coin.png');

            // Read the thumbnail image file
            const thumbnail = await fs.readFile(thumbnailPath);

            await client.sendMessage(M.from, {
                text: `💰 *Coins*\n\n👤 *User:* ${username}\n🔖 *Tag:* ${tag}\n💵 *Coins:* ${wallet}`,
                contextInfo: {
                    externalAdReply: {
                        title: `Aurora Coins`,
                        body: 'Aurora 2024',
                        mediaType: 2,
                        thumbnail: thumbnail,
                        sourceUrl: ''
                    }
                }
            }, { quoted: M });
        } catch (error) {
            console.error('Error in coin command:', error);
            M.reply('An error occurred while fetching the wallet value.');
        }
    }
};
