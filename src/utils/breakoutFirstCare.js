export const breakoutFirstCare = {
  folliculitis: {
    title: "고름 돌기에는 깨끗한 온찜질부터 해봐요",
    action: "깨끗한 수건을 따뜻한 물에 적셔 불편한 부위에 15~20분 가볍게 대요. 고름을 짜거나 바늘로 터뜨리지 않아요. 온찜질은 불편함을 줄이는 방법이에요.",
    nextClue: "고름이 번지거나 아파지면 진료로 확인해요. 비슷한 크기의 돌기가 가렵고 가슴·등에 몰려 있다면 아래의 말라세지아 단서도 봐요.",
    source: "https://www.aad.org/public/diseases/a-z/folliculitis/",
  },
  malassezia: {
    title: "땀에 젖은 옷을 갈아입고 돌기 부위를 씻어 말려요",
    action: "운동이나 땀을 많이 흘린 뒤에는 젖은 옷을 바로 갈아입고, 돌기 부위를 순하게 씻어 말려요. 가슴·등이라면 꽉 끼는 운동복 대신 헐렁한 옷을 입어요.",
    nextClue: "가려움과 새 돌기가 이어지거나 반복되면 말라세지아인지 확인할 단계예요. 같은 자리에 블랙헤드·화이트헤드가 뚜렷하면 여드름도 함께 살펴봐요.",
    source: "https://dermnetnz.org/topics/malassezia-folliculitis",
  },
  demodex: {
    title: "붉은 볼·코에는 스크럽을 쉬고 손끝으로 가볍게 씻어요",
    action: "볼과 코는 미지근한 물과 평소 잘 맞던 순한 세안제로 가볍게 씻어요. 스크럽·필링과 세안 브러시는 쉬고, 씻은 뒤 잘 맞던 보습제를 발라요.",
    nextClue: "얼굴 중심의 붉어짐과 돌기가 반복되면 주사와 비슷한 상태인지 확인해요. 이 답변만으로 모낭충이 원인인지는 알 수 없어요.",
    source: "https://www.aad.org/public/diseases/rosacea/skin-care/tips",
  },
  shaving: {
    title: "돌기가 난 부위는 바짝 면도하지 않아요",
    action: "해당 부위의 면도·제모는 잠시 쉬어요. 꼭 면도해야 하면 털이 자라는 방향으로 가볍게 지나가고, 말려 들어간 털을 핀셋으로 파내지 않아요.",
    nextClue: "면도하지 않아도 새 고름 돌기가 늘거나 아파지면 면도 자극으로만 보지 말고 진료로 확인해요.",
    source: "https://dermnetnz.org/topics/pseudofolliculitis-barbae",
  },
  overlap: {
    title: "돌기를 짜지 말고, 땀과 마찰부터 줄여요",
    action: "오늘은 돌기 부위를 미지근한 물로 가볍게 씻고 문지르지 않아요. 몸에 난 돌기라면 땀에 젖은 옷을 바로 갈아입고, 얼굴이라면 해당 부위에 닿는 마찰을 줄여요.",
    nextClue: "가려움이 주된지, 털구멍에 고름이 늘어나는지, 막힌 피지도 함께 보이는지에 따라 볼 방향이 달라요. 아래에서 답변과 겹친 단서를 확인해요.",
    source: "https://www.aad.org/public/diseases/a-z/folliculitis/",
  },
  unclear: {
    title: "돌기 위에 쓰는 스크럽·필링부터 쉬어요",
    action: "오늘 돌기 부위는 손끝으로 가볍게 씻고, 그 위에 쓰던 스크럽·필링은 쉬어요. 피부를 짜거나 문지르지 말고, 처방약은 기존 안내대로 사용해요.",
    nextClue: "밝은 곳에서 막힌 피지, 털구멍 중심의 고름, 비슷한 모양의 가려운 돌기 중 뚜렷한 단서가 있는지 확인해요. 통증이나 고름이 늘면 진료로 확인해요.",
    source: "https://www.aad.org/public/diseases/a-z/folliculitis/",
  },
};

export function getBreakoutFirstCare(candidates) {
  const keys = candidates.map(({ key }) => key).filter(key => key !== "irritation");
  if (keys.includes("shaving")) return breakoutFirstCare.shaving;
  if (keys.length > 1) return breakoutFirstCare.overlap;
  return breakoutFirstCare[keys[0]] ?? breakoutFirstCare.unclear;
}
