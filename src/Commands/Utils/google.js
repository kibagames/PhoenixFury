const axios = require('axios');

module.exports = {
    name: 'google',
    aliases: ['google'],
    category: 'utils',
    exp: 1,
    react: "✅",
    usage: 'Use :google <search_content>',
    description: 'Searches for content from Google Custom Search API',
    cool: 4, // Add cooldown time in seconds
    async execute(client, arg, M) {
        if (!arg) {
            return M.reply('🔎 Provide a search term');
        }

        const term = arg.trim();
        try {
            const res = await axios.get(
                `https://www.googleapis.com/customsearch/v1?q=${term}&key=AIzaSyABA9H2sDYVwY0sDE7bqYUxihdixoL3ozM&cx=baf9bdb0c631236e5`
            );

            if (res.status !== 200) {
                return M.reply(`🔍 Error: Received status ${res.status}`);
            }

            if (!res.data?.items || res.data.items.length === 0) {
                return M.reply(`🔍 No results found for "${term}".`);
            }

            let result = '';
            let index = 1;
            for (const item of res.data.items) {
                result += `*👾${index}. Title*: ${item.title}\n*🔗 Link*: ${item.link}\n*📖 Snippet*: ${item.snippet}\n\n`;
                index++;
            }

            return M.reply(`🔍 Result for *${term}*:\n\n${result}`);

        } catch (err) {
            console.error(err);
            return M.reply(`🔍 Error: ${err.message || err}`);
        }
    }
};
