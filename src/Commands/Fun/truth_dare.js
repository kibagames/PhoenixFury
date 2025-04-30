const TD = require('better-tord');

module.exports = {
    name: 'truth_dare',
    aliases: ['td'],
    category: 'fun',
    exp: 2,
    cool: 10,
    react: "✅",
    usage: 'Use :td truth or dare',
    description: 'Gives you truth or dare.',
    async execute(client, arg, M) {
        if (!arg) return M.reply('Please specify "truth" or "dare"!');
        
        const availableOptions = ['truth', 'dare'];
        const option = arg.trim().toLowerCase();

        try {
            const result = option === 'truth' ? await TD.get_truth() : await TD.get_dare();
            M.reply(`Here's your ${option}: ${result}`);
        } catch (error) {
            console.error('Error fetching truth or dare:', error);
            message.reply('Sorry, I couldn\'t fetch a truth or dare at the moment. Please try again later.');
        }
    }
};
