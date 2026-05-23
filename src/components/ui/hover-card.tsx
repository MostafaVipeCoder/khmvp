import * as React from "react";
import { Modal } from "react-native";
import { Pressable } from "../../tw";
import { cn } from "./utils";

interface HoverCardContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const HoverCardContext = React.createContext<HoverCardContextType | null>(null);

function HoverCard({
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
    <HoverCardContext.Provider value={{ open: localOpen, setOpen: handleOpenChange }}>
      {children}
    </HoverCardContext.Provider>
  );
}

function HoverCardTrigger({
  asChild = true,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error("HoverCardTrigger must be used within HoverCard");

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

function HoverCardContent({
  className,
  children,
  style,
  align: _align = "center",
  sideOffset: _sideOffset = 4,
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
  align?: "center" | "start" | "end";
  sideOffset?: number;
}) {
  const context = React.useContext(HoverCardContext);
  if (!context) throw new Error("HoverCardContent must be used within HoverCard");

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

export { HoverCard, HoverCardTrigger, HoverCardContent };
