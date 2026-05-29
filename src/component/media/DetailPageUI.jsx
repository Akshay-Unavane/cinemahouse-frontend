export function DetailSkeleton() {
  return (
    <div className="min-h-screen bg-black pt-24 animate-pulse">
      <div className="h-[50vh] bg-white/5" />
      <div className="max-w-7xl mx-auto px-4 -mt-32 flex flex-col md:flex-row gap-8">
        <div className="w-52 md:w-72 h-80 bg-white/10 rounded-2xl mx-auto md:mx-0" />
        <div className="flex-1 space-y-4">
          <div className="h-10 bg-white/10 rounded-lg w-3/4" />
          <div className="h-4 bg-white/5 rounded w-1/2" />
          <div className="flex gap-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-8 w-20 bg-white/5 rounded-full" />
            ))}
          </div>
          <div className="h-24 bg-white/5 rounded-xl" />
        </div>
      </div>
    </div>
  );
}

export function DetailSection({ title, children }) {
  return (
    <section className="mt-16">
      <div className="flex items-center gap-3 mb-5">
        <div className="h-8 w-1 rounded-full bg-[#01B4E4]" />
        <h2 className="section-title text-xl md:text-2xl">{title}</h2>
      </div>
      {children}
    </section>
  );
}

export function MetaPill({ children, accent }) {
  return (
    <span
      className={`px-3 py-1 rounded-full text-xs font-medium border ${
        accent
          ? "bg-[#01B4E4]/15 text-[#01B4E4] border-[#01B4E4]/30"
          : "bg-white/5 text-gray-300 border-white/10"
      }`}
    >
      {children}
    </span>
  );
}
