import * as React from "react";
import { ChevronRight, MoreHorizontal } from "lucide-react-native";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

interface BreadcrumbProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function Breadcrumb({ className, style, children, ...props }: BreadcrumbProps) {
  return (
    <View className={className} style={style} {...props}>
      {children}
    </View>
  );
}

interface BreadcrumbListProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function BreadcrumbList({ className, style, children, ...props }: BreadcrumbListProps) {
  return (
    <View
      className={cn(
        "text-muted-foreground flex flex-row flex-wrap items-center gap-1.5 text-sm",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

interface BreadcrumbItemProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function BreadcrumbItem({ className, style, children, ...props }: BreadcrumbItemProps) {
  return (
    <View
      className={cn("flex flex-row items-center gap-1.5", className)}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

interface BreadcrumbLinkProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
  onPress?: () => void;
  asChild?: boolean;
}

function BreadcrumbLink({
  className,
  style,
  children,
  onPress,
  asChild,
  ...props
}: BreadcrumbLinkProps) {
  if (asChild && React.isValidElement(children)) {
    const child = children as React.ReactElement<any>;
    return React.cloneElement(child, {
      className: cn("hover:text-foreground transition-colors", className, child.props.className),
      style: [style, child.props.style],
      onPress: onPress || child.props.onPress,
      ...props
    });
  }

  return (
    <Pressable
      onPress={onPress}
      className={cn("hover:text-foreground transition-colors", className)}
      style={style}
      {...props}
    >
      {typeof children === "string" ? (
        <Text className="text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-50 font-medium">
          {children}
        </Text>
      ) : (
        children
      )}
    </Pressable>
  );
}

interface BreadcrumbPageProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function BreadcrumbPage({ className, style, children, ...props }: BreadcrumbPageProps) {
  return (
    <View className={className} style={style} {...props}>
      {typeof children === "string" ? (
        <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
          {children}
        </Text>
      ) : (
        children
      )}
    </View>
  );
}

interface BreadcrumbSeparatorProps {
  className?: string;
  style?: any;
  children?: React.ReactNode;
}

function BreadcrumbSeparator({
  className,
  style,
  children,
  ...props
}: BreadcrumbSeparatorProps) {
  return (
    <View
      className={cn("flex items-center justify-center", className)}
      style={style}
      {...props}
    >
      {children ?? <ChevronRight className="size-3.5 text-neutral-400" />}
    </View>
  );
}

interface BreadcrumbEllipsisProps {
  className?: string;
  style?: any;
}

function BreadcrumbEllipsis({ className, style, ...props }: BreadcrumbEllipsisProps) {
  return (
    <View
      className={cn("flex size-9 items-center justify-center", className)}
      style={style}
      {...props}
    >
      <MoreHorizontal className="size-4 text-neutral-400" />
    </View>
  );
}

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
};
