module.exports = {
    name: 'divorce',
    aliases: [], // Use an empty array if no aliases are needed
    category: 'weeb',
    react: "💔",
    exp: 1,
    cool: 20, // Cooldown time in seconds
    usage: 'Use :divorce',
    description: 'To divorce your current haigusha',
    async execute(client, arg, M) {
        try {
            // Retrieve the current haigusha details for the user
            const userHaigusha = await client.DB.get(`${M.sender}_Haigusha`);
            
            // Check if the user is married
            if (!userHaigusha || !userHaigusha.married) {
                return await client.sendMessage(M.from, {
                    text: `You are not currently married to any haigusha. Use *${client.prefix}haigusha* to summon one.`
                });
            }

            // Retrieve the list of married haigusha
            const marriedList = await client.DB.get('married') || [];

            // Find and remove the haigusha from the married list
            const index = marriedList.findIndex(entry => 
                entry.slug === userHaigusha.name && entry.married === M.sender
            );

            if (index !== -1) {
                marriedList.splice(index, 1);
                await client.DB.set('married', marriedList);
            }

            // Reset the user's haigusha status
            await client.DB.delete(`${M.sender}_Haigusha`);

            // Send the divorce confirmation message
            return await client.sendMessage(M.from, {
                text: `💔 You have divorced *${userHaigusha.name}*. They will no longer be available for marriage.`
            },
            { quoted: M });
        } catch (error) {
            console.error(error);
            return M.reply('An error occurred while processing your request. Please try again later.');
        }
    }
};
