const axios = require('axios');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const key = 'AIzaSyCyouca1_KKy4W_MG1xsPzuku5oa8W358c';

module.exports = {
    name: 'getsticker',
    aliases: ['gsticker'],
    category: 'utils',
    exp: 1,
    react: "✅",
    usage: 'Use :getsticker <search_content>',
    description: 'Searches for a GIF from the web and converts it into a sticker',
    cool: 4, // Cooldown time in seconds
    async execute(client, arg, M) {
        try {
            if (!arg) return M.reply('Please provide a search term.');

            let gifResponse = await axios.get(
                `https://tenor.googleapis.com/v2/search?q=${encodeURIComponent(arg)}&key=${key}&client_key=my_project&limit=8&media_filter=gif`
            );

            if (!gifResponse.data.results || gifResponse.data.results.length === 0) {
                return M.reply('No GIFs found for the provided search term.');
            }

            let resultIndex = Math.floor(Math.random() * gifResponse.data.results.length);
            let gifUrl = gifResponse.data.results[resultIndex].media_formats.gif.url;

            let response = await axios.get(gifUrl, {
                responseType: "arraybuffer",
            });
            let buffer = Buffer.from(response.data, "binary");

            let stickerMess = new Sticker(buffer, {
                pack: 'MyPack', // Replace with your pack name
                author: M.pushName, // Replace with the author's name or username
                type: StickerTypes.FULL,
                categories: ["🤩", "🎉"],
                id: "12345",
                quality: 60,
                background: "transparent",
            });

            let stickerBuffer = await stickerMess.toBuffer();
            await client.sendMessage(M.from, { sticker: stickerBuffer }, { quoted: M });
        } catch (error) {
            console.error(error);
            M.reply('An error occurred while searching for the GIF or creating the sticker.');
        }
    }
};
