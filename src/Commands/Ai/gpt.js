const { Hercai } = require("hercai");
const hercai = new Hercai();
const fs = require('fs').promises;
const path = require('path');

module.exports = {
    name: 'gpt',
    aliases: ['gpt'],
    category: 'Ai',
    exp: 2,
    cool: 4,
    react: "🤖",
    usage: 'Use :gpt <your text>',
    description: 'Your personal AI assistant to answer your questions.',
    async execute(client, arg, M) {

        if (!arg) {
            return M.reply('⚠️ Please provide some text for the AI to respond to.');
        }

        try {
            const [res] = await Promise.all([
                hercai.betaQuestion({ content: arg, user: M.sender }),
            ]);

            if (res && res.reply) {
               
                const thumbnailPath = path.join(__dirname, '..', '..', '..', 'assets', 'images', 'ai.png');
                const thumbnail = await fs.readFile(thumbnailPath);

                await client.sendMessage(M.from, {
                    text: `💡 Here what I found:\n\n${res.reply}`,
                    contextInfo: {
                        externalAdReply: {
                            title: `OpenAI GPT-4`,
                            body: 'Aurora 2024- AI Companion',
                            mediaType: 2,
                            thumbnail: thumbnail,
                            sourceUrl: ''
                        }
                    }
                });
            } else {
                await client.sendMessage(M.from, { text: '❌ No response received from the AI. Please try again later.' }, { quoted: M });
            }
        } catch (error) {
            console.error('Error fetching AI response:', error);
            await client.sendMessage(M.from, { text: '⚠️ There was an error retrieving the AI response. Please try again shortly.' }, { quoted: M });
        }
    }
};