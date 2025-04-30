const fs = require('fs').promises; // Use promises for async file reading
const path = require('path'); // Import the path module

module.exports = {
    name: "active-points",
    aliases: ["ap"],
    exp: 0,
    react: "✅",
    category: "core",
    usage: "Use :ap to get your active points",
    description: "Gives your active points that you earn being active.",

    async execute(client, arg, M) {
        try {
            const point = await client.act.get(`${M.sender}_Points`);
            const points = Math.floor(point); // Use Math.floor to round down

            const username = M.pushName;
            const thumbnailPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'ap.png');

            // Read the thumbnail image file
            const thumbnail = await fs.readFile(thumbnailPath);

            await client.sendMessage(M.from, {
                text: `👤 *${username}*'s *Active Points:* ${points}`,
                contextInfo: {
                    externalAdReply: {
                        title: `Aurora Active Points`,
                        body: 'Aurora 2024',
                        mediaType: 2,
                        thumbnail: thumbnail,
                        sourceUrl: ''
                    }
                }
            }, { quoted: M });
        } catch (err) {
            console.error('Error fetching active points:', err);
            M.reply('🟥 *There was an error fetching your active points.*');
        }
    }
};
