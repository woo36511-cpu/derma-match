import ProductCard from "./ProductCard";

export default function RoutineCard({ title, toner, serum, cream }) {
  return (
    <section className="space-y-4">
      <h2 className="text-2xl font-bold">{title}</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {toner && <ProductCard product={toner} />}
        {serum && <ProductCard product={serum} />}
        {cream && <ProductCard product={cream} />}
      </div>
    </section>
  );
}