import { GlassSkeleton } from "@/components/glass";

export default function AdminLoading() {
  return (
    <div className="space-y-4 lg:space-y-6">
      <GlassSkeleton className="h-8 w-48 lg:h-10 lg:w-72" />
      <div className="grid grid-cols-2 gap-2 lg:grid-cols-4 lg:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <GlassSkeleton
            key={i}
            className={`h-16 w-full lg:h-20 ${i === 4 ? "col-span-2 lg:col-span-1" : ""}`}
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        <GlassSkeleton className="h-52 w-full lg:h-64" />
        <GlassSkeleton className="h-52 w-full lg:h-64" />
      </div>
    </div>
  );
}
