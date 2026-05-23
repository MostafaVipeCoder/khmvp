import * as React from "react";
import { Pressable } from "../../tw";
import { Check } from "lucide-react-native";
import { cn } from "./utils";

export interface CheckboxProps {
  id?: string;
  className?: string;
  checked?: boolean;
  defaultChecked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  disabled?: boolean;
  style?: any;
}

function Checkbox({
  className,
  checked,
  defaultChecked = false,
  onCheckedChange,
  disabled,
  style,
  ...props
}: CheckboxProps) {
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
        "peer border size-5 shrink-0 rounded-[4px] border-neutral-300 dark:border-neutral-700 bg-white dark:bg-neutral-900 justify-center items-center shadow-sm",
        localChecked && "bg-primary border-primary",
        disabled && "opacity-50",
        className,
      )}
      style={style}
      {...props}
    >
      {localChecked && (
        <Check className="size-3.5 text-white dark:text-neutral-900" />
      )}
    </Pressable>
  );
}

export { Checkbox };
