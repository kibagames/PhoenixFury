module.exports = {
    name: 'image',
    aliases: ['getimage'],
    category: 'utils',
    exp: 1,
    react: "✅",
    usage: 'Use :image <search_content>',
    description: 'Searches for an image from the web',
    cool: 4, // Add cooldown time in seconds
    async execute(client, arg, M) {
        if (!arg) return await M.reply('Baka!! What image do you want?');

        // Split the argument into search term and amount
        const texas = arg.trim().split('|');
        const term = texas[0];
        const amount = parseInt(texas[1]);

        // Validate the amount
        if (!amount || isNaN(amount)) {
            return M.reply(
                `Give me the number, Baka!\n\nExample: *${client.prefix}image kakashi hatake|5*`
            );
        }

        // Limit the number of images to 20
        if (amount > 10) {
            return M.reply(`Do you want me to spam the group? I can only fetch up to 20 images.`);
        }

        // Fetch and send images
        for (let i = 0; i < amount; i++) {
            try {
                // Fetch the image URLs from the API
                const data = await client.utils.fetch(`https://weeb-api.vercel.app/gisearch?query=${term}`);

                // Check if data exists and has results
                if (!data || !data.length) {
                    return await M.reply('*404 Error! No results found.*');
                }

                // Get a random image from the results
                const randomImage = data[Math.floor(Math.random() * data.length)];
                const buffer = await client.utils.getBuffer(randomImage);

                // Send the image buffer
                client.sendMessage(M.from, { image: buffer }, { quoted: M})
            } catch (error) {
                console.error(error);
                return M.reply('❌ An error occurred while fetching the image. Please try again later.');
            }
        }
    }
};
