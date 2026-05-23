import * as React from "react";
import { Pressable, Text } from "../../tw";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const toggleVariants = cva(
  "flex flex-row items-center justify-center gap-2 rounded-md transition-colors",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-neutral-200 dark:border-neutral-800 bg-transparent",
      },
      size: {
        default: "h-9 px-3",
        sm: "h-8 px-2",
        lg: "h-10 px-4",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

export interface ToggleProps extends React.ComponentPropsWithoutRef<typeof Pressable>, VariantProps<typeof toggleVariants> {
  pressed?: boolean;
  defaultPressed?: boolean;
  onPressedChange?: (pressed: boolean) => void;
  textClassName?: string;
  children?: React.ReactNode;
}

function Toggle({
  className,
  variant,
  size,
  pressed,
  defaultPressed = false,
  onPressedChange,
  textClassName,
  children,
  style,
  ...props
}: ToggleProps) {
  const [localPressed, setLocalPressed] = React.useState(defaultPressed || pressed);

  React.useEffect(() => {
    if (pressed !== undefined) {
      setLocalPressed(pressed);
    }
  }, [pressed]);

  const handlePress = () => {
    const nextPressed = !localPressed;
    if (pressed === undefined) {
      setLocalPressed(nextPressed);
    }
    if (onPressedChange) {
      onPressedChange(nextPressed);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        toggleVariants({ variant, size }),
        localPressed ? "bg-neutral-100 dark:bg-neutral-800" : "",
        className
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className={cn("text-sm font-medium", localPressed ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-600 dark:text-neutral-400", textClassName)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export { Toggle, toggleVariants };

