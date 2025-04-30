const { ranks } = require('../../Helpers/Stats'); // Adjusted to proper CommonJS syntax.

module.exports = {
    name: 'ranks',
    aliases: [],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :rank',
    description: 'Gives you your rank card',
    async execute(client, arg, M) {
        try {
            const keys = Object.keys(ranks); // No need for TypeScript-specific syntax.
            
            const text = `
🔧 *Ranks*

🌟 *Ranks are a way to display a user's progress in the yurie bots ecosystem.*
💚 *Ranking is based on the amount of Experience points a user has earned.*
🧧 *Ranking up will reward the user with credits and certain abilities.*

${keys
    .map(
        (key) =>
            `${ranks[key]}\n`
    )
    .join('\n')}
`;
            await M.reply(text);
        } catch (err) {
            console.error('Error executing ranks command:', err);
            await M.reply('⚠️ An error occurred while fetching ranks. Please try again later.');
        }
    }
};
