module.exports = {
    name: "swap",
    aliases: [""],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: "Swaps two Pokémon within the party.",
    usage: ":swap <index1> <index2>",
    async execute(client, arg, M) {
        try {
            const party = await client.pkmn.get(`${M.sender}_Party`) || [];

            if (party.length < 2) {
                return M.reply("You need at least two Pokémon in your party to use this command.");
            }

            const args = arg.split(" ").map(num => parseInt(num) - 1);

            if (args.length !== 2 || args.some(index => isNaN(index) || index < 0 || index >= party.length)) {
                return M.reply("Invalid indices! Use the command like :swap <index1> <index2>.");
            }

            const [index1, index2] = args;

            // Swap Pokémon in the party
            [party[index1], party[index2]] = [party[index2], party[index1]];

            await client.pkmn.set(`${M.sender}_Party`, party);

            M.reply(
                `🔄 Successfully swapped Pokémon #${index1 + 1} (${client.utils.capitalize(
                    party[index1].name
                )}) with Pokémon #${index2 + 1} (${client.utils.capitalize(party[index2].name)}).`
            );
        } catch (error) {
            console.error(error);
            M.reply("An error occurred while swapping your Pokémon. Please try again later.");
        }
    },
};
