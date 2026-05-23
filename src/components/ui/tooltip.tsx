import * as React from "react";
import { Modal } from "react-native";
import { Text, Pressable } from "../../tw";
import { cn } from "./utils";

interface TooltipContextType {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextType | null>(null);

function TooltipProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

function Tooltip({
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
    <TooltipContext.Provider value={{ open: localOpen, setOpen: handleOpenChange }}>
      {children}
    </TooltipContext.Provider>
  );
}

function TooltipTrigger({
  asChild = true,
  children,
  ...props
}: {
  asChild?: boolean;
  children: React.ReactNode;
}) {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipTrigger must be used within Tooltip");

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

function TooltipContent({
  className,
  children,
  style,
  sideOffset: _sideOffset = 0,
}: {
  className?: string;
  style?: any;
  children: React.ReactNode;
  sideOffset?: number;
}) {
  const context = React.useContext(TooltipContext);
  if (!context) throw new Error("TooltipContent must be used within Tooltip");

  const { open, setOpen } = context;

  return (
    <Modal
      visible={open}
      transparent
      animationType="fade"
      onRequestClose={() => setOpen(false)}
    >
      <Pressable
        className="flex-1 justify-center items-center bg-transparent"
        onPress={() => setOpen(false)}
      >
        <Pressable
          className={cn(
            "bg-neutral-900 dark:bg-neutral-100 rounded-md px-3 py-1.5 shadow-md",
            className
          )}
          style={style}
          onPress={(e) => e.stopPropagation()}
        >
          {typeof children === "string" ? (
            <Text className="text-xs text-neutral-50 dark:text-neutral-900 font-medium">
              {children}
            </Text>
          ) : (
            children
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
