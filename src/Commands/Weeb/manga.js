const { Manga } = require('@shineiichijo/marika');
const axios = require('axios');

module.exports = {
    name: 'manga',
    aliases: ['manga'],
    category: 'weeb',
    exp: 1,
    cool: 15,
    react: "✅",
    usage: 'Use :manga <manga_name>',
    description: 'Gives you the info about the manga that you provided',
    async execute(client, arg, M) {
        if (!arg) return void M.reply('Provide a query for the search, Baka!');
        const query = arg.trim();
        try {
            const { data } = await new Manga().searchManga(query);
            const result = data[0];
            let text = '';
            text += `🎀 *Title:* ${result.title}\n`;
            text += `🎋 *Format:* ${result.type}\n`;
            text += `📈 *Status:* ${client.utils.capitalize(result.status.replace(/\_/g, ' '))}\n`;
            text += `🍥 *Total chapters:* ${result.chapters}\n`;
            text += `🎈 *Total volumes:* ${result.volumes}\n`;
            text += `🧧 *Genres:* ${result.genres.map((genre) => genre.name).join(', ')}\n`;
            text += `💫 *Published on:* ${result.published.from}\n`;
            text += `🎗 *Ended on:* ${result.published.to}\n`;
            text += `🎐 *Popularity:* ${result.popularity}\n`;
            text += `🎏 *Favorites:* ${result.favorites}\n`;
            text += `🏅 *Rank:* ${result.rank}\n\n`;
            if (result.background !== null) text += `🎆 *Background:* ${result.background}*\n\n`;
            text += `❄ *Description:* ${result.synopsis}\n\n`;
            const imageUrl = result.images.jpg.large_image_url;
            const imageResponse = await axios.get(imageUrl, { responseType: 'arraybuffer' });
            const imageBuffer = Buffer.from(imageResponse.data, 'binary');
    
            await client.sendMessage(
                M.from,
                {
                    image: imageBuffer,
                    caption: text,
                    contextInfo: {
                        externalAdReply: {
                            title: result.title,
                            mediaType: 1,
                            thumbnail: imageBuffer,
                            sourceUrl: result.url
                        }
                    }
                },
                {
                    quoted: M
                }
            )
        } catch (err) {
            console.error('Error fetching manga information:', err);
            M.reply('An error occurred while fetching manga information.');
        }
    }
};
