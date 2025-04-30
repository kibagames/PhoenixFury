const { getStats } = require('../../Helpers/Stats');
const sortArray = require('sort-array');

module.exports = {
    name: 'leaderboard',
    aliases: ['lb'],
    category: 'core',
    exp: 1,
    cool: 4,
    react: "✅",
    usage: 'Use :lb --coins/--cards/--pokemons/--ap/--auctions',
    description: "Displays global leaderboard of Aurora bot in various types",
    async execute(client, arg, M) {
        try {
            if (arg.includes('--coins')) {
                const allUsers = await client.econ.find({});
                const users = allUsers.map(user => ({
                    user: user.userId,
                    coins: user.coin + user.treasurys,
                    coin: user.coin,
                    treasury: user.treasurys
                }));
                const lb = sortArray(users, { by: 'coins', order: 'desc' });
                const topUsers = lb.slice(0, 10);

                let text = `☆☆💥 **GLOBAL LEADERBOARD (COINS)** 💥☆☆\n`;
                
                for (let i = 0; i < topUsers.length; i++) {
                    const username = topUsers[i].user.split('@')[0];
                    text += `\n\n*(${i + 1})*\n`;
                    text += `⛩ **Username:** ${username}\n`;
                    text += `💰 **Total Coins:** ${topUsers[i].coins}\n`;
                    text += `⚫ **Coins:** ${topUsers[i].coin}  | 🏦 **Treasury:** ${topUsers[i].treasury}`;
                }

                return client.sendMessage(
                    M.from,
                    {
                        image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                        caption: text,
                        gifPlayback: true,
                        mentions: topUsers.map(user => user.user)
                    },
                    { quoted: M }
                );
            } else if (arg.includes('--cards')) {
                const allUsers = await client.card.all();
                const users = allUsers.map(user => {
                    const { net_Deck = [], net_Collection = [] } = user.value.whatsapp || {};
                    return {
                        user: user.id,
                        totalCards: net_Deck.length + net_Collection.length
                    };
                });
                const lb = sortArray(users, { by: 'totalCards', order: 'desc' });
                const topUsers = lb.slice(0, 10);

                let text = `☆☆💥 **GLOBAL LEADERBOARD (CARDS)** 💥☆☆\n`;

                for (let i = 0; i < topUsers.length; i++) {
                    const user = topUsers[i].user.split('@')[0];
                    text += `\n\n*(${i + 1})*\n`;
                    text += `⛩ **Username:** @${user}\n`;
                    text += `📇 **Total Cards:** ${topUsers[i].totalCards}\n`;
                }

                return client.sendMessage(
                    M.from,
                    {
                        image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                        caption: text,
                        gifPlayback: true,
                        mentions: topUsers.map(user => user.user)
                    },
                    { quoted: M }
                );
            } else if (arg.includes('--pokemons')) {
                const allUsers = await client.pkmn.all();
                const users = allUsers.map(user => {
                    const { net_Party = [], net_PC = [] } = user.value.whatsapp || {};
                    return {
                        user: user.id,
                        totalPokemons: net_Party.length + net_PC.length
                    };
                });
                const lb = sortArray(users, { by: 'totalPokemons', order: 'desc' });
                const topUsers = lb.slice(0, 10);

                let text = `☆☆💥 **GLOBAL LEADERBOARD (POKEMONS)** 💥☆☆\n`;

                for (let i = 0; i < topUsers.length; i++) {
                    const user = topUsers[i].user.split('@')[0];
                    text += `\n\n*(${i + 1})*\n`;
                    text += `⛩ **Username:** @${user}\n`;
                    text += `🔢 **Total Pokemons:** ${topUsers[i].totalPokemons}\n`;
                }

                return client.sendMessage(
                    M.from,
                    {
                        image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                        caption: text,
                        gifPlayback: true,
                        mentions: topUsers.map(user => user.user)
                    },
                    { quoted: M }
                );
            } else if (arg.includes('--ap')) {
                const allUsers = await client.act.all();
                const users = allUsers.map(user => {
                    const { net_Points = [] } = user.value.whatsapp || {};
                    return {
                        user: user.id,
                        totalAP: net_Points
                    };
                });
                const lb = sortArray(users, { by: 'totalAP', order: 'desc' });
                const topUsers = lb.slice(0, 10);

                let text = `☆☆💥 **GLOBAL LEADERBOARD (Active-Points)** 💥☆☆\n`;

                for (let i = 0; i < topUsers.length; i++) {
                    const user = topUsers[i].user.split('@')[0];
                    text += `\n\n*(${i + 1})*\n`;
                    text += `⛩ **Username:** @${user}\n`;
                    text += `🎯 **Active Points:** ${topUsers[i].totalAP}\n`;
                }

                return client.sendMessage(
                    M.from,
                    {
                        image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                        caption: text,
                        gifPlayback: true,
                        mentions: topUsers.map(user => user.user)
                    },
                    { quoted: M }
                );
            } else if (arg.includes('--auctions')) {
                const allUsers = await client.DB.all();
                const users = allUsers.map(user => {
                    const { net_Auction = [] } = user.value.whatsapp || {};
                    return {
                        user: user.id,
                        totalAuctions: net_Auction
                    };
                });
                const lb = sortArray(users, { by: 'totalAuctions', order: 'desc' });
                const topUsers = lb.slice(0, 10);

                let text = `☆☆💥 **GLOBAL LEADERBOARD (Auctions)** 💥☆☆\n`;

                for (let i = 0; i < topUsers.length; i++) {
                    const user = topUsers[i].user.split('@')[0];
                    text += `\n\n*(${i + 1})*\n`;
                    text += `⛩ **Username:** @${user}\n`;
                    text += `⚖️ **Auctions Won:** ${topUsers[i].totalAuctions}\n`;
                }

                return client.sendMessage(
                    M.from,
                    {
                        image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                        caption: text,
                        gifPlayback: true,
                        mentions: topUsers.map(user => user.user)
                    },
                    { quoted: M }
                );
            }

            const exp = Object.values(await client.exp.all()) ?? [];
            if (exp.length === 0) {
                return M.reply('🟥 **There are no users with XP**');
            }

            const users = exp.map((x) => ({
                user: x.id,
                xp: x.value?.whatsapp?.net ?? 0
            }));
            const lb = sortArray(users, { by: 'xp', order: 'desc' });
            const myPosition = lb.findIndex((x) => x.user === M.sender.split('@')[0]);
            const topUsers = lb.slice(0, 10);

            let text = `☆☆💥 **GLOBAL LEADERBOARD (XP)** 💥☆☆\n\n`;

            for (let i = 0; i < topUsers.length; i++) {
                const level = (await client.DB.get(`${topUsers[i].user}.whatsapp.net_LEVEL`)) ?? 1;
                const { rank } = getStats(level);
                const user = topUsers[i].user.split('@')[0]; 
                
                text += `\n\n*(${i + 1})*\n`;
                text += `⛩ **Username:** @@${user}\n`;
                text += `〽️ **Level:** ${level}\n`;
                text += `🎡 **Rank:** ${rank}\n`;
                text += `⭐ **Exp:** ${topUsers[i].xp}\n`;
            }

            client.sendMessage(
                M.from,
                {
                    image: { url: 'https://i.ibb.co/tPhb428/Aurora.jpg' },
                    caption: text,
                    gifPlayback: true
                },
                { quoted: M }
            );
        } catch (error) {
            console.error('Error in leaderboard command:', error);
            M.reply('🟥 **An error occurred while fetching the leaderboard.**');
        }
    }
};
