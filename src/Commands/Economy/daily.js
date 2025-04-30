const axios = require("axios");
const ms = require('parse-ms');

module.exports = {
    name: 'daily',
    aliases: ['rewards'],
    category: 'economy',
    exp: 1,
    react: "✅",
    description: 'Claims your daily rewards',
    async execute(client, arg, M) {
        const dailyTimeout = 86400000; // 24 hours
        const baseDailyAmount = 1000;
        const userId = M.sender;
        let message = '';

        // Fetch economy data
        let economy = await client.econ.findOne({ userId });
        if (!economy) {
            economy = new client.econ({ userId, coin: 0, streak: 0, lastDailys: 0 });
        }

        const daily = economy.lastDailys;

        if (daily !== null && dailyTimeout - (Date.now() - daily) > 0) {
            const dailyTime = ms(dailyTimeout - (Date.now() - daily));
            message = `*You have already claimed your daily reward. Wait ${dailyTime.hours} hour(s), ${dailyTime.minutes} minute(s), and ${dailyTime.seconds} second(s).*`;
        } else {
            // Check streaks
            if (daily !== null && Date.now() - daily < 2 * dailyTimeout) {
                economy.streak = (economy.streak || 1) + 1;
            } else {
                economy.streak = 1; // Reset streak if missed 2 consecutive days
            }

            // Calculate reward
            const dailyAmount = baseDailyAmount * (1 + (economy.streak - 1) / 4);
            economy.coin += Math.floor(dailyAmount);
            economy.lastDailys = Date.now();

            // 50% chance for a bonus item or card
            const chance = Math.random();
            if (chance < 0.5) {
                if (chance < 0.25) {
                    const randomCard = await generateCard();
                    let deck = await client.card.get(`${userId.replace('.whatsapp.net', '')}_Deck`) || [];
                    deck.push(randomCard);
                    await client.card.set(`${userId.replace('.whatsapp.net', '')}_Deck`, deck);
                    message = `*You claimed 🎉 ${Math.floor(dailyAmount)} coins (Streak: ${economy.streak} days).*` +
                        `\n\nBonus Card:\n🃏 *${randomCard.name}* (Tier: ${randomCard.tier})`;
                } else {
                    const randomItem = await generateItem();
                    economy[randomItem] = (economy[randomItem] || 0) + 1;
                    message = `*You claimed 🎉 ${Math.floor(dailyAmount)} coins (Streak: ${economy.streak} days).*` +
                        `\n\nBonus Item: 🎁 *${randomItem}*`;
                }
            } else {
                message = `*You claimed 🎉 ${Math.floor(dailyAmount)} coins (Streak: ${economy.streak} days).*`;
            }

            await economy.save();
            
            // Ensure `client.groups.adminsGroup` exists before using
            if (client.groups && client.groups.modsGroup) {
                await client.sendMessage(client.groups.modsGroup, { 
                    text: `User @${M.sender.split('@')[0]} collected daily reward in ${M.from}`,
                    mentions: [M.sender]
                });
            }
        }

        return M.reply(message)
    },
};

// Function to get a valid random card
async function generateCard() {
    const url = `https://shiui-ff2daa3f5778.herokuapp.com/card/random`;
    let randomCard;

    do {
        const res = await axios.get(url);
        randomCard = res.data;
    } while (['5', '6', 'S'].includes(randomCard.tier)); // Exclude unwanted tiers

    return { name: randomCard.title, tier: randomCard.tier, source: randomCard.source, id: randomCard.id, image: randomCard.image };
}

// Function to get a random bonus item
async function generateItem() {
    const items = ['luckpotions', 'peppersprays'];
    return items[Math.floor(Math.random() * items.length)];
}
