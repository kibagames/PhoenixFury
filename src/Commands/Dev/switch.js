module.exports = {
    name: 'switch',
    aliases: ['switch'],
    exp: 10,
    cool: 4,
    react: "✅",
    category: 'dev',
    description: 'Switches bot',
    async execute(client, arg, M) { 
        let Bot; // Declare the variable for storing the bot to switch to
        
        // Get the currently active bot from the database
        const activeBot = await client.DB.get(`${M.from}_ActiveBot`);
        
        // Get the argument context for switching bots
        const context = arg.trim(); // join args in case it's multiple words
        const options = ['all', 'everyone', 'bots'];
        
        // Determine the bot to switch to based on input or default to 'all'
        if (!context || options.includes(context.toLowerCase())) {
            Bot = 'all';
        } else {
            Bot = context.split(' ')[0].trim(); // Use first word of the argument
        }
        
        const name = client.name; // The current bot's name
        
        // Check if the bot being switched to is already active
        if (Bot === activeBot) {
            return M.reply(
                `🟨 ${Bot === 'all' ? '*Everyone* is' : Bot === name ? 'I am' : `*${Bot}* is`} already active.`
            );
        }
        
        // Update the active bot in the database
        await client.DB.set(`${M.from}_ActiveBot`, Bot);
        
        // Send confirmation message
        return M.reply(
            `🟩 ${Bot === name ? 'I am' : Bot === 'all' ? '*Everyone* is' : `*${Bot}* is`} active now.`
        );
    }
};
