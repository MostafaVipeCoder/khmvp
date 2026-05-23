import * as React from "react";
import { View, Text, Pressable } from "../../tw";
import { Modal } from "react-native";
import { X } from "lucide-react-native";
import { cn } from "./utils";

const DialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function Dialog({
  children,
  open: controlledOpen,
  onOpenChange,
  defaultOpen = false,
}: {
  children?: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  defaultOpen?: boolean;
}) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen);

  const open = controlledOpen !== undefined ? controlledOpen : localOpen;

  const setOpen = React.useCallback(
    (newOpen: boolean) => {
      if (controlledOpen === undefined) {
        setLocalOpen(newOpen);
      }
      if (onOpenChange) {
        onOpenChange(newOpen);
      }
    },
    [controlledOpen, onOpenChange]
  );

  return (
    <DialogContext.Provider value={{ open, setOpen }}>
      {children}
    </DialogContext.Provider>
  );
}

function DialogTrigger({
  children,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(DialogContext);

  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onPress: (e: any) => {
        if (child.props && typeof child.props.onPress === "function") {
          child.props.onPress(e);
        }
        setOpen(true);
      },
    });
  }
  return null;
}

function DialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function DialogClose({ children }: { children?: React.ReactNode }) {
  const { setOpen } = React.useContext(DialogContext);
  if (React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      onPress: (e: any) => {
        if (child.props && typeof child.props.onPress === "function") {
          child.props.onPress(e);
        }
        setOpen(false);
      },
    });
  }
  return null;
}

function DialogOverlay(_props: React.ComponentProps<typeof View>) {
  return null;
}

function DialogContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View>) {
  const { open, setOpen } = React.useContext(DialogContext);

  return (
    <Modal
      transparent={true}
      visible={open}
      onRequestClose={() => setOpen(false)}
      animationType="fade"
    >
      <View className="flex-1 justify-center items-center bg-black/50 p-4">
        <View
          className={cn(
            "bg-white dark:bg-neutral-900 w-full max-w-[400px] rounded-2xl border border-neutral-200 dark:border-neutral-800 p-6 shadow-xl relative",
            className
          )}
          style={style}
          {...props}
        >
          {children}
          <Pressable
            onPress={() => setOpen(false)}
            className="absolute top-4 right-4 p-1 rounded-full bg-neutral-100 dark:bg-neutral-800"
          >
            <X className="size-4 text-neutral-500" />
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

function DialogHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />;
}

function DialogFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-row justify-end gap-2 mt-6", className)} {...props} />;
}

function DialogTitle({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("text-lg leading-none font-semibold text-neutral-900 dark:text-neutral-50", className)} {...props}>
      {children}
    </Text>
  );
}

function DialogDescription({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("text-sm text-neutral-500 dark:text-neutral-400 mt-1.5", className)} {...props}>
      {children}
    </Text>
  );
}

export {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogOverlay,
  DialogPortal,
  DialogTitle,
  DialogTrigger,
};
