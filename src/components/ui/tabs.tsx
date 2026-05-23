import * as React from "react";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

const TabsContext = React.createContext<{
  value?: string;
  onValueChange?: (val: string) => void;
}>({
  value: undefined,
  onValueChange: () => {},
});

function Tabs({
  className,
  defaultValue,
  value,
  onValueChange,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View> & {
  defaultValue?: string;
  value?: string;
  onValueChange?: (val: string) => void;
}) {
  const [localVal, setLocalVal] = React.useState(defaultValue || value);

  React.useEffect(() => {
    if (value !== undefined) {
      setLocalVal(value);
    }
  }, [value]);

  const handleValueChange = (newVal: string) => {
    if (value === undefined) {
      setLocalVal(newVal);
    }
    if (onValueChange) {
      onValueChange(newVal);
    }
  };

  return (
    <TabsContext.Provider value={{ value: localVal, onValueChange: handleValueChange }}>
      <View className={cn("flex flex-col gap-2", className)} style={style} {...props}>
        {children}
      </View>
    </TabsContext.Provider>
  );
}

function TabsList({ className, style, ...props }: React.ComponentProps<typeof View>) {
  return (
    <View
      className={cn(
        "bg-neutral-100 dark:bg-neutral-800 text-muted-foreground inline-flex flex-row h-10 w-full items-center justify-center rounded-xl p-1",
        className,
      )}
      style={style}
      {...props}
    />
  );
}

function TabsTrigger({
  className,
  value,
  children,
  style,
  ...props
}: React.ComponentProps<typeof Pressable> & { value: string }) {
  const { value: activeValue, onValueChange } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  return (
    <Pressable
      onPress={() => onValueChange?.(value)}
      className={cn(
        "inline-flex flex-1 flex-row items-center justify-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
        isActive ? "bg-white dark:bg-neutral-900 shadow-sm text-neutral-900 dark:text-neutral-50" : "text-neutral-500 dark:text-neutral-400",
        className,
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className={cn("text-sm font-medium", isActive ? "text-neutral-900 dark:text-neutral-50" : "text-neutral-500 dark:text-neutral-400")}>
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function TabsContent({
  className,
  value,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View> & { value: string }) {
  const { value: activeValue } = React.useContext(TabsContext);
  const isActive = activeValue === value;

  if (!isActive) return null;

  return (
    <View className={cn("flex-1", className)} style={style} {...props}>
      {children}
    </View>
  );
}

export { Tabs, TabsList, TabsTrigger, TabsContent };
