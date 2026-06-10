export default function ProductCard({ product }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border p-4 flex flex-col gap-3">
      <img
        src={product.image}
        alt={product.name}
        className="w-full h-52 object-cover rounded-xl"
      />

      <div>
        <p className="text-sm text-gray-500">{product.brand}</p>
        <h3 className="text-lg font-bold break-keep">{product.name}</h3>
      </div>

      <p className="text-sm text-gray-700 break-keep">{product.shortReason}</p>

      <div className="flex flex-wrap gap-2">
        {product.ratingTags.map((tag, index) => (
          <span
            key={index}
            className="text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>

      <div className="text-sm text-gray-600 space-y-1">
        <p>수분감 단계: {product.hydrationLevel}</p>
        <p>성분: {product.ingredients.join(", ")}</p>
        <p>가격: {product.price.toLocaleString()}원</p>
      </div>

      {product.caution?.length > 0 && (
        <div className="bg-amber-50 rounded-xl p-3 text-sm text-amber-800">
          주의: {product.caution.join(", ")}
        </div>
      )}

      <a
        href={product.affiliateLink}
        target="_blank"
        rel="noreferrer"
        className="mt-auto text-center bg-black text-white rounded-xl py-3 font-semibold hover:opacity-90 transition"
      >
        쿠팡에서 보기
      </a>
    </div>
  );
}