import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

export async function fetchSolanaAssets(walletAddress, creatorAddress) {
  const url = process.env.RPC_URL;
  const body = {
    jsonrpc: '2.0',
    id: 'fetch-solana-assets',
    method: 'searchAssets',
    params: {
      ownerAddress: walletAddress,
      tokenType: 'all',
      displayOptions: {
        showNativeBalance: true,
        showInscription: true,
        showCollectionMetadata: true,
      },
    },
  };

  const maxRetries = 3;
  let retryCount = 0;
  let delayTime = 1000;

  while (retryCount < maxRetries) {
    try {
      const response = await axios.post(url, body);
      if (response.data && response.data.result) {
        const items = response.data.result.items;
        const nfts = items.filter(
          (item) =>
            item.interface === 'V1_NFT' &&
            item.creators?.some((creator) => creator.address === creatorAddress),
        );

        let rarityCounts = {
          ultimate: 0,
          legendary: 0,
          rare: 0,
          common: 0,
          totalNFTs: nfts.length,
        };

        nfts.forEach((nft) => {
          const rarityAttribute = nft.content.metadata.attributes.find(
            (attr) => attr.trait_type === 'Rarity',
          );
          const rarityValue = rarityAttribute && rarityAttribute.value ? rarityAttribute.value.toLowerCase() : 'common';

          switch (rarityValue) {
            case 'ultimate':
              rarityCounts.ultimate++;
              break;
            case 'legendary':
              rarityCounts.legendary++;
              break;
            case 'rare':
              rarityCounts.rare++;
              break;
            case 'common':
            default:
              rarityCounts.common++;
              break;
          }
        });

        return rarityCounts;
      }
      return { ultimate: 0, legendary: 0, rare: 0, common: 0, totalNFTs: 0 };
    } catch (error) {
      if (error.response && error.response.status === 429) {
        console.log(`Rate limit hit, retrying after ${delayTime}ms...`);
        await delay(delayTime);
        retryCount++;
        delayTime *= 2;
      } else {
        console.error('Error fetching Solana assets:', error);
        throw new Error('Failed to fetch Solana assets');
      }
    }
  }
  throw new Error('Failed to fetch Solana assets after multiple attempts');
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
