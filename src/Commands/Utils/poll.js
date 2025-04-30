module.exports = {
    name: "poll",
    aliases: ["vote"],
    exp: 5,
    cool: 5,
    react: "📊",
    category: "utils",
    description: "Create a poll and let others vote!",
    usage: ":poll <question> | <option1>, <option2>, ...",

    async execute(client, args, M) {
        try {
            // Validate arguments
            if (!args || !args.includes("|")) {
                return M.reply(
                    "Invalid format. Use `:poll <question> | <option1>, <option2>, ...`"
                );
            }

            const [question, optionsString] = args.split("|").map((part) => part.trim());
            const options = optionsString.split(",").map((opt) => opt.trim());

            if (options.length < 2 || options.length > 10) {
                return M.reply("Poll must have between 2 and 10 options.");
            }

            // Send poll message
            await client.sendMessage(M.from, {
                poll: {
                    name: question,
                    values: options,
                    selectableCount: 1, // Number of options users can select
                },
            });

            // Confirmation to the sender
            return M.reply("Poll created successfully!");
        } catch (error) {
            console.error(error);
            return M.reply("An error occurred while creating the poll. Please try again.");
        }
    },
};
