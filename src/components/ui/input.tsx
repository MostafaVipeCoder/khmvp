import * as React from "react";
import { TextInput } from "../../tw";
import { cn } from "./utils";

export interface InputProps extends Omit<React.ComponentPropsWithoutRef<typeof TextInput>, "onChange"> {
  type?: string;
  onChange?: (e: any) => void;
}

const Input = React.forwardRef<any, InputProps>(
  ({ className, type, secureTextEntry, keyboardType, onChange, onChangeText, style, ...props }, ref) => {
    const isPassword = type === "password" || secureTextEntry;
    const isNumber = type === "number" || keyboardType === "numeric";

    const handleChangeText = (text: string) => {
      if (onChangeText) {
        onChangeText(text);
      }
      if (onChange) {
        onChange({ target: { value: text } });
      }
    };

    return (
      <TextInput
        ref={ref}
        secureTextEntry={isPassword}
        keyboardType={isNumber ? "numeric" : keyboardType}
        onChangeText={handleChangeText}
        className={cn(
          "placeholder:text-muted-foreground border-neutral-300 dark:border-neutral-700 min-w-0 rounded-md border px-3 py-2 text-base bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100",
          className,
        )}
        style={style}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
