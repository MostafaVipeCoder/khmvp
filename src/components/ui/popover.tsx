import * as React from "react";
import { Modal } from "react-native";
import { Pressable } from "../../tw";
import { cn } from "./utils";

interface PopoverContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const PopoverContext = React.createContext<PopoverContextType | null>(null);

interface PopoverProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

function Popover({
  open: controlledOpen,
  onOpenChange,
  children,
}: PopoverProps) {
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
    <PopoverContext.Provider value={{ open: localOpen, setOpen: handleOpenChange }}>
      {children}
    </PopoverContext.Provider>
  );
}

interface PopoverTriggerProps {
  asChild?: boolean;
  children: React.ReactNode;
}

function PopoverTrigger({
  asChild = true,
  children,
  ...props
}: PopoverTriggerProps) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverTrigger must be used within Popover");

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

interface PopoverContentProps {
  className?: string;
  style?: any;
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  sideOffset?: number;
}

function PopoverContent({
  className,
  children,
  style,
  align: _align = "center",
  sideOffset: _sideOffset = 4,
}: PopoverContentProps) {
  const context = React.useContext(PopoverContext);
  if (!context) throw new Error("PopoverContent must be used within Popover");

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
            "bg-white dark:bg-neutral-900 w-[85%] max-w-[340px] rounded-lg border border-neutral-200 dark:border-neutral-800 p-4 shadow-lg",
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

function PopoverAnchor({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export { Popover, PopoverTrigger, PopoverContent, PopoverAnchor };
