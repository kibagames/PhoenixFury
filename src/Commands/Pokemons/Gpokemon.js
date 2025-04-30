module.exports = {
    name: "pokemon-give",
    aliases: ["pg"],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Give a Pokémon to another user.",
    usage: ':pokemon-give <pokemon_index> @user',
    async execute(client, arg, M) {
        const users = M.mentions[0];
        if (M.quoted && !users.includes(M.quoted.participant)) users.push(M.quoted.participant);
        if (users.length < 1) return M.reply('🟥 *You must mention a user to give a pokemon to*');
        
        if (!arg || isNaN(arg)) return M.reply('🟥 *Invalid pokemon index*');
        
        let party = await client.pkmn.get(`${M.sender}_Party`) || [];
        let targetParty = await client.pkmn.get(`${users}_Party`) || [];
        
        const index = parseInt(arg);
        if (index < 1 || index > party.length) return M.reply('🟥 *Invalid pokemon index*');
        if (targetParty.length >= 12) return M.reply('🟥 *That user has no room in their party*');
        
        const data = party.splice(index - 1, 1)[0];  // Remove the selected Pokémon from the sender's party
        targetParty.push(data);  // Add the Pokémon to the target user's party
        
        await client.pkmn.set(`${M.sender}_Party`, party);  // Save the updated sender's party
        await client.pkmn.set(`${users}_Party`, targetParty);  // Save the updated target user's party
        
        return client.sendMessage(M.from, {
            text: `🟩 You gave Pokémon *${data.name} - ${data.level}* to @${users.split('@')[0]}.`
        });
    }
};
