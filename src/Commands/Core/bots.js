module.exports = {
    name: 'bots',
    aliases: ['bot'],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :bots',
    description: 'Get bot information and currently active bot status',
    async execute(client, arg, M) {
        // List of bot numbers and their names (ensure names match PM2 process names)
        const bots = [
            { id: "918961331275@s.whatsapp.net", name: "Hinata" },
            { id: "918146455323@s.whatsapp.net", name: "Mikasa" },
            { id: "255785546206@s.whatsapp.net", name: "Akeno" }
        ];

        // Intro text for the bot list
        let text = `🤖 *yurie Bots* 🤖\n\n`;

        // Loop through each bot and add their name and wa.me/ number link
        bots.forEach(bot => {
            const waLink = `https://wa.me/${bot.id.split('@')[0]}`;  // Format as wa.me/ link
            text += `*${bot.name}*\nContact: ${waLink}\n\n`;
        });

        // Send the message with the bot list
        await client.sendMessage(M.from, {
            text: text
        }, { quoted: M });
    }
};
