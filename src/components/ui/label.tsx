import * as React from "react";
import { Text } from "../../tw";
import { cn } from "./utils";

function Label({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "flex items-center gap-2 text-sm leading-none font-medium text-neutral-700 dark:text-neutral-300",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

export { Label };
