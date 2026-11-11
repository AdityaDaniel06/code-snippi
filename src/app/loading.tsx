export default function Loading() {
  return (
    <div className="container-app pb-24 pt-10" aria-busy="true" aria-label="Loading">
      <div className="skeleton h-8 w-40" />
      <div className="skeleton mt-3 h-4 w-56" />
      <div className="skeleton mt-8 h-11 w-full" />
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="rounded-xl bg-surface-1 p-4">
            <div className="flex justify-between gap-4">
              <div className="skeleton h-4 w-1/2" />
              <div className="skeleton h-4 w-16" />
            </div>
            <div className="skeleton mt-3 h-[8.6rem] w-full" />
            <div className="skeleton mt-3 h-3 w-20" />
          </div>
        ))}
      </div>
    </div>
  );
}
