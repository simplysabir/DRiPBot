import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import { fetchSolanaAssets } from "../utils/fetchSolanaAssets";
import { Server } from "../model/model";
dotenv.config();


mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));


const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
  ],
});

client.on("ready", () => {
  console.log(`Logged in as ${client.user.tag}!`);
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "ping") {
    await interaction.reply("Pong!");
  }
});

client.on("messageCreate", async (message) => {
  if (message.author.bot) return;
  message.reply({
    content: "Hello From bot!",
    ephemeral: true,
  });
});


client.login(process.env.TOKEN);
