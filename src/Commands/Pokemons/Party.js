module.exports = {
    name: "party",
    aliases: [""],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Displays the party and details of the Pokémon.",
    usage: ":party [index] [--moves]",
    async execute(client, arg, M) {
        try {
            const party = await client.pkmn.get(`${M.sender}_Party`) || [];
            if (party.length < 1) {
                return M.reply("You don't have any Pokémon in your party.");
            }

            const index = parseInt(arg) - 1;
            const showMoves = arg.includes("--moves");

            if (!arg || isNaN(index) || index < 0 || index >= party.length) {
                // Show the entire party if no valid index is provided
                let text = `⚗ *Party*\n\n🏮 *Username:* ${M.pushName}\n`;
                party.forEach((pokemon, i) => {
                    text += `\n\n*#${i + 1}*\n🎈 *Name:* ${client.utils.capitalize(pokemon.name)}\n🔮 *Level:* ${pokemon.level}\n🪄 *XP:* ${pokemon.displayExp}`;
                });
                text += `\n\n*[Use ${client.prefix}party <index> to see detailed stats of a Pokémon.]*`;
                return M.reply(text);
            } else {
                // Show details for a specific Pokémon
                const pokemon = party[index];

                const pokemonLevelCharts = await client.utils.fetch('https://shiui-ff2daa3f5778.herokuapp.com/poke/level');
                const expArr = pokemonLevelCharts.filter((x) => x.level >= pokemon.level);
                const Exp = expArr[0]?.expRequired || 0;
                const exp = expArr[1]?.expRequired || 0;
                const required = exp - Exp;

                const image = await client.utils.getBuffer(pokemon.image);

                let text = `🟩 *Name:* ${client.utils.capitalize(pokemon.name)}\n\n🌿 *Gender:* ${
                    pokemon.female ? "Female" : "Male"
                }\n\n🟧 *Types:* ${pokemon.types.map(client.utils.capitalize).join(", ")}\n\n🟨 *Level:* ${
                    pokemon.level
                }\n\n🟦 *XP:* ${pokemon.displayExp} / ${required > 0 ? required : 0}\n\n♻ *State:* ${
                    pokemon.hp <= 0
                        ? "Fainted"
                        : pokemon.state.status === ""
                        ? "Fine"
                        : client.utils.capitalize(pokemon.state.status)
                }\n\n🟢 *HP:* ${pokemon.hp} / ${pokemon.maxHp}\n\n⬜ *Speed:* ${pokemon.speed} / ${
                    pokemon.maxSpeed
                }\n\n🛡 *Defense:* ${pokemon.defense} / ${pokemon.maxDefense}\n\n🟥 *Attack:* ${
                    pokemon.attack
                } / ${pokemon.maxAttack}\n\n⬛ *Moves:* ${pokemon.moves
                    .map((move) => move.name.split("-").map(client.utils.capitalize).join(" "))
                    .join(", ")}\n\n*[Use ${client.prefix}party ${
                    index + 1
                } --moves to see detailed information about the Pokémon's moves.]*`;

                if (showMoves) {
                    text = `*Moves | ${client.utils.capitalize(pokemon.name)}*\n`;
                    pokemon.moves.forEach((move, i) => {
                        text += `\n\n*#${i + 1}*\n❓ *Move:* ${move.name
                            .split("-")
                            .map(client.utils.capitalize)
                            .join(" ")}\n〽 *PP:* ${move.pp} / ${
                            move.maxPp
                        }\n🎗 *Type:* ${client.utils.capitalize(move.type)}\n🎃 *Power:* ${
                            move.power
                        }\n🎐 *Accuracy:* ${move.accuracy}\n🧧 *Description:* ${move.description}`;
                    });
                }

                await client.sendMessage(M.from, {
                    image: image,
                    text: text
                });
            }
        } catch (error) {
            console.error(error);
            M.reply("An error occurred while fetching your party details. Please try again later.");
        }
    },
};
