import * as React from "react";
import { View } from "../../tw";
import { cn } from "./utils";

interface AspectRatioProps {
  ratio?: number;
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function AspectRatio({ ratio = 1, className, style, ...props }: AspectRatioProps) {
  return (
    <View
      className={cn("w-full overflow-hidden", className)}
      style={[{ aspectRatio: ratio }, style]}
      {...props}
    />
  );
}

export { AspectRatio };
