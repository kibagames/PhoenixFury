module.exports = {
    name: "t2pc",
    aliases: ["transfer-to-pc"],
    exp: 5,
    cool: 5,
    react: "🔽",
    category: "pokemon",
    description: "Transfer a Pokémon from your party to your PC.",
    usage: "<party_index>",
    async execute(client, arg, M) {
        const party = await client.pkmn.get(`${M.sender}_Party`) || [];
        const pc = await client.pkmn.get(`${M.sender}_PC`) || [];

        if (party.length <= 1) {
            return M.reply("You must keep at least one Pokémon in your party.");
        }

        if (!arg || isNaN(arg)) {
            return M.reply("Please provide a valid index of the Pokémon in your party to transfer.");
        }

        const index = parseInt(arg) - 1;

        if (index < 0 || index >= party.length) {
            return M.reply("Invalid index. Please select a valid Pokémon from your party.");
        }

        // Transfer Pokémon
        const pokemon = party.splice(index, 1); 
        pc.push(pokemon);

        // Save updated data
        await client.pkmn.set(`${M.sender}_Party`, party);
        await client.pkmn.set(`${M.sender}_PC`, pc);

        return M.reply(`🎉 *${client.utils.capitalize(pokemon.name)}* has been successfully transferred to your PC!`);
    },
};
