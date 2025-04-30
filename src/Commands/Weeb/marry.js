module.exports = {
    name: 'marry',
    aliases: [''],
    category: 'weeb',
    react: "✅",
    exp: 1,
    cool: 20, // Adding cooldown time in seconds
    usage: 'Use :marry',
    description: 'To marry the available haigusha',
    async execute(client, arg, M) {
        try {
            // Check if there is a haigusha to marry
            if (!client.haigushaResponse.has(M.from)) {
                return M.reply(
                    `There are no summoned haigusha to marry. Use *${client.prefix}haigusha* to summon one.`);
            }

            // Retrieve the current haigusha details
            const haigusha = client.haigushaResponse.get(M.from);

            // Check if the user is already married
            const userHaigusha = await client.DB.get(`${M.sender}_Haigusha`);
            if (userHaigusha && userHaigusha.married) return M.reply(`You are already married to ${userHaigusha.name}! Use :divorce`)

            // Check if the haigusha is already married to someone else
            const marriedList = await client.DB.get('married') || [];
            if (marriedList.some(entry => entry.slug === haigusha.name)) {
                const marriedTo = marriedList.find(entry => entry.slug === haigusha.name).married;
                return await client.sendMessage(M.from, { text: `💔 This haigusha is already married to @${marriedTo.split('@')[1]}.` });
            }

            // Set the haigusha as married to the current user
            await client.DB.set(`${M.sender}_Haigusha`, { ...haigusha, married: true });
            await client.DB.push('married', { slug: haigusha.name, married: M.sender });
            client.haigushaResponse.delete(M.from);

            // Send the marriage confirmation message
            await client.sendMessage(M.from, {
                text: `🎉 You are now married to *${haigusha.name}*!`
            },
             { quoted: M });

        } catch (error) {
            console.error('Error executing marry command:', error);
            return M.reply('⚠️ An error occurred while processing your marriage request. Please try again later.');
        }
    }
};
