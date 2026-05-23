import { cn } from "./utils";
import { Card } from './card';
import { View } from "../../tw";

function Skeleton({ className, ...props }: any) {
  return (
    <View
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
      <View className="flex gap-4 animate-pulse">
        {/* Avatar Skeleton */}
        <Skeleton className="w-16 h-16 rounded-full flex-shrink-0" />

        <View className="flex-1 space-y-3">
          {/* Header Skeleton */}
          <View className="flex items-start justify-between">
            <View className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-20" />
            </View>
            <Skeleton className="h-6 w-24 rounded-full" />
          </View>

          {/* Details Skeleton */}
          <View className="space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-4 w-32" />
          </View>

          {/* Footer Skeleton */}
          <View className="flex items-center justify-between pt-2">
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-9 w-28" />
          </View>
        </View>
      </View>
    </Card>
  );
}

export function SitterCardSkeleton() {
  return (
    <Card className="p-4">
      <View className="flex gap-4 animate-pulse">
        {/* Avatar Skeleton */}
        <View className="relative flex-shrink-0">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="absolute bottom-0 right-0 w-4 h-4 rounded-full" />
        </View>

        <View className="flex-1 space-y-3">
          {/* Header Skeleton */}
          <View className="flex items-start justify-between">
            <View className="space-y-2">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-4 w-28" />
            </View>
            <Skeleton className="h-6 w-24 rounded-full" />
          </View>

          {/* Rating Skeleton */}
          <View className="flex items-center gap-2">
            <Skeleton className="h-4 w-4 rounded" />
            <Skeleton className="h-4 w-16" />
          </View>

          {/* Badges Skeleton */}
          <View className="flex gap-2 flex-wrap">
            <Skeleton className="h-6 w-20 rounded-full" />
            <Skeleton className="h-6 w-24 rounded-full" />
            <Skeleton className="h-6 w-16 rounded-full" />
          </View>

          {/* Footer Skeleton */}
          <View className="flex items-center justify-between pt-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-9 w-28" />
          </View>
        </View>
      </View>
    </Card>
  );
}

export function ProfileSkeleton() {
  return (
    <View className="space-y-6">
      {/* Header Skeleton */}
      <Card className="p-6">
        <View className="flex flex-col items-center space-y-4 animate-pulse">
          <Skeleton className="w-24 h-24 rounded-full" />
          <Skeleton className="h-6 w-40" />
          <Skeleton className="h-4 w-32" />
        </View>
      </Card>

      {/* Stats Skeleton */}
      <View className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="p-4">
            <View className="space-y-3 animate-pulse">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-6 w-16" />
            </View>
          </Card>
        ))}
      </View>

      {/* Content Skeleton */}
      <Card className="p-6">
        <View className="space-y-4 animate-pulse">
          <Skeleton className="h-5 w-32" />
          <View className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-4 w-4/6" />
          </View>
        </View>
      </Card>
    </View>
  );
}

export function NotificationSkeleton() {
  return (
    <View className="p-4 border-b">
      <View className="flex gap-3 animate-pulse">
        <Skeleton className="w-10 h-10 rounded-full flex-shrink-0" />
        <View className="flex-1 space-y-2">
          <View className="flex items-start justify-between gap-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="w-2 h-2 rounded-full" />
          </View>
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
          <Skeleton className="h-3 w-20" />
        </View>
      </View>
    </View>
  );
}

export function ListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <View className="space-y-4">
      {[...Array(count)].map((_, i) => (
        <BookingCardSkeleton key={i} />
      ))}
    </View>
  );
}

export { Skeleton };
