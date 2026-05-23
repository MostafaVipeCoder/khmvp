import * as React from "react";
import { View } from "../../tw";
import { type VariantProps } from "class-variance-authority";

import { cn } from "./utils";
import { Toggle, toggleVariants } from "./toggle";

const ToggleGroupContext = React.createContext<{
  variant?: VariantProps<typeof toggleVariants>["variant"];
  size?: VariantProps<typeof toggleVariants>["size"];
  value?: string | string[];
  onValueChange?: (value: any) => void;
  type?: "single" | "multiple";
}>({
  size: "default",
  variant: "default",
  type: "single",
});

export interface ToggleGroupProps extends React.ComponentPropsWithoutRef<typeof View>, VariantProps<typeof toggleVariants> {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
}

function ToggleGroup({
  className,
  variant,
  size,
  type = "single",
  value,
  defaultValue,
  onValueChange,
  children,
  style,
  ...props
}: ToggleGroupProps) {
  const [localValue, setLocalValue] = React.useState<string | string[] | undefined>(
    defaultValue || value
  );

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleValueChange = (newVal: string) => {
    let nextValue: any;
    if (type === "single") {
      nextValue = localValue === newVal ? "" : newVal;
    } else {
      const arr = Array.isArray(localValue) ? localValue : [];
      if (arr.includes(newVal)) {
        nextValue = arr.filter((v) => v !== newVal);
      } else {
        nextValue = [...arr, newVal];
      }
    }

    if (value === undefined) {
      setLocalValue(nextValue);
    }
    if (onValueChange) {
      onValueChange(nextValue);
    }
  };

  return (
    <View
      className={cn(
        "flex flex-row items-center justify-center gap-1",
        className,
      )}
      style={style}
      {...props}
    >
      <ToggleGroupContext.Provider value={{ variant, size, type, value: localValue, onValueChange: handleValueChange }}>
        {children}
      </ToggleGroupContext.Provider>
    </View>
  );
}

export interface ToggleGroupItemProps extends React.ComponentPropsWithoutRef<typeof Toggle> {
  value: string;
}

function ToggleGroupItem({
  className,
  children,
  variant,
  size,
  value,
  ...props
}: ToggleGroupItemProps) {
  const context = React.useContext(ToggleGroupContext);

  const isPressed = React.useMemo(() => {
    if (context.type === "single") {
      return context.value === value;
    } else {
      return Array.isArray(context.value) && context.value.includes(value);
    }
  }, [context.value, context.type, value]);

  return (
    <Toggle
      variant={context.variant || variant}
      size={context.size || size}
      pressed={isPressed}
      onPressedChange={() => {
        if (context.onValueChange) {
          context.onValueChange(value);
        }
      }}
      className={cn(className)}
      {...props}
    >
      {children}
    </Toggle>
  );
}

export { ToggleGroup, ToggleGroupItem };

