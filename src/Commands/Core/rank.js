const { getStats } = require('../../Helpers/Stats');
const axios = require('axios');

module.exports = {
    name: 'exp',
    aliases: ['rank', 'xp'],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use: rank',
    description: 'Generates your rank card.',

    async execute(client, arg, M) {
        try {
            const user = M.quoted?.participant || M.mentions[0] || M.sender;

            // Fetch user profile picture
            let pfp;
            try {
                pfp = await client.profilePictureUrl(user, 'image');
            } catch {
                pfp = 'https://i.ibb.co/nbdh1ZM/Aurora-error.jpg'; // Default image if not found
            }

            // Get user data
            const level = Number(await client.DB.get(`${user}_LEVEL`)) || 1;
            const experience = Number(await client.exp.get(user)) || 0;
            const { requiredXpToLevelUp, rank } = getStats(level);
            const username = M.pushName || "Unknown";

            const json = {
                "level": level,
                "experience": experience,
                "requiredXpToLevelUp": requiredXpToLevelUp,
                "username": username,
                "pfp": pfp,
                "tag": user.substring(3, 7)
            };

            console.log("Request JSON:", json);

            // Properly encode JSON for URL request
            const response = await axios.get(
                `https://shiui-ff2daa3f5778.herokuapp.com/rank?json=${encodeURIComponent(JSON.stringify(json))}`,
                { responseType: 'arraybuffer' } // Expect binary data
            );

            if (response.data) {
                console.log("Received response from API");
            }

            const buffer = Buffer.from(response.data, "binary");

            // Send the rank card
            await client.sendMessage(
                M.from,
                {
                    image: buffer,
                    caption: `🎯 *Exp*: ${experience}/${requiredXpToLevelUp}\n❤️ *Level*: ${level}\n🔮 *Rank*: ${rank}`,
                    mentions: [user]
                },
                { quoted: M }
            );

        } catch (error) {
            console.error("Error generating rank card:", error.message || error);
            await client.sendMessage(
                M.from,
                { text: `❌ Failed to generate rank card: ${error.message || "Unknown error"}` },
                { quoted: M }
            );
        }
    }
};
