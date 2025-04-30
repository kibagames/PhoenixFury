module.exports = {
    name: "t2party",
    aliases: ["transfer-to-party"],
    exp: 5,
    cool: 5,
    react: "🔼",
    category: "pokemon",
    description: "Transfer a Pokémon from your PC to your party.",
    usage: "<pc_index>",
    async execute(client, arg, M) {
        const party = await client.pkmn.get(`${M.sender}_Party`) || [];
        const pc = await client.pkmn.get(`${M.sender}_PC`) || [];

        if (party.length >= 6) {
            return M.reply("Your party is full. You can't have more than 6 Pokémon in your party.");
        }

        if (!arg || isNaN(arg)) {
            return M.reply("Please provide a valid index of the Pokémon in your PC to transfer.");
        }

        const index = parseInt(arg) - 1;

        if (index < 0 || index >= pc.length) {
            return M.reply("Invalid index. Please select a valid Pokémon from your PC.");
        }

        // Transfer Pokémon
        const pokemon = pc.splice(index, 1);
        party.push(pokemon);

        // Save updated data
        await client.pkmn.set(`${M.sender}_Party`, party);
        await client.pkmn.set(`${M.sender}_PC`, pc);

        return M.reply(`🎉 *${client.utils.capitalize(pokemon.name)}* has been successfully transferred to your party!`);
    },
};
