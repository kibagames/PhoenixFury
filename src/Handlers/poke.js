const cron = require("node-cron");
const axios = require("axios");
const { PokemonClient, MoveClient } = require('pokenode-ts');

const legendary = ['144', '145', '146', '150'];
const mythical = ['151'];
const pseudoLegendary = ['149'];

module.exports = PokeHandler = async (client, M) => {
    try {
        const wilds = await client.DB.get('wild');
        const wildGroups = wilds || [];

        for (const jid of wildGroups) {
            console.log(`Scheduling Pokémon spawns for group: ${jid}`);

            cron.schedule('*/30 * * * *', async () => {
                try {
                    let randomPokemonId = client.utils.getRandomInt(1, 898);

                    // If Pokémon is mythical, re-choose the ID
                    while (mythical.includes(randomPokemonId.toString())) {
                        randomPokemonId = client.utils.getRandomInt(1, 898);
                    }

                    const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${randomPokemonId}`);
                    const pokemonData = response.data;

                    const level = Math.floor(Math.random() * (10 - 5) + 5);
                    const levelResponse = await axios.get('https://shiui-ff2daa3f5778.herokuapp.com/poke/level');
                    const levelCharts = levelResponse.data;
                    const experienceData = levelCharts.find(x => x.level === level);
                    const exp = experienceData?.expRequired || 0;

                    const { name, id, sprites, types } = pokemonData;
                    const image = sprites.other['official-artwork'].front_default;

                    const { hp, attack, defense, speed, specialAttack, specialDefence } = await getPokemonStats(id, level);

                    const { moves, rejectedMoves } = await fetchMovesForPokemon(name, level);

                    // Determine gender
                    const speciesData = await new PokemonClient().getPokemonSpeciesByName(name);
                    const genderRate = speciesData.gender_rate;
                    const gender = genderRate === -1 ? 'genderless' : (Math.random() < genderRate / 8 ? 'female' : 'male');
                    const catchRate = speciesData.capture_rate;

                    // Determine rarity
                    let rarity = 'Normal';
                    if (legendary.includes(id.toString())) rarity = 'Legendary';
                    if (pseudoLegendary.includes(id.toString())) rarity = 'Pseudo-Legendary';
                    if (mythical.includes(id.toString())) rarity = 'Mythical';

                    // Save Pokémon data
                    await client.pkmn.set(`${jid}_Pkmn`, {
                        name,
                        level,
                        exp,
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
                        specialAttack,
                        maxSpecialAttack: specialAttack,
                        specialDefence,
                        maxSpecialDefence: specialDefence,
                        types: types.map(t => t.type.name),
                        moves,
                        gender,
                        tag: client.utils.generateRandomUniqueTag(10),
                        state: { status: '', movesUsed: 0 },
                        rejectedMoves,
                        pokeball: getPokeball({ rarity, hp, catchRate }),
                        region: 'kanto',
                        rarity
                    });

                    const buffer = await client.utils.getBuffer(image);
                    console.log(`A wild ${name} appeared in group: ${jid}`);

                    await client.sendMessage(jid, {
                        image: buffer,
                        caption: `🌟 *A Wild ${name} has Appeared!* 🌟\n\n🔥 *Types:* ${types.map(t => t.type.name).join(', ')}\n🔸 *Level:* ${level}\n\n[Use *${client.prefix}catch* to start catching it!]`
                    });

                } catch (err) {
                    console.error("Error during Pokémon spawn:", err.message);
                }
            });
        }

        console.log("✅ Pokémon spawner scheduled successfully for all groups.");
    } catch (error) {
        console.error("❌ Error in PokeHandler:", error.message);
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