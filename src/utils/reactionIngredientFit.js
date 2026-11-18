const groups = [
  ["fragrance", /^(향료|fragrance|parfum)$/i],
  ["retinoid", /^(레티놀|레티날|retinol|retinal|retinaldehyde)$/i],
];

export function getReactionIngredientClues(ingredients = []) {
  return groups.flatMap(([family, pattern]) => {
    const ingredient = ingredients.find(name => pattern.test(name.trim()));
    return ingredient ? [{ family, ingredient }] : [];
  });
}

export function getReactionIngredientFit(product, context) {
  if (!context?.reactionIngredientFamilies?.length || !product.evidence?.domesticFormulaVerified ||
      !product.evidence?.fullIngredientsVerified || !product.fullIngredients?.length) return 0;
  return getReactionIngredientClues(product.fullIngredients).some(({ family }) => context.reactionIngredientFamilies.includes(family)) ? -5 : 0;
}
