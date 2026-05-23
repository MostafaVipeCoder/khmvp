import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { View, Text } from "../../tw";
import { cn } from "./utils";

const alertVariants = cva(
  "relative w-full rounded-lg border p-4 flex flex-row gap-3 items-start",
  {
    variants: {
      variant: {
        default: "bg-card text-card-foreground border-neutral-200 dark:border-neutral-800",
        destructive:
          "border-destructive/50 text-destructive dark:border-destructive bg-destructive/10",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

function Alert({
  className,
  variant,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View> & VariantProps<typeof alertVariants>) {
  return (
    <View
      className={cn(alertVariants({ variant }), className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

function AlertTitle({ className, children, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn(
        "font-medium tracking-tight text-neutral-900 dark:text-neutral-50 mb-1",
        className,
      )}
      style={style}
      {...props}
    >
      {children}
    </Text>
  );
}

function AlertDescription({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-col gap-1",
        className,
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Alert, AlertTitle, AlertDescription };
