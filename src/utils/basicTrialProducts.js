import { sunscreenOption } from "../data/targetedCareProducts";
import { reviewedSunscreen } from "../data/reviewedSunscreen";
import { getProductById } from "./productCatalog";

export const trialSunscreen = {
  ...sunscreenOption,
  id: "roundlab-birch-sunscreen",
  category: "sunscreen",
  link: sunscreenOption.source,
  purchaseSource: { label: "공식몰" },
  shortReason: "아침 루틴 마지막에 사용하는 자외선 차단제",
};
export const getTrialProduct = id => id === trialSunscreen.id ? trialSunscreen : id === reviewedSunscreen.id ? reviewedSunscreen : getProductById(id);
export const day = 86_400_000;
export const dateLabel = time => new Date(time).toLocaleDateString("ko-KR");
