module.exports = {
    name: 'wife',
    aliases: ['husband'],
    category: 'weeb',
    react: "💍",
    exp: 1,
    cool: 20, // Adding cooldown time in seconds
    usage: 'Use :wife',
    description: 'Displays details of your current haigusha wife along with who they are married to',
    async execute(client, arg, M) {
        try {
            // Retrieve the current haigusha details for the user
            const userHaigusha = await client.DB.get(`${M.sender}_Haigusha`);
            
            // Check if the user is married
            if (!userHaigusha || !userHaigusha.married) {
                return M.reply( 
                    `You are not currently married to any haigusha. Use *${client.prefix}haigusha* to summon one.`);
            }

            // Retrieve the list of married haigusha
            const marriedList = await client.DB.get('married');
            
            // Find the current haigusha in the married list
            const marriedEntry = marriedList.find(entry => entry.slug === userHaigusha.name && entry.married === M.sender);
            if (!marriedEntry) {
                return M.reply(`⚠️ There was an issue retrieving your wife details. Please try again later.`);
            }

            // Get the profile picture of the user
            let pfp;
            try {
                pfp = await client.utils.getBuffer(
                    (await client.profilePictureUrl(M.sender, 'image')) || 'https://i.ibb.co/nbdh1ZM/Aurora-error.jpg'
                );
            } catch (error) {
                pfp = await client.utils.getBuffer('https://i.ibb.co/nbdh1ZM/Aurora-error.jpg');
            }

            // Get the wife's image and details
            const wifeImage = await client.utils.getBuffer(userHaigusha.image);
            const wifeName = userHaigusha.name;
            const wifeDescription = userHaigusha.about;

            // Create the message text
            const text = `💍 *Your Wife Details:*\n\n`
                        + `👩‍❤️‍👨 *Wife:* ${wifeName}\n\n`
                        + `♦️ *Description:* ${wifeDescription}\n\n`
                        + `🔗 *Married To:* ${marriedEntry.married.split('@')[0]}`;

            // Send the message with the wife's image and details
            await client.sendMessage(M.from, {
                image: wifeImage,
                caption: text,
                jpegThumbnail: wifeImage.toString('base64')
            },
                                    {
                quoted: M
            }
                                    );

        } catch (error) {
            console.error('Error executing wife command:', error);
            await client.sendMessage(M.from, '⚠️ An error occurred while retrieving your wife details. Please try again later.');
        }
    }
};

    
    