"use client";


import { View } from "../../tw";
import { GripVerticalIcon } from "lucide-react";
import { cn } from "./utils";

function ResizablePanelGroup({ className, style, direction, ...props }: any) {
  return (
    <View
      data-slot="resizable-panel-group"
      className={cn(
        "flex h-full w-full",
        direction === "vertical" ? "flex-col" : "flex-row",
        className
      )}
      style={style}
      {...props}
    />
  );
}

function ResizablePanel({ className, style, ...props }: any) {
  return (
    <View
      data-slot="resizable-panel"
      className={cn("flex-1", className)}
      style={style}
      {...props}
    />
  );
}

function ResizableHandle({ withHandle, className, style, ...props }: any) {
  return (
    <View
      data-slot="resizable-handle"
      className={cn("bg-border flex items-center justify-center", className)}
      style={style}
      {...props}
    >
      {withHandle && (
        <View className="bg-border z-10 flex h-4 w-3 items-center justify-center rounded-xs border">
          <GripVerticalIcon className="size-2.5 text-muted-foreground" />
        </View>
      )}
    </View>
  );
}

export { ResizablePanelGroup, ResizablePanel, ResizableHandle };


