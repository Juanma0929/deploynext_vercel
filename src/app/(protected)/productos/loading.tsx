/** Shown while the server asks the API for the products and the suppliers. */
export default function ProductsLoading() {
  return (
    <section aria-busy="true" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="h-8 w-40 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-72 animate-pulse rounded bg-slate-200" />
      </div>
      <div className="h-36 animate-pulse rounded-lg bg-slate-200" />
      <div className="flex flex-col gap-2">
        {Array.from({ length: 6 }, (_, index) => (
          <div key={index} className="h-12 animate-pulse rounded bg-slate-200" />
        ))}
      </div>
      <p role="status" className="sr-only">
        Cargando el inventario…
      </p>
    </section>
  );
}
