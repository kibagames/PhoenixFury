const itemsForSale = [
    { name: 'Luck Potion', item: 'luckpotions', price: 6000, usage: 'Increases luck in slotting', emoji: '🧪' },
    { name: 'Pepper Spray', item: 'peppersprays', price: 5000, usage: 'Self-defense against robbers', emoji: '🌶️'  }
];

module.exports = {
    name: 'store',
    aliases: ['store'],
    category: 'economy',
    exp: 1,
    cool: 4,
    react: '✅',
    usage: 'Use :shop',
    description: 'View items available for purchase',
    async execute(client, arg, M) {
        let text = '🏪 *Aurora Store* 🏪';
        text += '\n\n';
        itemsForSale.forEach((item, index) => {
            text += `${item.emoji} *${index + 1}) ${item.name}*\n🎴 *Usage:* ${item.usage}\n🛒 *Cost:* ${item.price}\n\n`;
        });
        text += `❓Use ${client.prefix}buy <item_index_number> [ optional: --<item_quantity> ]`;
        await M.reply(text);
    },
};
