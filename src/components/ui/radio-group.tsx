import * as React from "react";
import { View, Pressable } from "../../tw";
import { CircleIcon } from "lucide-react-native";
import { cn } from "./utils";

const RadioGroupContext = React.createContext<{
  value?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
}>({});

interface RadioGroupProps {
  value?: string;
  defaultValue?: string;
  onValueChange?: (value: string) => void;
  disabled?: boolean;
  className?: string;
  children?: React.ReactNode;
  style?: any;
}

function RadioGroup({
  className,
  value,
  defaultValue,
  onValueChange,
  disabled,
  children,
  style,
  ...props
}: RadioGroupProps) {
  const [localValue, setLocalValue] = React.useState(defaultValue || value);

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalValue(value);
    }
  }, [value]);

  const handleValueChange = (newVal: string) => {
    if (disabled) return;
    if (value === undefined) {
      setLocalValue(newVal);
    }
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  return (
    <RadioGroupContext.Provider value={{ value: localValue, onValueChange: handleValueChange, disabled }}>
      <View className={cn("flex flex-col gap-3", className)} style={style} {...props}>
        {children}
      </View>
    </RadioGroupContext.Provider>
  );
}

interface RadioGroupItemProps {
  value: string;
  id?: string;
  disabled?: boolean;
  className?: string;
  style?: any;
}

function RadioGroupItem({
  value,
  id,
  disabled: itemDisabled,
  className,
  style,
  ...props
}: RadioGroupItemProps) {
  const context = React.useContext(RadioGroupContext);
  const disabled = itemDisabled || context.disabled;
  const isChecked = context.value === value;

  const handlePress = () => {
    if (disabled) return;
    context.onValueChange?.(value);
  };

  return (
    <Pressable
      onPress={handlePress}
      disabled={disabled}
      className={cn(
        "aspect-square size-4 shrink-0 rounded-full border border-primary shadow-sm justify-center items-center transition-colors",
        disabled && "opacity-50",
        className
      )}
      style={style}
      {...props}
    >
      {isChecked && (
        <CircleIcon className="fill-primary text-primary size-2.5" />
      )}
    </Pressable>
  );
}

export { RadioGroup, RadioGroupItem };

