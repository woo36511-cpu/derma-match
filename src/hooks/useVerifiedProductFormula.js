import { useEffect, useState } from "react";
import { checkOfficialFormula, readOfficialFormula, supportsOfficialFormula } from "../services/officialCosmetics";
import { getCatalogChangeFormula } from "../utils/productChangeReview";

export function useVerifiedProductFormula(product, entries = []) {
  const stored = entries?.find(entry => entry.id === product?.id)?.officialFormula;
  const known = getCatalogChangeFormula(product) ?? readOfficialFormula(stored, product);
  const shouldCheck = !known && supportsOfficialFormula(product);
  const [checked, setChecked] = useState(null);

  useEffect(() => {
    if (!shouldCheck) return;
    let active = true;
    checkOfficialFormula(product).then(formula => {
      if (active) setChecked({ id: product.id, formula });
    });
    return () => { active = false; };
  }, [product, shouldCheck]);

  return {
    pending: shouldCheck && checked?.id !== product.id,
    formula: known ?? (product && checked?.id === product.id ? checked.formula : null),
  };
}
