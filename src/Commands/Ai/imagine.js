const { Hercai } = require("hercai");
const hercai = new Hercai();
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'imagine',
    aliases: ['iai'],
    category: 'Ai',
    exp: 2,
    cool: 4,
    react: "🎨",
    usage: ':imagine <prompt>',
    description: 'Generates an AI image based on your prompt.',
    async execute(client, arg, M) {

        let prompt = arg;

        if (!prompt) {
            return M.reply('⚠️ Please provide a prompt for image generation.');
        }

        try {
            const [imageUrl] = await Promise.all([
                hercai.drawImage({
                    prompt,
                    negative_prompt: "no blur, no blood",
                    sampler: "DPM-Solver",
                    image_style: null,
                    width: 1024,
                    height: 1024,
                    steps: 20,
                    scale: 5
                }),
            ]);

            if (!imageUrl || !imageUrl.url) {
                return M.reply('❌ Unable to generate the image. Please try again later.');
            }

            const thumbnailPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'ai.png');
            const thumbnail = await fs.readFile(thumbnailPath);

            await client.sendMessage(M.from, {
                image: { url: imageUrl.url },
                caption: `🎨 Image generated successfully!`,
                contextInfo: {
                    externalAdReply: {
                        title: `Aurora Image Generater`,
                        body: 'Aurora 2025',
                        mediaType: 2,
                        thumbnail: thumbnail,
                        sourceUrl: ''
                    }
                }
            });
        } catch (error) {
            console.error('Error generating image:', error);
            return M.reply('🚨 An error occurred while generating the image. Please try again.');
        }
    }
};
