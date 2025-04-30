const axios = require('axios');

module.exports = {
    name: 'neko',
    aliases: ['catgirl'],
    category: 'weeb',
    exp: 1,
    cool: 20,
    react: "✅",
    usage: 'Use :neko',
    description: 'Sends an image of a random neko',
    async execute(client, arg, M) {
        try {
            const res = await axios.get(`https://api.waifu.pics/sfw/neko`);
            if (!res.data || !res.data.url) {
                throw new Error('Failed to fetch neko image.');
            }
            await client.sendMessage(M.from, {
                image: {
                    url: res.data.url
                },
                caption: '_Neko Neko Ni~_ \n\n © _Team Aurora𝄞'
            }, { quoted: M });
        } catch (err) {
            console.error('Error fetching neko image:', err);
            M.reply('Failed to fetch neko image.');
            client.log(err, 'red');
        }
    }
};
