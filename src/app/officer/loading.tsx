import { GlassSkeleton } from "@/components/glass";

export default function OfficerLoading() {
  return (
    <div className="space-y-6">
      <GlassSkeleton className="h-10 w-72" />
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <GlassSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>
      <GlassSkeleton className="h-64 w-full" />
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <GlassSkeleton className="h-80 w-full lg:col-span-2" />
        <GlassSkeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
