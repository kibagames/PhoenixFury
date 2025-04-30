const itemsForSale = [
    { name: 'Luck Potion', item: 'luckpotions', price: 6000, usage: 'Increases luck in slotting', emoji: '🧪' },
    { name: 'Pepper Spray', item: 'peppersprays', price: 5000, usage: 'Self-defense against robbers', emoji: '🌶️' }
];

module.exports = {
    name: 'buy',
    aliases: ['acquire'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: '✅',
    usage: 'Use :buy <item_index_number> [optional: --<item_quantity>]',
    description: 'Buy an item from the shop',
    async execute(client, arg, M) {
        const args = arg.split(' ');
        return initiateBuy(client, args, M);
    }
};

async function initiateBuy(client, args, M) {
    const itemIndex = parseInt(args[0]) - 1; // Convert index to zero-based
    const quantityArg = args.find(arg => arg.startsWith('--')) || '--1';
    const quantity = parseInt(quantityArg.split('--')[1]) || 1;
    const userId = M.sender;

    if (isNaN(itemIndex) || itemIndex < 0 || itemIndex >= itemsForSale.length) {
        return M.reply('❗ *Please specify a valid item index from the store.*');
    }

    const itemData = itemsForSale[itemIndex];
    const totalPrice = itemData.price * quantity;

    const user = await client.econ.findOne({ userId });
    if (!user) {
        return M.reply('💼 *You need to set up your economy first.*');
    }

    if (user.coin < totalPrice) {
        return M.reply(`💰 *You don’t have enough coins to buy ${quantity} ${itemData.name}(s). You need ${totalPrice} coins.*`);
    }

    try {
        // Deduct coins and add the item to user's inventory
        user.coin -= totalPrice;
        if (!user[itemData.item]) user[itemData.item] = 0;
        user[itemData.item] += quantity;
        await user.save();

        M.reply(`🎉 *Thank you for your purchase! You now have ${user[itemData.item]} ${itemData.emoji} ${itemData.name}(s).*`);
    } catch (err) {
        console.error("Error processing purchase:", err);
        M.reply('🟥 *An error occurred while processing your purchase.*');
    }
}
