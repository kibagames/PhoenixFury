module.exports = {
    name: "catch",
    aliases: [],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Catches the appeared wild Pokémon.",
    usage: ":catch",

    async execute(client, arg, M) {
        const userId = M.sender; // Define userId
        const context = arg.trim().toLowerCase();
        const data = await client.pkmn.get(`${M.from}_Pkmn`);
        if (!data) return M.reply("🟥 *Currently, there aren't any wild Pokémon to catch.*");

        // Check if Pokémon is locked
        const lockedBy = await client.pkmn.get(`${M.from}_Lock`);
        if (lockedBy && lockedBy !== M.sender) {
            return M.reply("⚠️ This Pokémon is currently being battled/captured by another trainer.");
        }

        if (!context) {
            return M.reply(`🔹 Use one of the following options:
1️⃣ *:catch fight* - Battle the wild Pokémon.
2️⃣ *:catch forfeit* - Let others try catching it.
3️⃣ *:catch pokeball* - Check your available Poké Balls.
4️⃣ *:catch use* - Attempt to catch the Pokémon.`);
        }

        // Lock the Pokémon for this player
        await client.pkmn.set(`${M.from}_Lock`, M.sender);

        // Battle Mode
        if (context.startsWith("fight")) {
            let party = await client.pkmn.get(`${M.sender}_Party`) || [];
            if (party.length === 0) return M.reply("🟥 *You have no Pokémon in your party!* Train one first.");
            
            const pkmn = party[0]; // First party Pokémon
            
            if (context.split(" ").length === 1) {
                return M.reply(`⚔️ Choose an attack move:
${pkmn.moves.map((m, i) => `${i + 1}. ${client.utils.capitalize(m.name)} (${m.power} Power)`).join('\n')}

Use *:catch fight [index]* to attack!`);
            }

            let moveIndex = parseInt(context.split(" ")[1]) - 1;
            if (isNaN(moveIndex) || moveIndex < 0 || moveIndex >= pkmn.moves.length) {
                return M.reply("❌ Invalid move selection.");
            }

            const move = pkmn.moves[moveIndex];
            let damage = Math.floor((move.power || 10) + pkmn.attack / 10);
            data.hp -= damage;
            if (data.hp <= 0) {
                await client.pkmn.delete(`${M.from}_Pkmn`);
                await client.pkmn.delete(`${M.from}_Lock`);
                return M.reply(`💀 *${data.name} fainted!* You couldn't catch it.`);
            }

            let wildDamage = Math.floor(data.attack / 10);
            pkmn.hp -= wildDamage;
            if (pkmn.hp <= 0) pkmn.hp = 1; // Pokémon cannot faint here

            await client.pkmn.set(`${M.from}_Pkmn`, data);
            await client.pkmn.set(`${M.sender}_Party`, party);
            return M.reply(`⚡ You used *${client.utils.capitalize(move.name)}*! ${data.name} now has ${data.hp} HP left.
💥 ${data.name} counterattacked! Your ${pkmn.name} now has ${pkmn.hp} HP.`);
        }

        // Forfeit Option
        if (context === "forfeit") {
            await client.pkmn.delete(`${M.from}_Pkmn`);
            await client.pkmn.delete(`${M.from}_Lock`);
            return M.reply("⚠️ You forfeited! Now others can catch this Pokémon.");
        }

        // Check Poké Balls
        if (context === "pokeball") {
           const economy = await client.econ.findOne({ userId });
            return M.reply(`🎾 Your Poké Balls:
🟠 Poké Ball: ${economy.pokeball}
🔵 Great Ball: ${economy.greatball}
🟣 Ultra Ball: ${economy.ultraball}
🟡 Master Ball: ${economy.masterball}`);
        }

        // Catching Mechanic
        if (context === "use") {
            const economy = await client.econ.findOne({ userId });
            let ball = getPokeball({ rarity: data.rarity, hp: data.hp, catchRate: data.catchRate });

            if (!economy[ball] || economy[ball] <= 0) {
                await client.pkmn.delete(`${M.from}_Lock`);
                return M.reply(`🟥 You don't have any ${ball}! Try another ball or lower the Pokémon's HP first.`);
            }
            
            // Deduct Poké Ball before attempting catch
            economy[ball]--;
            await economy.save();

            let catchSuccess = Math.random() < (data.catchRate / 255) * (1 - data.hp / data.maxHp);
            if (!catchSuccess) {
                await client.pkmn.delete(`${M.from}_Lock`);
                return M.reply(`❌ The ${ball} broke! Lower ${data.name}'s HP and try again.`);
            }
            
            await client.pkmn.delete(`${M.from}_Pkmn`);
            await client.pkmn.delete(`${M.from}_Lock`);

            data.pokeball = ball; // Assign caught Poké Ball
            let party = await client.pkmn.get(`${M.sender}_Party`) || [];
            let pc = await client.pkmn.get(`${M.sender}_PC`) || [];
            
            if (party.length >= 6) {
                pc.push(data);
                await client.pkmn.set(`${M.sender}_PC`, pc);
            } else {
                party.push(data);
                await client.pkmn.set(`${M.sender}_Party`, party);
            }
            
            M.reply(`🎉 *Congratulations!* You caught ${data.name} using a ${ball}!`);

            // Grant EXP and handle leveling
            let pkmn = party[0];
            let gainedExp = Math.round(data.exp / 8);
            pkmn.exp += gainedExp;
            pkmn.displayExp += gainedExp;
            
            const pokemonLevelCharts = await client.utils.fetch("https://shiui-ff2daa3f5778.herokuapp.com/poke/level");
            const levels = pokemonLevelCharts.filter((x) => pkmn.exp >= x.expRequired);
            
            if (levels.length > 0 && pkmn.level < levels[levels.length - 1].level) {
                pkmn.level = levels[levels.length - 1].level;
                const stats = await getPokemonStats(pkmn.id, pkmn.level);
                
                pkmn.hp += stats.hp - pkmn.maxHp;
                pkmn.attack += stats.attack - pkmn.attack;
                pkmn.defense += stats.defense - pkmn.defense;
                pkmn.speed += stats.speed - pkmn.speed;
                pkmn.specialAttack += stats.specialAttack - pkmn.specialAttack;
                pkmn.specialDefense += stats.specialDefense - pkmn.specialDefense;
                
                pkmn.maxHp = stats.hp;
                pkmn.maxAttack = stats.attack;
                pkmn.maxDefense = stats.defense;
                pkmn.maxSpeed = stats.speed;
                pkmn.maxSpecialAttack = stats.specialAttack;
                pkmn.maxSpecialDefense = stats.specialDefense;

                M.reply(`🎊 *${pkmn.name} leveled up to ${pkmn.level}!*
✨ Stats increased!`);
            }
            
            await client.pkmn.set(`${M.sender}_Party`, party);
        }
    }
};

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