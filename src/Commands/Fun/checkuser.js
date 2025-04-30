const checks = {
    'awesome': { emoji: '🌟', description: 'Incredible and awe-inspiring!' },
    'great': { emoji: '👍', description: 'A genuinely fantastic person!' },
    'gay': { emoji: '🏳️‍🌈', description: 'Radiating pride and joy!' },
    'cute': { emoji: '😺', description: 'Absolutely adorable!' },
    'lesbian': { emoji: '🏳️‍🌈', description: 'Celebrating identity and pride!' },
    'horny': { emoji: '🔥', description: 'Feeling a little spicy today!' },
    'pretty': { emoji: '💖', description: 'As pretty as a picture!' },
    'lovely': { emoji: '🌹', description: 'Charming and full of love!' },
    'ugly': { emoji: '😓', description: 'Beauty lies in the eye of the beholder!' },
    'beautiful': { emoji: '✨', description: 'Radiantly beautiful inside and out!' },
    'handsome': { emoji: '😎', description: 'A true stunner!' },
    'character': { emoji: '🎭', description: 'A personality that stands out!' }
};

module.exports = {
    name: 'checkuser',
    aliases: ['cu', ...Object.keys(checks).map(check => `${check}check`)],
    exp: 2,
    cool: 10,
    react: "✅",
    category: 'fun',
    usage: 'Use: <Your_Check>check',
    description: 'Checks the user with a specified characteristic',

    async execute(client, arg, M) {
        const text = arg.trim();
        const command = M.body.split(' ')[0].toLowerCase().slice(client.prefix.length).trim();

        // Display available checks if no text provided
        if (!text) {
            if (command === 'checkuser' || command === 'cu') {
                const CheckList = `🎃 *Available Checks:*

${Object.entries(checks)
                    .map(([key, value]) => `${value.emoji} ${client.utils.capitalize(key)}: ${value.description}`)
                    .join('\n')}

🛠️ *Usage:* ${client.prefix}check [tag/quote user] | ${
                    client.prefix
                }(check) [tag/quote user]\nExample: ${client.prefix}awesomecheck`;
                return await M.reply(CheckList);
            }
        }

        // Handle mentions
        if (M.quoted?.participant) M.mentions.push(M.quoted.participant);
        if (!M.mentions.length) M.mentions.push(M.sender);

        // Define personality types and quotes
        const types = [
            'Compassionate',
            'Generous',
            'Grumpy',
            'Forgiving',
            'Obedient',
            'Good',
            'Simp',
            'Kind-Hearted',
            'Patient',
            'UwU',
            'Top, anyway',
            'Helpful'
        ];
        const quotes = [
            'Keep shining bright!',
            'You’ve got this!',
            'Stay awesome!',
            'Keep being you!',
            'You’re one of a kind!'
        ];

        // Generate random character trait or percentage
        const character = types[Math.floor(Math.random() * types.length)];
        const percentage = Math.floor(Math.random() * 100) + 1;
        const sentence = command.split('check');
        const title = command.toUpperCase();

        // Get the check emoji and description
        const checkInfo = checks[title.replace('CHECK', '').toLowerCase()] || {};
        const emoji = checkInfo.emoji || '✨';
        const description = checkInfo.description || 'No description available.';

        // Craft the message based on the type of check
        const responseText = command === 'charactercheck'
            ? `*=======[${title}]=======*\n\n@${M.mentions[0].split('@')[0]} is ${percentage}% ${character}\n\n*Quote of the Day:* ${quotes[Math.floor(Math.random() * quotes.length)]}`
            : `*=======[${title}]=======*\n\n@${M.mentions[0].split('@')[0]} is ${percentage}% ${sentence[0]}\n${emoji} ${description}\n\n*Quote of the Day:* ${quotes[Math.floor(Math.random() * quotes.length)]}`;

        await client.sendMessage(
            M.from,
            {
                text: responseText,
                mentions: [M.mentions[0]]
            },
            { quoted: M }
        );
    }
};
