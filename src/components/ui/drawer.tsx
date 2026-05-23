import * as React from "react";
import { Modal } from "react-native";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

const DrawerContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function Drawer({
  open: openProp,
  onOpenChange,
  children,
}: {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}) {
  const [openState, setOpenState] = React.useState(false);
  const open = openProp !== undefined ? openProp : openState;
  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      setOpenState(newOpen);
      onOpenChange?.(newOpen);
    },
    [onOpenChange]
  );

  return (
    <DrawerContext.Provider value={{ open, setOpen }}>
      {children}
    </DrawerContext.Provider>
  );
}

function DrawerTrigger({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(DrawerContext);
  return (
    <Pressable onPress={() => setOpen(true)} {...props}>
      {children}
    </Pressable>
  );
}

function DrawerPortal({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function DrawerClose({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(DrawerContext);
  return (
    <Pressable onPress={() => setOpen(false)} {...props}>
      {children}
    </Pressable>
  );
}

function DrawerOverlay({ className, ...props }: any) {
  const { setOpen } = React.useContext(DrawerContext);
  return (
    <Pressable
      className={cn("absolute inset-0 bg-black/50", className)}
      onPress={() => setOpen(false)}
      {...props}
    />
  );
}

function DrawerContent({
  className,
  children,
  style,
  ...props
}: any) {
  const { open, setOpen } = React.useContext(DrawerContext);

  return (
    <Modal
      visible={open}
      transparent
      animationType="slide"
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 justify-end">
        <DrawerOverlay />
        
        <View
          data-slot="drawer-content"
          className={cn(
            "bg-white dark:bg-neutral-900 border-t border-neutral-200 dark:border-neutral-800 rounded-t-xl p-4 shadow-lg w-full max-h-[80vh]",
            className
          )}
          style={style}
          {...props}
        >
          <View className="bg-neutral-200 dark:bg-neutral-800 mx-auto mb-4 h-1.5 w-12 rounded-full" />
          {children}
        </View>
      </View>
    </Modal>
  );
}

function DrawerHeader({ className, style, ...props }: any) {
  return (
    <View
      data-slot="drawer-header"
      className={cn("flex flex-col gap-1.5 p-2", className)}
      style={style}
      {...props}
    />
  );
}

function DrawerFooter({ className, style, ...props }: any) {
  return (
    <View
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-2", className)}
      style={style}
      {...props}
    />
  );
}

function DrawerTitle({ className, style, ...props }: any) {
  return (
    <Text
      data-slot="drawer-title"
      className={cn("text-neutral-900 dark:text-neutral-50 font-semibold text-lg", className)}
      style={style}
      {...props}
    />
  );
}

function DrawerDescription({ className, style, ...props }: any) {
  return (
    <Text
      data-slot="drawer-description"
      className={cn("text-neutral-500 dark:text-neutral-400 text-sm", className)}
      style={style}
      {...props}
    />
  );
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
};
