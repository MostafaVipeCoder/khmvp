"use client";

import * as React from "react";
import { Modal } from "react-native";
import { View, Text, Pressable } from "../../tw";
import { XIcon } from "lucide-react";

import { cn } from "./utils";

const SheetContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function Sheet({
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
    <SheetContext.Provider value={{ open, setOpen }}>
      {children}
    </SheetContext.Provider>
  );
}

function SheetTrigger({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(SheetContext);
  return (
    <Pressable onPress={() => setOpen(true)} {...props}>
      {children}
    </Pressable>
  );
}

function SheetClose({ children, asChild, ...props }: any) {
  const { setOpen } = React.useContext(SheetContext);
  return (
    <Pressable onPress={() => setOpen(false)} {...props}>
      {children}
    </Pressable>
  );
}

function SheetContent({
  className,
  children,
  side = "right",
  style,
  ...props
}: any) {
  const { open, setOpen } = React.useContext(SheetContext);

  return (
    <Modal
      visible={open}
      transparent
      animationType={side === "bottom" ? "slide" : "fade"}
      onRequestClose={() => setOpen(false)}
    >
      <View className="flex-1 flex-row">
        {/* Overlay */}
        <Pressable
          className="absolute inset-0 bg-black/50"
          onPress={() => setOpen(false)}
        />
        
        {/* Content */}
        <View
          data-slot="sheet-content"
          className={cn(
            "bg-background absolute flex flex-col gap-4 shadow-lg",
            side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l border-border",
            side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r border-border",
            side === "top" && "inset-x-0 top-0 h-auto border-b border-border",
            side === "bottom" && "inset-x-0 bottom-0 h-auto border-t border-border",
            className
          )}
          style={style}
          {...props}
        >
          {children}
          <Pressable
            className="absolute top-4 right-4 p-2 rounded-full bg-secondary/50"
            onPress={() => setOpen(false)}
          >
            <XIcon className="size-4 text-foreground" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function SheetHeader({ className, style, ...props }: any) {
  return (
    <View
      data-slot="sheet-header"
      className={cn("flex flex-col gap-1.5 p-4", className)}
      style={style}
      {...props}
    />
  );
}

function SheetFooter({ className, style, ...props }: any) {
  return (
    <View
      data-slot="sheet-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      style={style}
      {...props}
    />
  );
}

function SheetTitle({ className, style, ...props }: any) {
  return (
    <Text
      data-slot="sheet-title"
      className={cn("text-foreground font-semibold text-lg", className)}
      style={style}
      {...props}
    />
  );
}

function SheetDescription({ className, style, ...props }: any) {
  return (
    <Text
      data-slot="sheet-description"
      className={cn("text-muted-foreground text-sm", className)}
      style={style}
      {...props}
    />
  );
}

export {
  Sheet,
  SheetTrigger,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
};

