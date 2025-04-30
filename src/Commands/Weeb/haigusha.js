const axios = require('axios');

module.exports = {
    name: 'haigusha',
    aliases: ['hg'],
    category: 'weeb',
    react: "✅",
    exp: 1,
    cool: 20, // Adding cooldown time in seconds
    usage: 'Use :haigusha',
    description: 'Provides a random haigusha to marry',
    async execute(client, arg, M) {
        try {
            // Fetch random haigusha details from the API
            const { data: haigusha } = await axios.get('https://shiui-ff2daa3f5778.herokuapp.com/haigusha');

            // Extract appearance details from the haigusha source
            const appearances = haigusha.source;

            // Store the haigusha response for future use
            await client.haigushaResponse.set(M.from, haigusha);

            // Construct the response message with haigusha details
            let text = `🎐 *Name:* ${haigusha.name}\n\n`;
            text += `♦️ *Appearance:* ${appearances}\n\n❄ *Description:* ${haigusha.about}`;

            // Fetch the image buffer
            const buffer = await client.utils.getBuffer(haigusha.image);

            // Send the message with the image and caption
            await client.sendMessage(M.from, {
                image: buffer,
                caption: text,
                jpegThumbnail: buffer.toString('base64'), // Send a base64 thumbnail
                contextInfo: {
                    externalAdReply: {
                        title: haigusha.name,
                        body: "Aurora ©2024",
                        mediaType: 1,
                        thumbnail: buffer, // Thumbnail image
                        sourceUrl: `https://mywaifulist.moe/waifu/${haigusha.name}` // Link to more haigusha info
                    }
                }
            }, { quoted: M });
        } catch (error) {
            console.error('Error executing haigusha command:', error);
            await client.sendMessage(M.from, '⚠️ Failed to retrieve haigusha details. Please try again later.');
        }
    }
};
