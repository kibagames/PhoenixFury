module.exports = {
  name: 'mods',
  aliases: ['mod'],
  category: 'core',
  exp: 1,
  cool: 5,
  react: "✅",
  usage: 'Use :mods <your_message>',
  description: 'Get information about moderators',
  async execute(client, arg, M) {
    const text = arg.trim(); // Ensure leading/trailing spaces are removed
    if (!text) return M.reply('Use :mods <your_message> to proceed.');

    const eren = "916239664935@s.whatsapp.net";
    const morex = "923274079362@s.whatsapp.net";
    const sung = "919775689150@s.whatsapp.net";
    const kaizer = "919832888695@s.whatsapp.net";
    const aizen = "917379899475@s.whatapp.net";
    // Construct the message listing moderators
    let mo = `*⬜Aurora Mods⬜*\n\n`;
    mo += `1) *Eren:* @${eren.split('@')[0]}\n`;
    mo += `2) *Morex:* @${morex.split('@')[0]}\n`;
    mo += `3) *Sung:* @${sung.split('@')[0]}\n`; 
    mo += `4) *Kaizer:* @${kaizer.split('@')[0]}\n`;
    mo += `5) *Aizen:* @${aizen.split('@')[0]}\n\n`
    mo += `*[ Message: ${text} ]*`;

    // Get group invite code
    const code = await client.groupInviteCode(M.from);
    
    const id = 'https://chat.whatsapp.com/' + code;
    
    const test = `Report Received:
    
    Group: ${id}
    
    Message: ${text}
    
    By: ${M.pushName}
    
    Tag: ${M.sender.split('@')[0]}`;

    // Send message with moderator information
    await client.sendMessage(
      M.from,
      {
        text: mo,
        mentions: [eren, morex, sung, kaizer, aizen] // Include all moderators in the mentions
      },
      { quoted: M }
    );

    // Send the report to the admin group
    await client.sendMessage(client.groups.adminsGroup, { text: test });
  }
};
