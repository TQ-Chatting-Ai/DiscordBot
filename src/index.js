require('dotenv').config();
const { Client, IntentsBitField, Embed, EmbedBuilder, ClientUser, ActivityType, Activity } = require('discord.js');
const mongoose = require('mongoose');
const eventHandler = require('./handlers/eventHandler');


const client = new Client({
  intents: [
    IntentsBitField.Flags.Guilds,
    IntentsBitField.Flags.GuildMembers,
    IntentsBitField.Flags.GuildMessages,
    IntentsBitField.Flags.MessageContent,
  ],
});

// Random Bot Activity >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
let status = [
  {
    name: 'Under Ctrl',
    type: ActivityType.Streaming,
    url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  },
  {
    name: 'Custom Status 1',
    type: ActivityType.Playing,
  },
  {
    name: 'Custom Status 2',
    type: ActivityType.Watching,
  },
  {
    name: 'Custom Status 3',
    type: ActivityType.Listening,
  },
];


(async () => {
  try {
    mongoose.set('strictQuery', false);
    await mongoose.connect(process.env.MONGODB_URL, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    
    console.log('Connected to DB.');

    eventHandler(client);
  } catch (error) {
    console.log(`Error: ${error}`);
  }
})();


// eventHandler(client);
// Set online Bot --> nodemon >>>>>>>>>>>>>>>>>>>>>>>>>
client.on('ready', (c) => {
  // console.log(`✅ ${c.user.tag} is online.`);

  setInterval(() => {
    let random = Math.floor(Math.random() * status.length);
    client.user.setActivity(status[random]);
  }, 10000);
});



// Bot reply message >>>>>>>>>>>>>>>>>>>>>>>>>>

client.on('messageCreate', (message) => {
  if (message.author.bot) {
    return;
  }

  if (message.content === 'tq-hello') {
    message.reply('hello');
  }

  if (message.content === 'tq-thanks') {
    message.reply('Ur welcome!');
  }

  if (message.content === 'embed') {
    const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle("Some title")
    .setURL('https://discord.js.org/')
    .setAuthor({ 
      name: 'Some name', 
      iconURL: 'https://i.imgur.com/AfFp7pu.png', 
      url: 'https://discord.js.org' 
    }
  )
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
      { name: 'Regular field title', value: 'Some value here' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Inline field title', value: 'Some value here', inline: true },
      { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' 
    }
  );
    message.channel.send({ embeds: [embed] });
  }
});



// Bot Reply interaction >>>>>>>>>>>>>>>>>>>>>>>>>>

client.on('interactionCreate', (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  // interaction 1: Basics Reply  >>>>>>>>>>>>>>>>>>>>>>>
  if (interaction.commandName === 'hey') {
    interaction.reply('hey!');
  }
  if (interaction.commandName === 'owner') {
    interaction.reply('owner saya adalah TQuilla#2868');
  }

// interaction 2: Making Option  >>>>>>>>>>>>>>>>>>>>>>>
  if (interaction.commandName === 'add') {
    const num1 = interaction.options.get('first-number').value;
    const num2 = interaction.options.get('second-number').value;

    interaction.reply(`The sum is ${num1 + num2}`);
  }

// Interaction 3: Making Embed >>>>>>>>>>>>>>>>>>>>>>>>> link template : https://discordjs.guide/popular-topics/embeds.html#editing-the-embedded-message-content
  if (interaction.commandName === 'embed') {
    const embed = new EmbedBuilder()
    .setColor('Random')
    .setTitle("Some title")
    .setURL('https://discord.js.org/')
    .setAuthor({ 
      name: 'Some name', 
      iconURL: 'https://i.imgur.com/AfFp7pu.png', 
      url: 'https://discord.js.org' 
    }
  )
    .setDescription('Some description here')
    .setThumbnail('https://i.imgur.com/AfFp7pu.png')
    .addFields(
      { name: 'Regular field title', value: 'Some value here' },
      { name: '\u200B', value: '\u200B' },
      { name: 'Inline field title', value: 'Some value here', inline: true },
      { name: 'Inline field title', value: 'Some value here', inline: true },
    )
    .addFields({ name: 'Inline field title', value: 'Some value here', inline: true })
    .setImage('https://i.imgur.com/AfFp7pu.png')
    .setTimestamp()
    .setFooter({ text: 'Some footer text here', iconURL: 'https://i.imgur.com/AfFp7pu.png' 
    }
  );
    interaction.reply({ embeds: [ embed ] });
  }
});



 // interaction 2: Making Roles Buttons  >>>>>>>>>>>>>>>>>>>>>>>

client.on('interactionCreate', async (interaction) => {
  try {
    if (!interaction.isButton()) return;
    await interaction.deferReply({ ephemeral: true });

    const role = interaction.guild.roles.cache.get(interaction.customId);
    if (!role) {
      interaction.editReply({
        content: "I couldn't find that role",
      });
      return;
    }

    const hasRole = interaction.member.roles.cache.has(role.id);

    if (hasRole) {
      await interaction.member.roles.remove(role);
      await interaction.editReply(`The role ${role} has been removed.`);
      return;
    }

    await interaction.member.roles.add(role);
    await interaction.editReply(`The role ${role} has been added.`);
  } catch (error) {
    console.log(error);
  }
});
  

client.login(process.env.TOKEN);


