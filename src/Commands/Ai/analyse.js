const { getDisplayUrl } = require('../../lib/upload.js');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

module.exports = {
    name: 'analyse',
    aliases: ['aai'],
    category: 'Ai',
    exp: 2,
    cool: 4,
    react: "🖼️",
    usage: 'Use :analyse <quote with picture>',
    description: 'Extracts and analyzes text from an image using AI tools.',
    async execute(client, arg, M) {
       const content = JSON.stringify(M.quoted)
        const isMedia = M.type === 'imageMessage' || M.type === 'videoMessage'
        const isQuoted =
            (M.type === 'extendedTextMessage' && content.includes('imageMessage')) ||
            (M.type === 'extendedTextMessage' && content.includes('videoMessage'))
        
        if (isMedia || isQuoted) {
            try {
                const base64 = await bufferToBase64(isQuoted ? await M.quoted.download() : await M.download());
                const icon = await getDisplayUrl(base64);
                
                const { data } = await axios.get(
                    `https://api.ocr.space/parse/imageurl?apikey=K86862197988957&url=${icon}&language=eng&isOverlayRequired=false`
                );

                const thumbnailPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'ai.png');
                const thumbnail = await fs.readFile(thumbnailPath);

                const parsedText = data.ParsedResults.map(({ ParsedText }) => ParsedText).join('\n\n');
                
                await client.sendMessage(M.from, {
                    text: `📝 *Here is the analyzed text from the image:*\n\n${parsedText || 'No text detected.'}`,
                    contextInfo: {
                        externalAdReply: {
                            title: `Aurora Image Analyser`,
                            body: 'Aurora 2025',
                            mediaType: 2,
                            thumbnail: thumbnail,
                            sourceUrl: ''
                        }
                    }
                });
            } catch (error) {
                console.error('Error during image analysis:', error);
                await client.sendMessage(M.from, { text: '⚠️ Error analyzing the image. Please try again.' });
            }
        } else {
            M.reply('⚠️ Please send an image or quote an image for analysis.');
        }

        async function bufferToBase64(buffer) {
            return Buffer.from(buffer).toString('base64');
        }
    }
};