import { GlassSkeleton } from "@/components/glass";

export default function OfficerLoading() {
  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
      <div className="space-y-4 lg:col-span-2">
        {[1, 2, 3].map((i) => (
          <GlassSkeleton key={i} className="h-24 w-full" />
        ))}
      </div>
      <GlassSkeleton className="h-64 w-full" />
    </div>
  );
}
