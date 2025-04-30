const axios = require('axios');

module.exports = {
    name: 'ship',
    aliases: ['ship'],
    category: 'fun',
    exp: 2,
    cool: 10,
    react: "✅",
    usage: 'Use :ship @tag @tag',
    description: 'Ship People! ♥',
    async execute(client, arg, M) {
        try {
            const shipArray = [];
            let users = M.mentions;

            if (M.quoted && !users.includes(M.quoted.participant)) {
                users.push(M.quoted.participant);
            }

            while (users.length < 2) {
                users.push(M.sender);
            }

            if (users.includes(M.sender)) {
                users = users.reverse();
            }

            for (const user of users) {
                const name = (await client.contact.getContact(user, client)).username;
                let image;

                try {
                    image = await client.profilePictureUrl(user, 'image');
                } catch {
                    image = 'https://icon2.cleanpng.com/20180703/lzk/kisspng-computer-icons-error-clip-art-checklist-5b3c119612f6e8.7675651415306633180777.jpg';
                }

                shipArray.push({ name, image });
            }

            const percentage = Math.floor(Math.random() * 101);

            let text = '';
            if (percentage < 10) text = 'Awful';
            else if (percentage < 25) text = 'Very Bad';
            else if (percentage < 40) text = 'Poor';
            else if (percentage < 55) text = 'Average';
            else if (percentage < 75) text = 'Good';
            else if (percentage < 90) text = 'Great';
            else text = 'Amazing';

            let sentence = '';
            if (percentage < 40) sentence = `There's still time to reconsider your choices`;
            else if (percentage < 60) sentence = `Good enough, I guess! 💫`;
            else if (percentage < 75) sentence = `Stay together and you'll find a way ⭐️`;
            else if (percentage < 90) sentence = `Amazing! You two will be a good couple 💖`;
            else sentence = `You two are fated to be together 💙`;

            let caption = `\t❣️ *Matchmaking...* ❣️ \n`;
            caption += `---------------------------------\n`;
            caption += `*@${users[0].split('@')[0]}  x  @${users[1].split('@')[0]}*\n`;
            caption += `---------------------------------\n`;
            caption += `\t\t${percentage < 40 ? '💔' : percentage < 75 ? '❤' : '💗'} *ShipCent: ${percentage}%*\n\n`;
            caption += `💗 *Type:* ${text}\n\n`;
            caption += `*${sentence}*`;

            const json = {
                profile: shipArray,
                percentage: percentage,
                text: text
            };

            console.log("🚀 Request JSON:", JSON.stringify(json, null, 2)); // Debugging

            // ✅ Correct Encoding Fix
            const jsonString = JSON.stringify(json);
            const encodedJson = encodeURIComponent(jsonString);
            
            const response = await axios.get(
                `https://shiui-ff2daa3f5778.herokuapp.com/ship?json=${encodedJson}`,
                { responseType: 'arraybuffer' } // Expect binary data
            );

            const buffer = Buffer.from(response.data, "binary");

            client.sendMessage(
                M.from,
                {
                    image: buffer,
                    caption,
                    mentions: users
                },
                {
                    quoted: M
                }
            );
        } catch (error) {
            console.error("❌ Error in ship command:", error);
            client.sendMessage(M.from, "❌ *Error processing the ship command.*", { quoted: M });
        }
    }
};
