import * as React from "react";
import { View, Pressable } from "../../tw";

interface CollapsibleContextType {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const CollapsibleContext = React.createContext<CollapsibleContextType | null>(null);

interface CollapsibleProps {
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function Collapsible({
  open,
  defaultOpen = false,
  onOpenChange,
  className,
  style,
  children,
  ...props
}: CollapsibleProps) {
  const [localOpen, setLocalOpen] = React.useState(defaultOpen || !!open);

  React.useEffect(() => {
    if (open !== undefined) {
      setLocalOpen(open);
    }
  }, [open]);

  const handleOpenChange = (nextOpen: boolean) => {
    if (open === undefined) {
      setLocalOpen(nextOpen);
    }
    if (onOpenChange) {
      onOpenChange(nextOpen);
    }
  };

  return (
    <CollapsibleContext.Provider value={{ open: localOpen, onOpenChange: handleOpenChange }}>
      <View className={className} style={style} {...props}>
        {children}
      </View>
    </CollapsibleContext.Provider>
  );
}

interface CollapsibleTriggerProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function CollapsibleTrigger({
  className,
  style,
  children,
  ...props
}: CollapsibleTriggerProps) {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("CollapsibleTrigger must be used within Collapsible");
  }

  const { open, onOpenChange } = context;

  return (
    <Pressable
      onPress={() => onOpenChange(!open)}
      className={className}
      style={style}
      {...props}
    >
      {children}
    </Pressable>
  );
}

interface CollapsibleContentProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function CollapsibleContent({
  className,
  style,
  children,
  ...props
}: CollapsibleContentProps) {
  const context = React.useContext(CollapsibleContext);
  if (!context) {
    throw new Error("CollapsibleContent must be used within Collapsible");
  }

  const { open } = context;

  if (!open) return null;

  return (
    <View className={className} style={style} {...props}>
      {children}
    </View>
  );
}

export { Collapsible, CollapsibleTrigger, CollapsibleContent };
