const axios = require('axios');

module.exports = {
    name: 'pinterest',
    aliases: ['pin'],
    category: 'media',
    exp: 2,
    cool: 4,
    react: "✅",
    usage: 'Use :pinterest <search_term> | <amount>',
    description: 'Fetches an image from Pinterest based on the given search term, and optionally the number of images (default is a random image starting from the 3rd one).',
    async execute(client, arg, M) {
        try {
            if (!arg || arg.length < 1) {
                return M.reply('❌ Please provide a search term.');
            }

            // Extract the search term and amount if specified
            const [searchTerm, amount] = arg.split('|').map(i => i.trim());
            if (!searchTerm) {
                return M.reply('❌ Please provide a valid search term.');
            }

            const imageCount = parseInt(amount) || 0;
            if (imageCount < 3 && imageCount !== 0) {
                return M.reply('❌ The amount should be 3 or higher.');
            }

            M.reply('🔍 Searching for images, please wait...');

            // Fetch data from the Pinterest API
            const response = await axios.get(`https://weeb-api.vercel.app/pinterest?query=${encodeURIComponent(searchTerm)}`);
            const images = response.data;

            if (!Array.isArray(images) || images.length < 3) {
                return M.reply('❌ No images found for the given search term.');
            }

            // Filter only image-type data
            const validImages = images.filter(item => item.type === 'image');
            if (validImages.length < 3) {
                return M.reply('❌ Insufficient image results found.');
            }

            // Determine which images to send
            let imagesToSend;
            if (imageCount > 0) {
                imagesToSend = validImages.slice(3, 3 + imageCount); // Start from the 3rd image
            } else {
                // Default behavior: Pick a random image from 3rd onwards
                const randomIndex = Math.floor(Math.random() * (validImages.length - 3)) + 3;
                imagesToSend = [validImages[randomIndex]];
            }

            // Send each image to the user
            for (let image of imagesToSend) {
                await client.sendMessage(M.from, {
                    image: { url: image.original },
                    caption: `🖼️ **${image.title || 'No Title'}**\n👤 By: ${image.pinner.name} (@${image.pinner.username})\n🔗 [Source](${image.url})`,
                }, { quoted: M });
            }
        } catch (error) {
            console.error(error);
            M.reply('❌ An error occurred while fetching the images from Pinterest.');
        }
    }
};
