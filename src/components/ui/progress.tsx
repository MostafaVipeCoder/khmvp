
import { View } from "../../tw";
import { cn } from "./utils";

interface ProgressProps {
  className?: string;
  value?: number | null;
  style?: any;
}

function Progress({
  className,
  value,
  style,
  ...props
}: ProgressProps) {
  return (
    <View
      className={cn(
        "bg-primary/20 relative h-2 w-full overflow-hidden rounded-full",
        className,
      )}
      style={style}
      {...props}
    >
      <View
        className="bg-primary h-full transition-all"
        style={{ width: `${value || 0}%` }}
      />
    </View>
  );
}

export { Progress };

