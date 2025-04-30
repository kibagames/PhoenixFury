const axios = require('axios');
const cheerio = require('cheerio');

module.exports = {
    name: 'voice',
    aliases: ['av'],
    category: 'Ai',
    exp: 2,
    cool: 4,
    react: "🍥",
    usage: 'Use :voice with url or text.',
    description: 'Sends random sound effects from Ai',
    async execute(client, arg, M) {
        const baseUrl = 'https://www.myinstants.com';
        const searchUrl = 'https://www.myinstants.com/search/?name=';

        // Main command execution function
        const text = arg.trim();
        if (!text) {
            return await M.reply('🟥 Search Term is required');
        }

        try {
            const url = await search(text);
            if (!url) {
                return await M.reply(`🟥 No results for "${text}"`);
            }
              console.log(url)
              await client.sendMessage(
                M.from,
                {
                    audio: { url: url },
                    mimetype: 'audio/mpeg',
                    fileName: `${text}.mp3`,
                },
                {
                    quoted: M,
                }
            );
        } catch (error) {
            console.error('Error fetching sound effect:', error);
            await M.reply("❗ An error occurred while fetching the sound effect.");
        }

        // Function to search for sound URL
        async function search(term) {
            try {
                const response = await axios.get(searchUrl + encodeURIComponent(term));
                const html = response.data;
                const $ = cheerio.load(html);
                const resultDiv = $('#instants_container');
                const attrs = resultDiv.find('.instant').first().find('.small-button').first().attr();

                if (!attrs || !attrs.onclick) return null;
                return getFormattedUrl(attrs.onclick);
            } catch (error) {
                console.error('Error during search:', error);
                return null;
            }
        }

        // Format URL from onclick attribute
        function getFormattedUrl(onclick) {
            return baseUrl + onclick.split("'")[1];
        }
    }
};
