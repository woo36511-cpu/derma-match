const fragranceProduct = /향수|퍼퓸\s*(?:미스트|스프레이)|오\s*(?:드|데)\s*(?:퍼퓸|파르펭|뚜왈렛|뚜알렛|코롱)|(?:바디|헤어|룸)\s*(?:미스트|스프레이)|\b(?:eau\s+de\s+(?:parfum|toilette|cologne)|(?:body|hair|room|perfume)\s+(?:mist|spray)|perfume|cologne)\b/iu;

module.exports = name => fragranceProduct.test(name.normalize("NFKC"));
