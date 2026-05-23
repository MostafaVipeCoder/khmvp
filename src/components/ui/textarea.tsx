import * as React from "react";
import { TextInput } from "../../tw";
import { cn } from "./utils";

export interface TextareaProps extends Omit<React.ComponentPropsWithoutRef<typeof TextInput>, "onChange"> {
  onChange?: (e: any) => void;
}

const Textarea = React.forwardRef<any, TextareaProps>(
  ({ className, onChange, onChangeText, style, ...props }, ref) => {
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
        multiline={true}
        numberOfLines={4}
        onChangeText={handleChangeText}
        className={cn(
          "placeholder:text-muted-foreground border-neutral-300 dark:border-neutral-700 min-w-0 rounded-md border px-3 py-2 text-base bg-white dark:bg-neutral-900 text-neutral-900 dark:text-neutral-100 min-h-16",
          className,
        )}
        style={style}
        {...props}
      />
    );
  }
);

Textarea.displayName = "Textarea";

export { Textarea };
