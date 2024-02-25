import { Client, GatewayIntentBits } from "discord.js";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Server from "../model/model.js";
import { fetchSolanaAssets } from "../utils/fetchSolanaAssets.js";
import { checkEligibility } from "../utils/checkEligibility.js";
import cron from "node-cron";
dotenv.config();

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
  cron.schedule("0 0 * * SUN", async () => {
    console.log("Performing weekly eligibility checks...");
    const servers = await Server.find();

    for (const server of servers) {
      const { serverId, eligibilityCriteria, creatorAddress } = server;

      for (const user of server.users) {
        const assets = await fetchSolanaAssets(
          user.walletAddress,
          creatorAddress
        );
        const isEligible = checkEligibility(assets, eligibilityCriteria);

        await Server.updateOne(
          { serverId: serverId, "users.discordId": user.discordId },
          { $set: { "users.$.isEligible": isEligible } }
        );

        const guild = client.guilds.cache.get(serverId);
        if (!guild) continue;

        try {
          const member = await guild.members.fetch(user.discordId);
          if (!isEligible && member) {
            await member
              .send(
                "You have been removed from the server due to not meeting the NFT eligibility criteria."
              )
              .catch(console.error);
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
    if (interaction.member.permissions.has("ADMINISTRATOR")) {
      const address = interaction.options.getString("wallet_address");
      await Server.findOneAndUpdate(
        { serverId: interaction.guildId },
        { creatorAddress: address },
        { upsert: true }
      );
      await interaction.reply("Creator address set.");
    } else {
      await interaction.reply(
        "You do not have permission to use this command."
      );
    }
  } else if (commandName === "setcriteria") {
    if (interaction.member.permissions.has("ADMINISTRATOR")) {
      const common = interaction.options.getInteger("common") || 0;
      const legendary = interaction.options.getInteger("legendary") || 0;
      const rare = interaction.options.getInteger("rare") || 0;
      const ultimate = interaction.options.getInteger("ultimate") || 0;
      const minimumNFTs = interaction.options.getInteger("minimumnfts") || 0;
      const criteria = { common, legendary, rare, ultimate, minimumNFTs };
      await Server.findOneAndUpdate(
        { serverId: interaction.guildId },
        { eligibilityCriteria: criteria },
        { upsert: true }
      );
      await interaction.reply("Eligibility criteria updated.");
    } else {
      await interaction.reply(
        "You do not have permission to use this command."
      );
    }
  } else if (commandName === "register") {
    await interaction.deferReply();
    const walletAddress = interaction.options.getString("wallet_address");
    const server = await Server.findOne({ serverId: interaction.guildId });

    if (!server) {
      await interaction.editReply(
        "Server settings not found. Please set up the server first."
      );
      return;
    }

    const isAlreadyRegistered = server.users.some(
      (user) => user.walletAddress === walletAddress
    );
    if (isAlreadyRegistered) {
      await interaction.editReply("This wallet address is already registered.");
      return;
    }

    try {
      const assets = await fetchSolanaAssets(
        walletAddress,
        server.creatorAddress
      );
      const isEligible = checkEligibility(assets, server.eligibilityCriteria);
      await Server.updateOne(
        { serverId: interaction.guildId },
        {
          $push: {
            users: {
              discordId: interaction.user.id,
              walletAddress,
              isEligible,
            },
          },
        },
        { upsert: true }
      );
      await interaction.editReply(
        isEligible
          ? "Wallet registered and you are eligible."
          : "Wallet registered but you are not eligible."
      );
    } catch (error) {
      console.error("Registration error:", error);
      await interaction.editReply(
        "Failed to process your registration. Please try again later."
      );
    }
  }
});

client.login(process.env.TOKEN);
