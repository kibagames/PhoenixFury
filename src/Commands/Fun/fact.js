const axios = require('axios');

module.exports = {
    name: 'fact',
    aliases: ['ft'],
    category: 'fun',
    exp: 5,
    cool: 4,
    react: "🍥",
    usage: 'Use :fact',
    description: 'Sends random facts',
    async execute(client, arg, M) {
        await axios
            .get(`https://nekos.life/api/v2/fact`)
            .then((response) => {
                const text = `Fact for you: ${response.data.fact}`
                M.reply(text)
            })
            .catch((err) => {
                M.reply(`🔍 Error: ${err}`)
            })
    }
}
