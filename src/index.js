import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Server from "../model/model.js"; // Ensure the path matches your project structure
import { fetchSolanaAssets } from "../utils/fetchSolanaAssets.js"; // Placeholder path
import cron from "node-cron";
dotenv.config();

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

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
  // Set up cron job for periodic eligibility checks
  // Inside the client.on("ready") event, after the bot logs in
  cron.schedule("0 0 * * SUN", async () => {
    console.log("Performing weekly eligibility checks...");
    const servers = await Server.find(); // Fetch all servers

    for (const server of servers) {
      const { serverId, eligibilityCriteria } = server;

      for (const user of server.users) {
        const assets = await fetchSolanaAssets(user.walletAddress); // Implement this
        const isEligible = checkEligibility(assets, eligibilityCriteria);

        // Update the user's eligibility in the database
        await Server.updateOne(
          { serverId: serverId, "users.discordId": user.discordId },
          { $set: { "users.$.isEligible": isEligible } }
        );

        // Optional: Notify the user or take actions based on eligibility
        const guild = client.guilds.cache.get(serverId);
        if (!guild) continue; // Skip if the guild is not found

        try {
          const member = await guild.members.fetch(user.discordId);
          if (!isEligible && member) {
            // Send a warning message before kicking, optional
            await member
              .send(
                "You have been removed from the server due to not meeting the NFT eligibility criteria."
              )
              .catch(console.error);
            // Kick the member
            await member
              .kick("Not meeting the NFT eligibility criteria")
              .catch(console.error);
            console.log(
              `User ${user.discordId} kicked for not meeting NFT eligibility.`
            );
          }
        } catch (error) {
          console.error(`Failed to kick user ${user.discordId}:`, error);
        }
      }
    }
  });
});

client.on("interactionCreate", async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const { commandName } = interaction;

  if (commandName === "ping") {
    await interaction.reply("Pong!");
  } else if (commandName === "setcreator") {
    const address = interaction.options.getString("address");
    await Server.findOneAndUpdate(
      { serverId: interaction.guildId },
      { creatorAddress: address },
      { upsert: true }
    );
    await interaction.reply("Creator address set.");
  } else if (commandName === "setcriteria") {
    const criteria = {
      common: interaction.options.getInteger("common"),
      legendary: interaction.options.getInteger("legendary"),
      rare: interaction.options.getInteger("rare"),
      minimumNFTs: interaction.options.getInteger("minimumnfts"),
    };
    await Server.findOneAndUpdate(
      { serverId: interaction.guildId },
      { eligibilityCriteria: criteria },
      { upsert: true }
    );
    await interaction.reply("Eligibility criteria updated.");
  } else if (commandName === "register") {
    const walletAddress = interaction.options.getString("wallet");
    // This is a simplified placeholder. Implement fetching and checking Solana assets.
    const assets = await fetchSolanaAssets(walletAddress); // Ensure this function is implemented
    // Simplified eligibility check. Replace with your actual logic.
    const isEligible = true; // Replace with actual check against `assets` and stored `eligibilityCriteria`
    await Server.findOneAndUpdate(
      { serverId: interaction.guildId },
      {
        $push: {
          users: { discordId: interaction.user.id, walletAddress, isEligible },
        },
      },
      { upsert: true }
    );
    await interaction.reply(
      isEligible
        ? "Wallet registered and you are eligible."
        : "Wallet registered but you are not eligible."
    );
  }
});

client.login(process.env.TOKEN);
