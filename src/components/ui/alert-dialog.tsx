import * as React from "react";
import { View, Text, Pressable } from "../../tw";
import { Modal } from "react-native";
import { cn } from "./utils";
import { buttonVariants } from "./button";

const AlertDialogContext = React.createContext<{
  open: boolean;
  setOpen: (open: boolean) => void;
}>({
  open: false,
  setOpen: () => {},
});

function AlertDialog({
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
    <AlertDialogContext.Provider value={{ open, setOpen }}>
      {children}
    </AlertDialogContext.Provider>
  );
}

function AlertDialogTrigger({
  children,
}: {
  children: React.ReactNode;
  asChild?: boolean;
}) {
  const { setOpen } = React.useContext(AlertDialogContext);

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

function AlertDialogPortal({ children }: { children?: React.ReactNode }) {
  return <>{children}</>;
}

function AlertDialogOverlay(_props: React.ComponentProps<typeof View>) {
  return null;
}

function AlertDialogContent({
  className,
  children,
  style,
  ...props
}: React.ComponentProps<typeof View>) {
  const { open, setOpen } = React.useContext(AlertDialogContext);

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
        </View>
      </View>
    </Modal>
  );
}

function AlertDialogHeader({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-col gap-1.5 mb-4", className)} {...props} />;
}

function AlertDialogFooter({ className, ...props }: React.ComponentProps<typeof View>) {
  return <View className={cn("flex flex-row justify-end gap-2 mt-6", className)} {...props} />;
}

function AlertDialogTitle({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("text-lg leading-none font-semibold text-neutral-900 dark:text-neutral-50", className)} {...props}>
      {children}
    </Text>
  );
}

function AlertDialogDescription({ className, children, ...props }: React.ComponentProps<typeof Text>) {
  return (
    <Text className={cn("text-sm text-neutral-500 dark:text-neutral-400 mt-1.5", className)} {...props}>
      {children}
    </Text>
  );
}

function AlertDialogAction({
  className,
  children,
  onPress,
  ...props
}: React.ComponentProps<typeof Pressable>) {
  const { setOpen } = React.useContext(AlertDialogContext);

  const handlePress = (e: any) => {
    if (onPress) onPress(e);
    setOpen(false);
  };

  return (
    <Pressable
      className={cn(buttonVariants({ variant: "default" }), className)}
      onPress={handlePress}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-white font-medium text-sm">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

function AlertDialogCancel({
  className,
  children,
  onPress,
  ...props
}: React.ComponentProps<typeof Pressable>) {
  const { setOpen } = React.useContext(AlertDialogContext);

  const handlePress = (e: any) => {
    if (onPress) onPress(e);
    setOpen(false);
  };

  return (
    <Pressable
      className={cn(buttonVariants({ variant: "outline" }), className)}
      onPress={handlePress}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-neutral-900 dark:text-neutral-100 font-medium text-sm">{children}</Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

export {
  AlertDialog,
  AlertDialogPortal,
  AlertDialogOverlay,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
};
