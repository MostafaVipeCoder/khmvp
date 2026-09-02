import { cn } from "./utils";
import { Card } from './card';

function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      className={cn("bg-accent animate-pulse rounded-md", className)}
      {...props}
    />
  );
}

// Specialized Skeleton Components for better UX

export function BookingCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4 animate-pulse">
        {/* Avatar Skeleton */}
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />

        <div className="flex-1 space-y-3">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Details Skeleton */}
          <div className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-32" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function SitterCardSkeleton() {
  return (
    <Card className="p-4">
      <div className="flex gap-4 animate-pulse">
        {/* Avatar Skeleton */}
        <div className="relative flex-shrink-0">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="absolute bottom-0 right-0 w-4 h-4 rounded-full" />
        </div>

        <div className="flex-1 space-y-3">
          {/* Header Skeleton */}
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>

          {/* Rating Skeleton */}
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </div>

          {/* Badges Skeleton */}
          <div className="flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </div>

          {/* Footer Skeleton */}
          <div className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-28" />
          </div>
        </div>
      </div>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header Skeleton */}
      <Card className="p-6">
        <div className="flex flex-col items-center space-y-4 animate-pulse">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </div>
      </Card>

      {/* Stats Skeleton */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <div className="space-y-3 animate-pulse">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </div>
          </Card>
        ))}
      </div>

      {/* Content Skeleton */}
      <Card className="p-6">
        <div className="space-y-4 animate-pulse">
          <Skeleton className="h-5 w-32" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </div>
        </div>
      </Card>
    </div>
  );
}

export function NotificationSkeleton() {
  return (
    <div className="p-4 border-b">
      <div className="flex gap-3 animate-pulse">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </div>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
    </div>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </div>
  );
}

export { Skeleton };
