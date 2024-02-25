export function checkEligibility(assets, eligibilityCriteria) {

    return (
        assets.common >= eligibilityCriteria.common &&
        assets.legendary >= eligibilityCriteria.legendary &&
        assets.rare >= eligibilityCriteria.rare &&
        assets.ultimate >= eligibilityCriteria.ultimate &&
        assets.totalNFTs >= eligibilityCriteria.minimumNFTs
    );
}
