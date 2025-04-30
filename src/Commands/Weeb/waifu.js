const axios = require('axios');

module.exports = {
    name: 'waifu',
    aliases: ['animegirl'],
    category: 'weeb',
    exp: 1,
    react: "✅",
    usage: 'Use :waifu',
    description: 'Sends an image of a random waifu',
    cool: 20, // Add cooldown time in seconds
    async execute(client, arg, M) { 

        try {
            const response = await axios.get('https://api.waifu.im/search/?included_tags=waifu');
            
            if (!response.data || !response.data.images || response.data.images.length === 0) {
                throw new Error('No waifu images found.');
            }
            
            const waifuImage = response.data.images[0];
            const caption = `Waifu searched from the web..\n\n© _Team Aurora𝄞`;

            await client.sendMessage(M.from, {
                image: {
                    url: waifuImage.url
                },
                caption: caption
            }, { quoted: M});
        } catch (error) {
            console.error('Error fetching waifu image:', error);
            M.reply('Failed to fetch waifu image.');
            client.log(error, 'red');
        }
    }
};
