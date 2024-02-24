import mongoose from "mongoose";

const serverSchema = new mongoose.Schema({
  serverId: String,
  creatorAddress: String,
  eligibilityCriteria: {
    common: Number,
    legendary: Number,
    rare: Number,
    minimumNFTs: Number,
  },
  users: [
    {
      discordId: String,
      walletAddress: String,
      isEligible: Boolean,
    },
  ],
});

const Server = mongoose.model('Server', serverSchema);

export default Server;
