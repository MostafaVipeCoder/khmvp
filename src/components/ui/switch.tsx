import * as React from "react";
import { Pressable, View } from "../../tw";
import { cn } from "./utils";

interface SwitchProps {
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
}

function Switch({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  style,
  ...props
}: SwitchProps) {
  const [localChecked, setLocalChecked] = React.useState(defaultChecked || checked);

  React.useEffect(() => {
    if (checked !== undefined) {
      setLocalChecked(checked);
    }
  }, [checked]);

  const handlePress = () => {
    if (disabled) return;
    const nextChecked = !localChecked;
    if (checked === undefined) {
      setLocalChecked(nextChecked);
    }
    if (onCheckedChange) {
      onCheckedChange(nextChecked);
    }
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        "peer inline-flex h-[1.15rem] w-8 shrink-0 items-center rounded-full border-2 border-transparent transition-colors",
        localChecked ? "bg-primary" : "bg-neutral-200 dark:bg-neutral-800",
        disabled && "opacity-50",
        className,
      )}
      style={style}
      {...props}
    >
      <View
        className={cn(
          "bg-white dark:bg-neutral-950 pointer-events-none block size-3.5 rounded-full ring-0 shadow-sm transition-transform",
          localChecked ? "translate-x-[14px]" : "translate-x-0"
        )}
      />
    </Pressable>
  );
}

export { Switch };

