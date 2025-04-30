module.exports = {
    name: 'backgrounds',
    aliases: ['bg'],
    exp: 1,
    cool: 4,
    react: "✅",
    category: 'cards',
    usage: 'Use :background or :bg <index> to view, :bg --set <index> to set, or :bg --reset to reset.',
    description: 'Displays owned backgrounds, allows viewing specific ones, and sets or resets the deck background.',
    async execute(client, arg, M) {
        try {
            // Fetch backgrounds and handle if none exist
            const backgrounds = await client.DB.get(`${M.sender}_Background`) || [];
            if (!backgrounds.length) return M.reply("🟥 *You have no backgrounds!*");

            // Show list if no argument provided
            if (!arg.length) {
                let bgList = `*🃏 Your Backgrounds:*\n\n`;
                backgrounds.forEach((bg, index) => {
                    bgList += `${index + 1}) ${bg.name}\n`;
                });
                return M.reply(bgList);
            }

            // Check for '--set' argument
            if (arg.includes('--set')) {
                const index = parseInt(arg.split('--set ')[1]) - 1;
                if (isNaN(index) || index < 0 || index >= backgrounds.length) {
                    return M.reply(`❌ *Invalid index!* Choose from 1 to ${backgrounds.length}.`);
                }

                const selectedBG = backgrounds[index];
                await client.DB.set(`${M.sender}_BG`, selectedBG);
                return M.reply(`✅ *Background set to:* ${selectedBG.name}`);
            }

            // Check for '--reset' argument
            if (arg.includes('--reset')) {
                await client.DB.delete(`${M.sender}_BG`);
                return M.reply("🟩 *Background reset to default.*");
            }

            // Display background if index number is provided
            const index = parseInt(arg[0]) - 1;
            if (!isNaN(index) && index >= 0 && index < backgrounds.length) {
                const selectedBG = backgrounds[index];
                return await client.sendMessage(M.from, {
                    image: { url: selectedBG.url },
                    caption: `🃏 *Viewing Background:*\n${selectedBG.name}`
                }, { quoted: M });
            } else {
                return M.reply("❌ *Invalid command!* Use a valid index, `--set <index>`, or `--reset`.");
            }

        } catch (error) {
            console.error("Error in backgrounds command:", error);
            M.reply("An error occurred while processing backgrounds.");
        }
    }
};
