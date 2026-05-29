import { GlassSkeleton } from "@/components/glass";

export default function AdminLoading() {
  return (
    <div className="space-y-4">
      <GlassSkeleton className="h-10 w-64" />
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <GlassSkeleton key={i} className="h-64 w-full" />
        ))}
      </div>
    </div>
  );
}
