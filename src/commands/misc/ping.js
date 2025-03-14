const { Client, InteractionCallback } = require("discord.js");

module.exports = {
    name: 'ping',
    description: 'Pong!',
    // devOnly: Boolean,
    testOnly: true,
    // options: Object[],
    // deleted: Boolean,
  
    callback: (client, interaction) => {
      interaction.reply(`:ping_pong: ${client.ws.ping}ms Pong!`);
    },
  };