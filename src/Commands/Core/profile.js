const { getStats } = require('../../Helpers/Stats');

module.exports = {
    name: 'profile',
    aliases: ['p'],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "👀",
    usage: 'Use :p to get your profile',
    description: 'Gives you your stats',
    async execute(client, arg, M) {
        const groupMetadata = await client.groupMetadata(M.from);
        const groupMembers = groupMetadata?.participants || [];

        // Updated admin check based on new metadata structure
        const groupAdmins = groupMembers
            .filter((v) => v.admin === 'admin' || v.admin === 'superadmin')
            .map((v) => v.id);

        const user = M.quoted?.participant || M.mentions?.[0] || M.sender;
        const collection = (await client.card.get(`${user.replace('.whatsapp.net', '')}_Collection`)) || [];
        const deck = (await client.card.get(`${user.replace('.whatsapp.net', '')}_Deck`)) || [];
        const party = (await client.pkmn.get(`${user}_Party`)) || [];
        const economy = await client.econ.findOne({ userId: user });

        const wallet = economy?.coin || 0;
        const cardList = [...deck, ...collection];

        // Fetch profile picture
        let pfp;
        try {
            pfp = await client.profilePictureUrl(user, 'image');
        } catch {
            pfp = 'https://i.ibb.co/nbdh1ZM/Aurora-error.jpg'; // Default profile picture
        }

        // Check for custom icon
        const customIcon = await client.DB.get(`${user}_icon`);
        if (customIcon) pfp = customIcon;

        // Check for custom bio
        let bio;
        const customBio = await client.DB.get(`${user}_bio`);
        if (customBio) {
            bio = customBio;
        } else {
            try {
                bio = (await client.fetchStatus(user))?.status || 'I am an Auronian.....';
            } catch {
                bio = 'I am an Auronian.....';
            }
        }

        // Custom username or default username
        const customUsername = await client.DB.get(`${user}_username`);
        const username =
            customUsername || (await client.contact.getContact(user, client))?.username || 'Unknown User';

        const level = (await client.DB.get(`${user}_LEVEL`)) || 1;
        const stats = getStats(level);
        const experience = (await client.exp.get(user)) || 0;
        const banned = (await client.DB.get('banned')) || [];
        const bannedUser = banned.find((b) => b.user === user);
        const userHaigusha = await client.DB.get(`${user}_Haigusha`) || 'Single';

        // Construct profile text
        const text = [
            `💠 *Username:* ${username}`,
            `🪄 *Bio:* ${bio}`,
            `🎊 *Level:* ${level}`,
            `🌟 *XP:* ${experience}`,
            `📍 *Rank:* ${stats.rank}`,
            `👑 *Admin:* ${groupAdmins.includes(user) ? 'True' : 'False'}`,
            `🔴 *Ban:* ${bannedUser ? 'True' : 'False'}`,
            `💍 *Haigusha:* ${userHaigusha.name}`,
            `🪙 *Coins:* ${wallet}`,
            `🃏 *Cards:* ${cardList.length}`,
            `🧣 *Party:* ${party.length}`
        ].join('\n\n');

        // Send message with profile picture or fallback
        const message = pfp.endsWith('.mp4')
            ? {
                  video: { url: pfp },
                  gifPlayback: true,
                  caption: text
              }
            : {
                  text: text
              };

        await client.sendMessage(M.from, message, { quoted: M });
    }
};
