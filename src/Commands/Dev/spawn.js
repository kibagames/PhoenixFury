const axios = require('axios');

module.exports = {
    name: "spawn",
    aliases: ["addcard"],
    category: "dev",
    description: "Add a card to your deck, or to your collection if the deck is full.",
    async execute(client, arg, M) {
        try {
            if (!arg) {
                return M.reply("Please provide a card ID.");
            }

            const jid = "120363281892304546@g.us";
            const url = `https://shiui-ff2daa3f5778.herokuapp.com/card/id?id=${arg}`;

            // Fetch card data from the API
            const res = await axios.get(url);
            const { title, tier, source, id, image} = res.data;
            const price = client.utils.calculatePrice(tier);

            // Generate a captcha
            const captcha = generateCaptcha();

            // Handle image format adjustments
            if (image.includes('webm')) {
                image = image.replace('webm', 'gif');
            }

            console.log(`Sent: ${tier} Name: ${title} For ${price} in ${jid}`);

            // Log the card spawn in the moderators' group
            await client.sendMessage(client.groups.modsGroup, {
                text: `Sent: ${tier} Name: ${title} For ${price} in ${jid}`,
            });

            // Save card data in the card map
            client.cardMap.set(jid, {
                price: price,
                captcha: captcha.text,
                card: { name: title, tier: tier, id: id, source: source, image: image },
            });

            // Determine if the image is a GIF
            const isGif = image.endsWith('.gif');
            const i = await client.utils.getBuffer(image)

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
        } catch (error) {
            console.error("Error in spawn command:", error);
            M.reply("An error occurred while spawning the card. Please try again later.");
        }
    },
};

// Utility function to format card details for the message
function formatCardDetails(name, tier, price, source, captcha, prefix) {
    return `
${tier === 'Tier S' ? '👑 *An S Tier Card Appears!* 👑' : '🎉 *A New Card Has Spawned!* 🎉'}

🃏 *Card Details* 🃏
💠 *Name:* ${name}
👑 *Tier:* ${tier}
💰 *Price:* ${price} Coins
📝 *Source:* ${source}
🎁 *Captcha:* ${captcha}

*Use ${prefix}collect <captcha> to claim!*
`;
}

// Utility function for creating captchas
function generateCaptcha() {
    const length = 6;
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let captchaText = '';
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * charset.length);
        captchaText += charset[randomIndex];
    }
    return { text: captchaText };
}
