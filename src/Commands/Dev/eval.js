module.exports = {
    name: 'eval',
    aliases: ['evaluate'],
    category: 'dev',
    exp: 0,
    cool: 4,
    react: "✅",
    description: 'Evaluates JavaScript',
    async execute(client, arg, M) {
        const shisui = "917980329866@s.whatsapp.net";

    if ( M.sender !== shisui ) return M.reply('Only My Owner Can Use This Command')

       try{
        if (!arg) return M.reply('You didnt provided any term to eval!')
        let out = ''
        try {
            const output = (await eval(arg)) || 'Executed JS Successfully!'
            out = JSON.stringify(output)
        } catch (err) {
            out = err.message
        }
        return await M.reply(out)
       }catch(err){
        await client.sendMessage(M.from , {image: {url: `${client.utils.errorChan()}`} , caption: `${client.utils.greetings()} Error-Chan Dis\n\nError:\n${err}`})
      }
    }
}
