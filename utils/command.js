import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name: 'setcreator',
    description: 'Sets the Solana creator address for the server.',
    options: [
      {
        type: 3, // STRING type
        name: 'address',
        description: 'The Solana creator wallet address',
        required: true,
      },
    ],
  },
  {
    name: 'setcriteria',
    description: 'Sets the eligibility criteria for NFT holders.',
    options: [
      {
        type: 3, // STRING type for simplicity, expect a JSON string or predefined format
        name: 'criteria',
        description: 'The criteria in JSON format or key:value pairs',
        required: true,
      },
    ],
  },
  {
    name: 'register',
    description: 'Registers a user\'s Solana wallet address.',
    options: [
      {
        type: 3, // STRING type
        name: 'wallet',
        description: 'Your Solana wallet address',
        required: true,
      },
    ],
  },
];

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID, process.env.GUILD_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();