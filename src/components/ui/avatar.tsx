import * as React from "react";
import { View, Text, Image } from "../../tw";
import { cn } from "./utils";

const AvatarContext = React.createContext<{
  hasLoaded: boolean;
  setHasLoaded: (loaded: boolean) => void;
}>({
  hasLoaded: false,
  setHasLoaded: () => {},
});

function Avatar({ className, style, children, ...props }: React.ComponentProps<typeof View>) {
  const [hasLoaded, setHasLoaded] = React.useState(false);

  return (
    <AvatarContext.Provider value={{ hasLoaded, setHasLoaded }}>
      <View
        className={cn(
          "relative flex size-10 shrink-0 overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800",
          className,
        )}
        style={style}
        {...props}
      >
        {children}
      </View>
    </AvatarContext.Provider>
  );
}

interface AvatarImageProps extends Omit<React.ComponentProps<typeof Image>, "source"> {
  src?: string;
}

function AvatarImage({ className, src, style, ...props }: AvatarImageProps) {
  const { setHasLoaded } = React.useContext(AvatarContext);

  if (!src) return null;

  return (
    <Image
      className={cn("aspect-square size-full absolute inset-0 rounded-full", className)}
      source={{ uri: src }}
      style={style}
      onLoad={() => setHasLoaded(true)}
      {...props}
    />
  );
}

function AvatarFallback({ className, style, children, ...props }: React.ComponentProps<typeof View>) {
  const { hasLoaded } = React.useContext(AvatarContext);

  if (hasLoaded) return null;

  return (
    <View
      className={cn(
        "bg-neutral-200 dark:bg-neutral-700 flex size-full items-center justify-center rounded-full absolute inset-0",
        className,
      )}
      style={style}
      {...props}
    >
      {typeof children === "string" || typeof children === "number" ? (
        <Text className="text-sm font-semibold text-neutral-600 dark:text-neutral-300">{children}</Text>
      ) : (
        children
      )}
    </View>
  );
}

export { Avatar, AvatarImage, AvatarFallback };
