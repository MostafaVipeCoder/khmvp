import * as React from "react";
import { SearchIcon } from "lucide-react-native";
import { View, Text, Pressable, ScrollView, TextInput as RNTextInput } from "../../tw";
import { cn } from "./utils";
import {
  Dialog,
  DialogContent,
} from "./dialog";

interface CommandContextType {
  search: string;
  setSearch: (search: string) => void;
}

const CommandContext = React.createContext<CommandContextType | null>(null);

function Command({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  const [search, setSearch] = React.useState("");

  return (
    <CommandContext.Provider value={{ search, setSearch }}>
      <View
        className={cn(
          "bg-white dark:bg-neutral-900 flex h-full w-full flex-col overflow-hidden rounded-md",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    </CommandContext.Provider>
  );
}

function CommandDialog({
  children,
  ...props
}: React.ComponentProps<typeof Dialog>) {
  return (
    <Dialog {...props}>
      <DialogContent className="overflow-hidden p-0 max-w-[400px]">
        <Command className="h-[400px]">
          {children}
        </Command>
      </DialogContent>
    </Dialog>
  );
}

function CommandInput({
  className,
  placeholder = "Type a command or search...",
  style,
  ...props
}: {
  className?: string;
  placeholder?: string;
  style?: any;
}) {
  const context = React.useContext(CommandContext);
  if (!context) throw new Error("CommandInput must be used within Command");

  const { search, setSearch } = context;

  return (
    <View
      className="flex flex-row h-12 items-center gap-2 border-b border-neutral-200 dark:border-neutral-800 px-3"
      style={style}
    >
      <SearchIcon className="size-4 shrink-0 opacity-50 text-neutral-500 dark:text-neutral-400" />
      <RNTextInput
        value={search}
        onChangeText={setSearch}
        placeholder={placeholder}
        placeholderTextColor="#a3a3a3"
        className={cn(
          "flex-1 h-10 text-neutral-900 dark:text-neutral-50 text-sm",
          className
        )}
        {...props}
      />
    </View>
  );
}

function CommandList({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  return (
    <ScrollView
      className={cn("flex-1 p-1", className)}
      style={style}
      keyboardShouldPersistTaps="handled"
      {...props}
    >
      {children}
    </ScrollView>
  );
}

function CommandEmpty({
  children = "No results found.",
  className,
  style,
  ...props
}: {
  children?: React.ReactNode;
  className?: string;
  style?: any;
}) {
  return (
    <View className={cn("py-6 items-center justify-center", className)} style={style} {...props}>
      {typeof children === "string" ? (
        <Text className="text-sm text-neutral-500 dark:text-neutral-400">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

function CommandGroup({
  heading,
  className,
  children,
  style,
  ...props
}: {
  heading?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View className={cn("overflow-hidden p-1", className)} style={style} {...props}>
      {heading && (
        <View className="px-2 py-1.5">
          {typeof heading === "string" ? (
            <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">{heading}</Text>
          ) : (
            heading
          )}
        </View>
      )}
      {children}
    </View>
  );
}

function CommandSeparator({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: any;
}) {
  return (
    <View
      className={cn("bg-neutral-200 dark:bg-neutral-800 -mx-1 h-px my-1", className)}
      style={style}
      {...props}
    />
  );
}

function CommandItem({
  className,
  children,
  onSelect,
  style,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  onSelect?: () => void;
  style?: any;
}) {
  return (
    <Pressable
      onPress={onSelect}
      className={cn(
        "flex flex-row items-center gap-2 rounded-sm px-2 py-2.5 active:bg-neutral-100 dark:active:bg-neutral-800",
        className
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function CommandShortcut({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  return (
    <View className="ml-auto" style={style} {...props}>
      {typeof children === "string" ? (
        <Text className={cn("text-xs text-neutral-400 dark:text-neutral-500 tracking-widest", className)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export {
  Command,
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandShortcut,
  CommandSeparator,
};
