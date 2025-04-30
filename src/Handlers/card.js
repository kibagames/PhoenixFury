const axios = require('axios');
const cron = require("node-cron");

module.exports = cardHandler = async (client, m) => {
    try {
        let cardgames = await client.DB.get('cards');
        const cardgame = cardgames || [];

        if (cardgame.length === 0) {
            console.log("No groups found for card spawner.");
            return;
        }

        // Schedule card spawns every 60 minutes
        cron.schedule('*/60 * * * *', async () => {
            console.log("⏳ Card spawner triggered.");
            
            for (const jid of cardgame) {
                try {
                    const url = `https://shiui-ff2daa3f5778.herokuapp.com/card/random`;
                    const res = await axios.get(url);

                    const { title, tier, source, id, image } = res.data;

                    // Skip cards of tier 'S' or '6'
                    if (tier === 'S' || tier === '6' || tier === '5') {
                        console.log(`🚫 Skipping card spawn for tier ${tier}: ${title}`);
                        continue;
                    }

                    const price = client.utils.calculatePrice(tier);

                    // Generate a captcha
                    const captcha = generateCaptcha();

                    console.log(`🎴 Card Spawned: ${title} | Tier: ${tier} | Group: ${jid}`);
                    
                    // Notify moderators
                    client.sendMessage(client.groups.modsGroup, {
                        text: `📢 *New Card Sent*:\n\nTier: ${tier}\nName: ${title}\nPrice: ${price} Coins\n`,
                    });

                    const i = await client.utils.getBuffer(image);

                    // Store card in memory
                    await client.cardMap.set(jid, {
                        price,
                        captcha: captcha.text,
                        card: { name: title, tier, id, source, image },
                    });

                    const isGif = image.endsWith('.gif');
                    if (isGif) {
                        await client.sendMessage(jid, {
                            video: i,
                            gifPlayback: true,
                            caption: `🎉 *A New Card Has Spawned!* 🎉\n\n🃏 *Card Details*\n💠 *Name:* ${title}\n👑 *Tier:* ${tier}\n💰 *Price:* ${price} Coins\n📝 *Source:* ${source}\n🎁 *Captcha:* ${captcha.text}\n\n*Use ${client.prefix}collect <captcha> to claim!*`
                        });
                    } else {
                        await client.sendMessage(jid, {
                            image: i,
                            caption: `🎉 *A New Card Has Spawned!* 🎉\n\n🃏 *Card Details*\n💠 *Name:* ${title}\n👑 *Tier:* ${tier}\n💰 *Price:* ${price} Coins\n📝 *Source:* ${source}\n🎁 *Captcha:* ${captcha.text}\n\n*Use ${client.prefix}collect <captcha> to claim!*`
                        });
                    }
                } catch (err) {
                    console.error(`❌ Error spawning card for group ${jid}:`, err);
                   
                }
            }
        });

        console.log("✅ Card spawner scheduled successfully.");
    } catch (error) {
        console.error(error);
    }
};

// Utility function for creating captchas
const generateCaptcha = () => {
    const length = 6;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captchaText = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        captchaText += charset[randomIndex];
    }
    return { text: captchaText };
};
