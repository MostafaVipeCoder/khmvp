import * as React from "react";
import { View, ScrollView } from "../../tw";
import { cn } from "./utils";

interface ScrollAreaProps extends React.ComponentPropsWithoutRef<typeof ScrollView> {
  className?: string;
  children: React.ReactNode;
}

function ScrollArea({
  className,
  children,
  ...props
}: ScrollAreaProps) {
  return (
    <ScrollView
      className={cn("relative", className)}
      showsVerticalScrollIndicator={true}
      showsHorizontalScrollIndicator={true}
      {...props}
    >
      <View className="flex-1">
        {children}
      </View>
    </ScrollView>
  );
}

function ScrollBar() {
  // ScrollBar is handled natively by ScrollView indicators on mobile.
  return null;
}

export { ScrollArea, ScrollBar };

