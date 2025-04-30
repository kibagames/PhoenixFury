module.exports = {
    name: 'toggle',
    aliases: ['t'],
    exp: 0,
    cool: 4,
    react: "✅",
    category: 'dev',
    description: 'Enables or disables a certain command.',
    async execute(client, arg, M) {
        try {
            // Ensure arguments are provided in the correct format
            if (!arg || !arg.includes('=')) {
                return M.reply(
                    'Usage: :toggle --commandName=accept/deny | reason\nExample: :toggle --ping=deny | Command deprecated.'
                );
            }

            // Parse command, action, and reason
            const [commandPart, actionReasonPart] = arg.split('|').map(part => part.trim());
            const [rawCommand, rawAction] = commandPart.split('=').map(part => part.trim());
            const commandName = rawCommand.replace('--', '').toLowerCase();
            const action = rawAction.toLowerCase();
            const reason = actionReasonPart || 'No reason provided';

            if (!commandName || !action) {
                return M.reply(
                    'You need to specify the command name and action in the format: :toggle --commandName=accept/deny | reason.'
                );
            }

            // Find the command by name or alias
            const command = client.cmd.get(commandName) || client.cmd.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));
            if (!command) {
                return M.reply(`Command "${commandName}" not found.`);
            }

            // Fetch the list of disabled commands
            const disabledCommands = await client.DB.get('disable-commands') || [];
            const allAliases = [command.name, ...(command.aliases || [])];

            if (action === 'deny') {
                // Check if already disabled
                if (disabledCommands.some(disabledCmd => allAliases.includes(disabledCmd.command))) {
                    return M.reply(`Command "${commandName}" or one of its aliases is already disabled.`);
                }

                // Add command to the disabled list
                const disabledCommandInfo = {
                    command: command.name,
                    aliases: command.aliases || [],
                    reason,
                    disabledAt: new Date().toISOString(),
                    disabledBy: M.pushName
                };

                await client.DB.push('disable-commands', disabledCommandInfo);
                return M.reply(
                    `Command "${command.name}" (Aliases: ${command.aliases?.join(', ') || 'None'}) has been disabled successfully by ${M.pushName} for reason: ${reason}.`
                );
            } else if (action === 'accept') {
                // Find the command in the disabled list
                const disabledCmdIndex = disabledCommands.findIndex(disabledCmd =>
                    allAliases.includes(disabledCmd.command)
                );

                if (disabledCmdIndex === -1) {
                    return M.reply(`Command "${commandName}" or its aliases are not disabled.`);
                }

                // Remove the command from the disabled list
                disabledCommands.splice(disabledCmdIndex, 1);
                await client.DB.set('disable-commands', disabledCommands);
                return M.reply(`Command "${command.name}" (Aliases: ${command.aliases?.join(', ') || 'None'}) has been enabled successfully.`);
            } else {
                return M.reply('Invalid action. Use :toggle --commandName=accept or :toggle --commandName=deny.');
            }
        } catch (error) {
            console.error('Error in toggling command:', error);
            M.reply('An error occurred while toggling the command.');
        }
    }
};
