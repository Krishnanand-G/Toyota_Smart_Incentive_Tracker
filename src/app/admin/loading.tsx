import { GlassSkeleton } from "@/components/glass";

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      <GlassSkeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <GlassSkeleton className="h-64 w-full" />
        <GlassSkeleton className="h-64 w-full" />
      </div>
    </div>
  );
}
