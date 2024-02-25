export function checkEligibility(assets, eligibilityCriteria) {
    const counts = { common: 0, legendary: 0, rare: 0, ultimate: 0 };

    assets.forEach((asset) => {
        if (asset.type === "common") counts.common++;
        else if (asset.type === "legendary") counts.legendary++;
        else if (asset.type === "rare") counts.rare++;
        else if (asset.type === "ultimate") counts.ultimate++;
    });

    return (
        counts.common >= eligibilityCriteria.common &&
        counts.legendary >= eligibilityCriteria.legendary &&
        counts.rare >= eligibilityCriteria.rare &&
        counts.ultimate >= eligibilityCriteria.ultimate &&
        assets.length >= eligibilityCriteria.minimumNFTs
    );
}
