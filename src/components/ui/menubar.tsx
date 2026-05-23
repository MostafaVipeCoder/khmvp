import * as React from "react";
import { Modal } from "react-native";
import { CheckIcon, CircleIcon, ChevronRightIcon } from "lucide-react-native";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

interface MenubarContextType {
  activeMenu: string | null;
  setActiveMenu: (name: string | null) => void;
}

const MenubarContext = React.createContext<MenubarContextType | null>(null);

function Menubar({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  children?: React.ReactNode;
  style?: any;
}) {
  const [activeMenu, setActiveMenu] = React.useState<string | null>(null);

  return (
    <MenubarContext.Provider value={{ activeMenu, setActiveMenu }}>
      <View
        className={cn(
          "bg-white dark:bg-neutral-950 flex flex-row h-9 items-center gap-1 rounded-md border border-neutral-200 dark:border-neutral-800 p-1 shadow-xs",
          className
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    </MenubarContext.Provider>
  );
}

interface MenubarMenuContextType {
  value: string;
}

const MenubarMenuContext = React.createContext<MenubarMenuContextType | null>(null);

function MenubarMenu({
  value,
  children,
}: {
  value?: string;
  children?: React.ReactNode;
}) {
  const generatedId = React.useId();
  const menuValue = value || generatedId;

  return (
    <MenubarMenuContext.Provider value={{ value: menuValue }}>
      {children}
    </MenubarMenuContext.Provider>
  );
}

function MenubarPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function MenubarRadioGroup({
  value,
  onValueChange,
  children,
  ...props
}: {
  value?: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
}) {
  return <View {...props}>{children}</View>;
}

function MenubarTrigger({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}) {
  const menubarContext = React.useContext(MenubarContext);
  const menuContext = React.useContext(MenubarMenuContext);
  if (!menubarContext || !menuContext) {
    throw new Error("MenubarTrigger must be used within Menubar and MenubarMenu");
  }

  const { activeMenu, setActiveMenu } = menubarContext;
  const { value } = menuContext;
  const isOpen = activeMenu === value;

  return (
    <Pressable
      onPress={() => setActiveMenu(isOpen ? null : value)}
      className={cn(
        "flex flex-row items-center rounded-sm px-2.5 py-1 text-sm font-medium",
        isOpen ? "bg-neutral-100 dark:bg-neutral-800" : "",
        className
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function MenubarContent({
  className,
  style,
  children,
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  const menubarContext = React.useContext(MenubarContext);
  const menuContext = React.useContext(MenubarMenuContext);
  if (!menubarContext || !menuContext) {
    throw new Error("MenubarContent must be used within Menubar and MenubarMenu");
  }

  const { activeMenu, setActiveMenu } = menubarContext;
  const { value } = menuContext;
  const isOpen = activeMenu === value;

  return (
    <Modal
      visible={isOpen}
      transparent
      animationType="fade"
      onRequestClose={() => setActiveMenu(null)}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/40"
        onPress={() => setActiveMenu(null)}
      >
        <Pressable
          className={cn(
            "bg-white dark:bg-neutral-900 w-[80%] max-w-[320px] rounded-lg border border-neutral-200 dark:border-neutral-800 p-1 shadow-lg",
            className
          )}
          style={style}
          onPress={(e) => e.stopPropagation()}
        >
          {children}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

function MenubarGroup({ children, ...props }: { children: React.ReactNode }) {
  return <View {...props}>{children}</View>;
}

interface MenubarItemProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  inset?: boolean;
  variant?: "default" | "destructive";
}

function MenubarItem({
  className,
  style,
  children,
  onPress,
  inset,
  variant = "default",
  ...props
}: MenubarItemProps) {
  const menubarContext = React.useContext(MenubarContext);
  const setActiveMenu = menubarContext?.setActiveMenu;

  const handlePress = () => {
    if (setActiveMenu) setActiveMenu(null);
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "flex flex-row items-center gap-2 rounded-sm px-3 py-2 text-sm",
        inset && "pl-8",
        variant === "destructive" ? "active:bg-destructive/10 dark:active:bg-destructive/20" : "active:bg-neutral-100 dark:active:bg-neutral-800",
        className
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text
          className={cn(
            "text-sm font-medium",
            variant === "destructive" ? "text-red-500" : "text-neutral-900 dark:text-neutral-50"
          )}
        >
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

interface MenubarCheckboxItemProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: () => void;
}

function MenubarCheckboxItem({
  className,
  style,
  children,
  checked,
  onCheckedChange,
  onPress,
  ...props
}: MenubarCheckboxItemProps) {
  const menubarContext = React.useContext(MenubarContext);
  const setActiveMenu = menubarContext?.setActiveMenu;

  const handlePress = () => {
    if (setActiveMenu) setActiveMenu(null);
    if (onCheckedChange) onCheckedChange(!checked);
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "flex flex-row items-center gap-2 rounded-sm py-2 pr-3 pl-8 text-sm active:bg-neutral-100 dark:active:bg-neutral-800",
        className
      )}
      style={style}
      {...props}
    >
      <View className="absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CheckIcon className="size-4 text-neutral-900 dark:text-neutral-50" />}
      </View>
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function MenubarRadioItem({
  className,
  style,
  children,
  checked,
  onPress,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  checked?: boolean;
  onPress?: () => void;
}) {
  const menubarContext = React.useContext(MenubarContext);
  const setActiveMenu = menubarContext?.setActiveMenu;

  const handlePress = () => {
    if (setActiveMenu) setActiveMenu(null);
    if (onPress) onPress();
  };

  return (
    <Pressable
      onPress={handlePress}
      className={cn(
        "flex flex-row items-center gap-2 rounded-sm py-2 pr-3 pl-8 text-sm active:bg-neutral-100 dark:active:bg-neutral-800",
        className
      )}
      style={style}
      {...props}
    >
      <View className="absolute left-2 flex size-3.5 items-center justify-center">
        {checked && <CircleIcon className="size-2 fill-current text-neutral-900 dark:text-neutral-50" />}
      </View>
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function MenubarLabel({
  className,
  style,
  children,
  inset,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  inset?: boolean;
}) {
  return (
    <View
      className={cn("px-3 py-1.5", inset && "pl-8", className)}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function MenubarSeparator({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: any;
}) {
  return (
    <View
      className={cn("bg-neutral-200 dark:bg-neutral-800 -mx-1 my-1 h-px", className)}
      style={style}
      {...props}
    />
  );
}

function MenubarShortcut({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}) {
  return (
    <View className="ml-auto" style={style} {...props}>
      {typeof children === "string" ? (
        <Text className={cn("text-xs text-neutral-400 tracking-widest", className)}>
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

function MenubarSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function MenubarSubTrigger({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}) {
  return (
    <View
      className={cn("flex flex-row items-center justify-between px-3 py-2", className)}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
      <ChevronRightIcon className="size-4 text-neutral-400" />
    </View>
  );
}

function MenubarSubContent({
  className,
  style,
  children,
  ...props
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  return (
    <View
      className={cn("pl-4 border-l border-neutral-200 dark:border-neutral-800 my-1", className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

export {
  Menubar,
  MenubarPortal,
  MenubarMenu,
  MenubarTrigger,
  MenubarContent,
  MenubarGroup,
  MenubarSeparator,
  MenubarLabel,
  MenubarItem,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarRadioGroup,
  MenubarRadioItem,
  MenubarSub,
  MenubarSubTrigger,
  MenubarSubContent,
};
