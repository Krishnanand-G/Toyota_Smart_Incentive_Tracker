import { GlassSkeleton } from "@/components/glass";

export default function OfficerLoading() {
  return (
    <div className="space-y-6">
      <div className="w-full max-w-sm space-y-2">
        <GlassSkeleton className="h-5 w-28" />
        <GlassSkeleton className="h-4 w-full" />
        <GlassSkeleton className="h-10 w-full" />
      </div>

      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-4 lg:gap-3">
        {[1, 2, 3, 4].map((i) => (
          <GlassSkeleton key={i} className="h-20 w-full" />
        ))}
      </div>

      <GlassSkeleton className="h-40 w-full lg:hidden" />
      <GlassSkeleton className="h-48 w-full lg:h-56" />
      <GlassSkeleton className="h-64 w-full" />
      <GlassSkeleton className="h-14 w-full lg:hidden" />
      <div className="hidden gap-4 lg:grid lg:grid-cols-3">
        <GlassSkeleton className="h-80 w-full lg:col-span-2" />
        <GlassSkeleton className="h-80 w-full" />
      </div>
    </div>
  );
}
