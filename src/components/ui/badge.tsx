import * as React from "react";
import { View, Text } from "../../tw";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center justify-center rounded-full border px-2.5 py-0.5 text-xs font-semibold w-fit shrink-0 gap-1",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-primary text-white",
        secondary:
          "border-transparent bg-secondary text-secondary-foreground",
        destructive:
          "border-transparent bg-destructive text-white",
        outline:
          "text-foreground border-neutral-200 dark:border-neutral-800",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.ComponentProps<typeof View>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, children, style, ...props }: BadgeProps) {
  const isDefault = variant === "default" || !variant;
  const isDestructive = variant === "destructive";
  const isSecondary = variant === "secondary";

  let textClass = "text-xs font-semibold text-neutral-900 dark:text-neutral-50";
  if (isDefault || isDestructive) {
    textClass = "text-xs font-semibold text-white";
  } else if (isSecondary) {
    textClass = "text-xs font-semibold text-neutral-800 dark:text-neutral-200";
  }

  return (
    <View className={cn(badgeVariants({ variant }), className)} style={style} {...props}>
      {typeof children === "string" || typeof children === "number" ? (
        <Text className={textClass}>{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Badge, badgeVariants };
