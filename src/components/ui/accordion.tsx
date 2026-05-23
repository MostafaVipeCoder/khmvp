import * as React from "react";
import { ChevronDownIcon } from "lucide-react-native";
import { View, Pressable, Text } from "../../tw";
import { cn } from "./utils";

interface AccordionContextType {
  openItems: string[];
  handleToggle: (value: string) => void;
}

const AccordionContext = React.createContext<AccordionContextType | null>(null);

interface AccordionProps {
  type?: "single" | "multiple";
  value?: string | string[];
  defaultValue?: string | string[];
  onValueChange?: (value: any) => void;
  collapsible?: boolean;
  children?: React.ReactNode;
  className?: string;
  style?: any;
}

function Accordion({
  type = "single",
  value,
  defaultValue,
  onValueChange,
  collapsible = true,
  children,
  className,
  style,
  ...props
}: AccordionProps) {
  const [openItems, setOpenItems] = React.useState<string[]>(() => {
    if (defaultValue) {
      return Array.isArray(defaultValue) ? defaultValue : [defaultValue];
    }
    if (value) {
      return Array.isArray(value) ? value : [value];
    }
    return [];
  });

  React.useEffect(() => {
    if (value !== undefined) {
      setOpenItems(Array.isArray(value) ? value : [value]);
    }
  }, [value]);

  const handleToggle = (itemValue: string) => {
    let nextOpenItems: string[];
    if (type === "single") {
      if (openItems.includes(itemValue)) {
        nextOpenItems = collapsible ? [] : [itemValue];
      } else {
        nextOpenItems = [itemValue];
      }
    } else {
      if (openItems.includes(itemValue)) {
        nextOpenItems = openItems.filter((v) => v !== itemValue);
      } else {
        nextOpenItems = [...openItems, itemValue];
      }
    }

    if (value === undefined) {
      setOpenItems(nextOpenItems);
    }

    if (onValueChange) {
      onValueChange(type === "single" ? nextOpenItems[0] || "" : nextOpenItems);
    }
  };

  return (
    <AccordionContext.Provider value={{ openItems, handleToggle }}>
      <View className={cn("w-full", className)} style={style} {...props}>
        {children}
      </View>
    </AccordionContext.Provider>
  );
}

interface AccordionItemContextType {
  value: string;
  isOpen: boolean;
  toggle: () => void;
}

const AccordionItemContext = React.createContext<AccordionItemContextType | null>(null);

interface AccordionItemProps {
  value: string;
  className?: string;
  children?: React.ReactNode;
  style?: any;
}

function AccordionItem({
  value,
  className,
  children,
  style,
  ...props
}: AccordionItemProps) {
  const context = React.useContext(AccordionContext);
  if (!context) {
    throw new Error("AccordionItem must be used within an Accordion");
  }

  const { openItems, handleToggle } = context;
  const isOpen = openItems.includes(value);
  const toggle = () => handleToggle(value);

  return (
    <AccordionItemContext.Provider value={{ value, isOpen, toggle }}>
      <View
        className={cn("border-b border-neutral-200 dark:border-neutral-800", className)}
        style={style}
        {...props}
      >
        {children}
      </View>
    </AccordionItemContext.Provider>
  );
}

interface AccordionTriggerProps {
  className?: string;
  children?: React.ReactNode;
  style?: any;
}

function AccordionTrigger({
  className,
  children,
  style,
  ...props
}: AccordionTriggerProps) {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionTrigger must be used within an AccordionItem");
  }

  const { isOpen, toggle } = context;

  return (
    <Pressable
      onPress={toggle}
      className={cn(
        "flex flex-row items-center justify-between py-4",
        className
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="flex-1 text-left font-medium text-sm text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
      <ChevronDownIcon
        className={cn(
          "text-muted-foreground size-4 shrink-0 transition-transform duration-200",
          isOpen && "rotate-180"
        )}
      />
    </Pressable>
  );
}

interface AccordionContentProps {
  className?: string;
  children?: React.ReactNode;
  style?: any;
}

function AccordionContent({
  className,
  children,
  style,
  ...props
}: AccordionContentProps) {
  const context = React.useContext(AccordionItemContext);
  if (!context) {
    throw new Error("AccordionContent must be used within an AccordionItem");
  }

  const { isOpen } = context;

  if (!isOpen) return null;

  return (
    <View
      className={cn("pt-0 pb-4 text-sm", className)}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Accordion, AccordionItem, AccordionTrigger, AccordionContent };
