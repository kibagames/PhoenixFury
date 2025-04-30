module.exports = {
    name: 'set',
    aliases: [],
    exp: 2,
    cool: 4,
    react: "✅",
    category: 'moderation',
    usage: 'Use :set --<toggleable_function>=[enable/disable]',
    description: 'Enable or disable certain features on group-chats ⚙️',
    async execute(client, arg, M) {
        const toggleableGroupActions = {
            'antilink': 'This feature automatically removes a member from the group if they send a different group link; it also deletes the link. 🚫🔗',
            'events': 'Turn on events where if any member joins, leaves, gets promoted, or demoted, it will be shown. 🎉',
            'cards': 'Enables card spawning in your group. 🃏',
            'wild': 'Enables wild Pokémon encounters. 🌿🦁',
            'news': 'Receive the latest news by Team Aurora.'
        };

        if (!arg) {
            // List of toggleable functions and descriptions
            const actionsInfo = Object.entries(toggleableGroupActions)
                .map(([action, description], index) => `**${index + 1}) ${action}**:\n${description}\n`)
                .join('\n');
            
            return M.reply(
                `*Group Functions Allowed:*\n\n${actionsInfo}\n` +
                `*Usage Instructions:*\nUse \`:set --<toggleable_function>=<enable/disable>\`\n` +
                `\n*How to Enable or Disable:*\n- To enable a function, use: \`:set --<function_name>=enable\`\n` +
                `- To disable a function, use: \`:set --<function_name>=disable\``
            );
        }

        // Regex to extract toggleable function and action (enable/disable)
        const regex = /--(.+?)=(enable|disable)/;
        const match = arg.match(regex);
        if (!match || !toggleableGroupActions.hasOwnProperty(match[1])) {
            return M.reply(
                `Invalid toggleable item provided. Please provide a valid item.\n\n` +
                `For available items, use \`set\` to see the list.`
            );
        }

        const item = match[1];
        const action = match[2];

        const Actives = (await client.DB.get(item)) || [];
        const isCurrentlyActive = Actives.includes(M.from);

        // Check if the action is already in the desired state
        if ((action === 'enable' && isCurrentlyActive) || (action === 'disable' && !isCurrentlyActive)) {
            const actionText = action === 'enable' ? 'activated' : 'deactivated';
            return M.reply(`${toggleableGroupActions[item]} is already ${actionText} in your group.`);
        }

        // Enable or disable the feature
        if (action === 'enable') {
            await client.DB.push(item, M.from);
            M.reply(`${toggleableGroupActions[item]} successfully activated in your group.`);
        } else if (action === 'disable') {
            await client.DB.pull(item, M.from);
            M.reply(`${toggleableGroupActions[item]} successfully deactivated in your group.`);
        }
    }
};
