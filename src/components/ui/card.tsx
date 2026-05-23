import * as React from "react";
import { View, Text } from "../../tw";
import { cn } from "./utils";

function Card({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "bg-card text-card-foreground flex flex-col gap-6 rounded-xl border border-neutral-200 dark:border-neutral-800",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function CardHeader({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "flex flex-col gap-1.5 px-6 pt-6",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function CardTitle({ className, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("font-semibold tracking-tight text-lg text-neutral-900 dark:text-neutral-50", className)}
      style={style}
      {...props}
    />
  );
}

function CardDescription({ className, style, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text
      className={cn("text-sm text-muted-foreground", className)}
      style={style}
      {...props}
    />
  );
}

function CardAction({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "self-start justify-self-end",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function CardContent({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn("px-6 pb-6", className)}
      style={style}
      {...props}
    />
  );
}

function CardFooter({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn("flex flex-row items-center px-6 pb-6", className)}
      style={style}
      {...props}
    />
  );
}

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
};
