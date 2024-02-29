import { REST, Routes } from 'discord.js';
import dotenv from 'dotenv';
dotenv.config();

const commands = [
  {
    name: 'setcreator',
    description: 'Sets the Solana creator address for the server.',
    defaultPermission: false,
    options: [
      {
        type: 3,
        name: 'wallet_address',
        description: 'The Solana creator wallet address',
        required: true,
      },
    ],
  },
  {
    name: 'setcriteria',
    description: 'Sets the eligibility criteria for NFT holders.',
    defaultPermission: false,
    options: [
      {
        type: 4,
        name: 'common',
        description: 'Number of common NFTs required',
        required: false,
      },
      {
        type: 4,
        name: 'rare',
        description: 'Number of rare NFTs required',
        required: false,
      },
      {
        type: 4,
        name: 'legendary',
        description: 'Number of legendary NFTs required',
        required: false,
      },
      {
        type: 4,
        name: 'ultimate',
        description: 'Number of ultimate NFTs required',
        required: false,
      },
      {
        type: 4,
        name: 'minimumnfts',
        description: 'Minimum number of NFTs required',
        required: false,
      },
    ],
  },
  {
    name: 'register',
    description: 'Registers a user\'s Solana wallet address.',
    options: [
      {
        type: 3,
        name: 'wallet_address',
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

    await rest.put(Routes.applicationCommands(process.env.CLIENT_ID), { body: commands });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
