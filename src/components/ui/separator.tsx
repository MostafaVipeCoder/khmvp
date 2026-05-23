
import { View } from "../../tw";
import { cn } from "./utils";

interface SeparatorProps {
  className?: string;
  orientation?: "horizontal" | "vertical";
  decorative?: boolean;
  style?: any;
}

function Separator({
  className,
  orientation = "horizontal",
  decorative = true,
  style,
  ...props
}: SeparatorProps) {
  return (
    <View
      className={cn(
        "bg-neutral-200 dark:bg-neutral-800 shrink-0",
        orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

export { Separator };

