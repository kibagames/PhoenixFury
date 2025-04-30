const { PokemonClient, MoveClient } = require('pokenode-ts');
const axios = require('axios');

module.exports = {
    name: "start-journey",
    aliases: ["sj"],
    exp: 5,
    cool: 5,
    react: "✨",
    category: "pokemon",
    description: "Start your Pokémon journey with a starter Pokémon!",
    usage: ":start-journey or :start-journey <pokemon_name>",

    async execute(client, arg, M) {
        try {
             const companion = await client.pkmn.get(`${M.sender}_companion`) || 'None';
             const party = await client.pkmn.get(`${M.sender}_Party`) || [];

            // Check if the user has already started their journey
            if (companion !== 'None') {
                return M.reply('You have already started your journey as a Pokemon trainer');
            };
            
            // Array of starter Pokémon by National Dex IDs
            const starterPokemons = [
                '1', '4', '7',    // Kanto
                '152', '155', '158', // Johto
                '252', '255', '258', // Hoenn
                '387', '390', '393', // Sinnoh
                '495', '498', '501', // Unova
                '650', '653', '656', // Kalos
                '722', '725', '728', // Alola
                '810', '813', '816', // Galar
                '906', '909', '912'  // Paldea
            ];

            // Select a random Pokémon
            const randomPokemonId = starterPokemons[Math.floor(Math.random() * starterPokemons.length)];

            // Fetch Pokémon data
            const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
            const pokemonData = response.data;

            // Generate level and experience
            const level = Math.floor(Math.random() * (10 - 5) + 5); // Random level between 5 and 10
            const exp = level * 50; // Example experience calculation

            const { name, id, sprites, types } = pokemonData;
            const image = sprites.other['official-artwork'].front_default;

            const { hp, attack, defense, speed } = await getPokemonStats(id, level);
            // Fetch gender
            const speciesData = await new PokemonClient().getPokemonSpeciesByName(name);
            const genderRate = speciesData.gender_rate;
            const gender = genderRate === -1 ? 'genderless' : (Math.random() < genderRate / 8 ? 'female' : 'male');

            // Fetch moves
            const { moves, rejectedMoves } = await fetchMovesForPokemon(name, level);

            // Save Pokémon to user's party
            const pokemon = {
                 name,
                        level,
                        exp,
                        displayExp: 0,
                        id,
                        image,
                        hp,
                        maxHp: hp,
                        attack,
                        maxAttack: attack,
                        defense,
                        maxDefense: defense,
                        speed,
                        maxSpeed: speed,
                        types: types.map(t => t.type.name),
                        moves,
                        gender,
                        tag: client.utils.generateRandomUniqueTag(10),
                        state: { status: '', movesUsed: 0 },
                        rejectedMoves
            };
            party.push(pokemon)
            await client.pkmn.set(`${M.sender}_Party`, party);
            await client.pkmn.set(`${M.sender}_companion`, name);

            // Send confirmation message
            const messageContent = {
                image: { url: pokemon.image },
                caption: `🎉 Congratulations! You've started your Pokémon journey with *${pokemon.name}*!\n\n⭐ Type: ${pokemon.types.join(', ')}\n🎴 Pokedex ID: ${pokemon.id}\n🎮 Gender: ${pokemon.gender}`
            };
            await client.sendMessage(M.from, messageContent, { quoted: M });
        } catch (error) {
            console.error(error);
            return M.reply('An error occurred while starting your Pokémon journey. Please try again.');
        }
    }
};

/**
 * Fetch moves for a Pokémon based on level.
 */
async function fetchMovesForPokemon(pokemon, level) {
    const shuffleArray = (array) => array.sort(() => Math.random() - 0.5);

    let moves = shuffleArray(
        (await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`)).data.moves.filter(
            (move) =>
                move.version_group_details[0].move_learn_method.name === 'level-up' &&
                move.version_group_details[0].level_learned_at <= level
        )
    );

    const server = new MoveClient();
    const result = [];
    const rejectedMoves = [];

    for (const { move } of moves) {
        if (result.length >= 4) {
            rejectedMoves.push(move.name);
            continue;
        }

        const data = await server.getMoveByName(move.name);
        const effect = data.meta && data.meta.ailment ? data.meta.ailment.name : '';
        const stat_change = [];
        const descriptions = data.flavor_text_entries.filter((x) => x.language.name === 'en');

        for (const change of data.stat_changes) {
            stat_change.push({ target: change.stat.name, change: change.change });
        }

        result.push({
            name: data.name,
            accuracy: data.accuracy || 0,
            pp: data.pp || 5,
            maxPp: data.pp || 5,
            id: data.id,
            power: data.power || 0,
            priority: data.priority,
            type: data.type.name,
            stat_change,
            effect,
            drain: data.meta ? data.meta.drain : 0,
            healing: data.meta ? data.meta.healing : 0,
            description: descriptions[0]?.flavor_text || "No description"
        });
    }

    return {
        moves: result,
        rejectedMoves
    };
}

function getPokeball({ rarity, hp, catchRate }) {
    if (catchRate < 20 || rarity === "Legendary" || rarity === "Mythical") return "masterball";
    if (catchRate < 60 || hp > 100) return "ultraball";
    if (catchRate < 120 || hp > 50) return "greatball";
    return "pokeball";
}

async function getPokemonStats(pokemon, level) {
    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${pokemon}`);
    const pokemonData = response.data;

    const wantedStatsNames = ['hp', 'attack', 'defense', 'speed', 'special-attack', 'special-defense'];
    const wantedStats = pokemonData.stats.filter(stat => wantedStatsNames.includes(stat.stat.name));

    const pokemonStats = {};
    wantedStats.forEach(stat => {
        const statName = stat.stat.name.replace('-', '');
        pokemonStats[statName] = Math.floor(stat.base_stat + level * (stat.base_stat / 50));
    });

    return pokemonStats;
}