module.exports = {
    name: "dex",
    aliases: [""],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Shows your pokedex.",
    usage: ':dex',
    async execute(client, arg, M) {

        let party = await client.pkmn.get(`${M.sender}_Party`) || [];
        let pc = await client.pkmn.get(`${M.sender}_PC`) || [];
        
        const buffer = await client.utils.getBuffer('https://i.ibb.co/v3S5zFg/Aurora-dex.png');
        const pokemons = [...party, ...pc];

        if (pokemons.length < 1) return M.reply('No Pokémon found in your collection.');

        let text = `*〖🍁 Pokedex 🍁〗*\n\n⛩️ *Logged In as ${M.pushName}*\n\n`;
        
        pokemons.forEach((x) => {
            text += `\n*🎉 ${client.utils.capitalize(x.name)}*`;
        });

        await client.sendMessage(M.from, {
            image: buffer,
            caption: text
        });
    }
};
