
import { View } from "../../tw";
import { cn } from "./utils";

interface SliderProps {
  className?: string;
  value?: number[];
  defaultValue?: number[];
  min?: number;
  max?: number;
  onValueChange?: (value: number[]) => void;
  style?: any;
}

function Slider({
  className,
  value,
  defaultValue,
  min = 0,
  max = 100,
  onValueChange,
  style,
  ...props
}: SliderProps) {
  const _values = value || defaultValue || [min];
  
  // Calculate percentage for the first thumb (mocking single thumb slider)
  const percentage = Math.max(0, Math.min(100, ((_values[0] - min) / (max - min)) * 100));

  return (
    <View
      className={cn(
        "relative flex w-full flex-row items-center",
        className,
      )}
      style={style}
      {...props}
    >
      <View className="bg-neutral-200 dark:bg-neutral-800 relative grow overflow-hidden rounded-full h-2 w-full">
        <View
          className="bg-primary absolute h-full"
          style={{ width: `${percentage}%` }}
        />
      </View>
      <View
        className="border-primary bg-white dark:bg-neutral-900 absolute block size-4 rounded-full border-2 shadow-sm"
        style={{ left: `${percentage}%`, marginLeft: -8 }}
      />
    </View>
  );
}

export { Slider };

