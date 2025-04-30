const fetchWallpapers = require('../../lib/wallpaper');

module.exports = {
    name: 'wallpaper',
    aliases: ['wall'],
    category: 'utils',
    exp: 1,
    react: "✅",
    usage: 'Use :wallpaper <query>',
    description: 'Fetches and sends a wallpaper based on the search query.',
    cool: 4, // Cooldown time in seconds
    async execute(client, arg, M) {
        const query = arg.trim();

        // Fetch wallpapers
        const wallpapers = await fetchWallpapers(query);

        if (wallpapers.length === 0) {
            return M.reply(`Couldn't find any wallpaper for the query: *"${query}"*`);
        }

        // Send the first wallpaper as an image
        const buffer = await client.utils.getBuffer(wallpapers[0]);
        return client.sendMessage(M.from, { image: buffer, caption: `Here is your wallpaper for: *"${query}"*` }, { quoted: M });
    }
};
