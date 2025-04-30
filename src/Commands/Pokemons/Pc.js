module.exports = {
    name: "pc",
    aliases: ["pc"],
    exp: 5,
    cool: 5,
    react: "🔵",
    category: "pokemon",
    description: ".",
    usage: '',
    async execute(client, arg, M) {
        const pc = await client.pkmn.get(`${M.sender}_PC`) || [];
        if (pc.length < 1) return M.reply("You don't have any pokemon in your pc")
        let text = `*💻 ${M.pushName} PC*\n\n*🌍Logged In as ${M.pushName}*\n`
        pc.forEach((x, y) => (text += `\n*🏮 ${y + 1} - ${client.utils.capitalize(x.name)}*`))
        return M.reply(text)
    }
}
