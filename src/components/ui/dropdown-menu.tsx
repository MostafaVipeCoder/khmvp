import * as React from "react";
import { Modal } from "react-native";
import { CheckIcon, CircleIcon, ChevronRightIcon } from "lucide-react-native";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

interface DropdownMenuContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const DropdownMenuContext = React.createContext<DropdownMenuContextType | null>(null);

function DropdownMenu({
  open: controlledOpen,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [localOpen, setLocalOpen] = React.useState(controlledOpen || false);

  React.useEffect(() => {
    if (controlledOpen !== undefined) {
      setLocalOpen(controlledOpen);
    }
  }, [controlledOpen]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (controlledOpen === undefined) {
      setLocalOpen(nextOpen);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  return (
    <DropdownMenuContext.Provider value={{ open: localOpen, setOpen: handleOpenChange }}>
      {children}
    </DropdownMenuContext.Provider>
  );
}

function DropdownMenuPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuTrigger({
  asChild = true,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuTrigger must be used within DropdownMenu");

  const { setOpen } = context;

  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onPress: () => {
        if (child.props.onPress) child.props.onPress();
        setOpen(true);
      },
    });
  }

  return (
    <Pressable onPress={() => setOpen(true)} {...props}>
      {children}
    </Pressable>
  );
}

function DropdownMenuContent({
  className,
  children,
  style,
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
}) {
  const context = React.useContext(DropdownMenuContext);
  if (!context) throw new Error("DropdownMenuContent must be used within DropdownMenu");

  const { open, setOpen } = context;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-black/40"
        onPress={() => setOpen(false)}
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

function DropdownMenuGroup({ children, ...props }: { children: React.ReactNode }) {
  return <View {...props}>{children}</View>;
}

interface DropdownMenuItemProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  inset?: boolean;
  variant?: "default" | "destructive";
}

function DropdownMenuItem({
  className,
  style,
  children,
  onPress,
  inset,
  variant = "default",
  ...props
}: DropdownMenuItemProps) {
  const context = React.useContext(DropdownMenuContext);
  const setOpen = context?.setOpen;

  const handlePress = () => {
    if (setOpen) setOpen(false);
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

interface DropdownMenuCheckboxItemProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  checked?: boolean;
  onCheckedChange?: (checked: boolean) => void;
  onPress?: () => void;
}

function DropdownMenuCheckboxItem({
  className,
  style,
  children,
  checked,
  onCheckedChange,
  onPress,
  ...props
}: DropdownMenuCheckboxItemProps) {
  const context = React.useContext(DropdownMenuContext);
  const setOpen = context?.setOpen;

  const handlePress = () => {
    if (setOpen) setOpen(false);
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

function DropdownMenuRadioGroup({
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

function DropdownMenuRadioItem({
  className,
  style,
  children,
  value,
  checked,
  onPress,
  ...props
}: {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  value?: string;
  checked?: boolean;
  onPress?: () => void;
}) {
  const context = React.useContext(DropdownMenuContext);
  const setOpen = context?.setOpen;

  const handlePress = () => {
    if (setOpen) setOpen(false);
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

function DropdownMenuLabel({
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

function DropdownMenuSeparator({
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

function DropdownMenuShortcut({
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

function DropdownMenuSub({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DropdownMenuSubTrigger({
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

function DropdownMenuSubContent({
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
  DropdownMenu,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuCheckboxItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubTrigger,
  DropdownMenuSubContent,
};
