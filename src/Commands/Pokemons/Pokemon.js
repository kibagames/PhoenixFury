module.exports = {
    name: "pokemon",
    aliases: ["pkmn"],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Fetches information about a Pokémon.",
    usage: '',
    async execute(client, arg, M) {
        const context = arg;
        if (!context) return M.reply('🟥 *Provide the name or pokedex ID of the Pokémon.*');
        
        const term = context.trim().split(' ')[0].toLowerCase().trim();
        
        try {
            const res = await client.utils.fetch(`https://pokeapi.co/api/v2/pokemon/${term}`);
            
            let party = await client.pkmn.get(`${M.sender}_Party`) || [];
            let pc = await client.pkmn.get(`${M.sender}_PC`) || [];
            
            const pokemons = [...pc, ...party];
            const ownedAtParty = party.flatMap((x, y) => (x.name === res.name ? y : []));
            const ownedAtPc = pc.flatMap((x, y) => (x.name === res.name ? y : []));
            const owned = pokemons.filter((pokemon) => pokemon.name === res.name);

            const text = `*🎴Name:* ${client.utils.capitalize(res.name)}\n\n*🧧Pokedex ID:* ${res.id}\n\n*🔰${
                res.types.length > 1 ? 'Types' : 'Type'
            }:* ${res.types.map((type) => client.utils.capitalize(type.type.name)).join(', ')}\n\n*⚡${
                res.abilities.length > 1 ? 'Abilities' : 'Ability'
            }:* ${res.abilities
                .map((ability) => client.utils.capitalize(ability.ability.name))
                .join(', ')}\n\n*🔖Owned:* ${owned.length}\n\n*🎡Party:* ${
                ownedAtParty.length < 1 ? 'None' : ownedAtParty.map((x) => x + 1).join(', ')
            }\n\n*💻Pc:* ${ownedAtPc.length < 1 ? 'None' : ownedAtPc.map((index) => index + 1).join(', ')}`;

            const image = await client.utils.getBuffer(
                res.sprites.other['official-artwork'].front_default
            );

            await client.sendMessage(M.from, {
                image: image,
                caption: text
            });

        } catch (err) {
            return M.reply('🟥 *Invalid Pokémon name or Pokédex ID.*');
        }
    }
};
