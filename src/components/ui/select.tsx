"use client";

import * as React from "react";
import { Modal } from "react-native";
import { View, Text, Pressable, ScrollView } from "../../tw";
import {
  CheckIcon,
  ChevronDownIcon,
} from "lucide-react";

import { cn } from "./utils";

const SelectContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
  value?: string;
  setValue: (val: string) => void;
  onValueChange?: (val: string) => void;
  labelMap: Record<string, string>;
  setLabelMap: React.Dispatch<React.SetStateAction<Record<string, string>>>;
}>({
  open: false,
  setOpen: () => {},
  value: undefined,
  setValue: () => {},
  labelMap: {},
  setLabelMap: () => {},
});

function Select({
  value: valueProp,
  defaultValue,
  onValueChange,
  children,
}: any) {
  const [open, setOpen] = React.useState(false);
  const [valueState, setValueState] = React.useState(defaultValue || "");
  const value = valueProp !== undefined ? valueProp : valueState;
  const [labelMap, setLabelMap] = React.useState<Record<string, string>>({});

  const setValue = React.useCallback(
    (newVal: string) => {
      setValueState(newVal);
      onValueChange?.(newVal);
      setOpen(false);
    },
    [onValueChange]
  );

  return (
    <SelectContext.Provider value={{ open, setOpen, value, setValue, onValueChange, labelMap, setLabelMap }}>
      {children}
    </SelectContext.Provider>
  );
}

function SelectGroup({ children }: any) {
  return <View>{children}</View>;
}

function SelectValue({ placeholder, className, style }: any) {
  const { value, labelMap } = React.useContext(SelectContext);
  const displayValue = value ? labelMap[value] || value : placeholder;
  return (
    <Text
      className={cn("text-sm", !value && "text-muted-foreground", className)}
      style={style}
      numberOfLines={1}
    >
      {displayValue}
    </Text>
  );
}

function SelectTrigger({ className, children, style, ...props }: any) {
  const { open, setOpen } = React.useContext(SelectContext);
  return (
    <Pressable
      onPress={() => setOpen(!open)}
      className={cn(
        "flex flex-row h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm",
        className
      )}
      style={style}
      {...props}
    >
      {children}
      <ChevronDownIcon className="size-4 opacity-50 text-foreground" />
    </Pressable>
  );
}

function SelectContent({ className, children, style }: any) {
  const { open, setOpen } = React.useContext(SelectContext);

  if (!open) return null;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 justify-center items-center">
        <Pressable className="absolute inset-0 bg-black/20" onPress={() => setOpen(false)} />
        <View
          className={cn("w-4/5 max-h-[60%] bg-background rounded-md border border-border shadow-md overflow-hidden", className)}
          style={style}
        >
          <ScrollView className="p-1">
            {children}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

function SelectLabel({ className, children, style }: any) {
  return (
    <Text className={cn("px-2 py-1.5 text-xs font-semibold text-muted-foreground", className)} style={style}>
      {children}
    </Text>
  );
}

function SelectItem({ className, value, children, style }: any) {
  const { value: selectedValue, setValue, setLabelMap } = React.useContext(SelectContext);
  const isSelected = selectedValue === value;

  React.useEffect(() => {
    if (typeof children === "string") {
      setLabelMap((prev) => {
        if (prev[value] !== children) {
          return { ...prev, [value]: children };
        }
        return prev;
      });
    }
  }, [value, children, setLabelMap]);

  return (
    <Pressable
      onPress={() => setValue(value)}
      className={cn(
        "relative flex flex-row w-full items-center rounded-sm py-1.5 pl-8 pr-2 text-sm",
        isSelected ? "bg-accent" : "hover:bg-accent/50",
        className
      )}
      style={style}
    >
      <View className="absolute left-2 flex size-3.5 items-center justify-center">
        {isSelected && <CheckIcon className="size-4 text-foreground" />}
      </View>
      <Text className={cn("text-sm text-foreground", isSelected ? "font-medium" : "")}>{children}</Text>
    </Pressable>
  );
}

function SelectSeparator({ className, style }: any) {
  return <View className={cn("-mx-1 my-1 h-px bg-muted", className)} style={style} />;
}

// Stub scroll buttons since we use ScrollView
function SelectScrollUpButton() { return null; }
function SelectScrollDownButton() { return null; }

export {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectScrollDownButton,
  SelectScrollUpButton,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
};

