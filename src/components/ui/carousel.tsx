import * as React from "react";
import { LayoutChangeEvent, ScrollView as RNScrollView } from "react-native";
import { ArrowLeft, ArrowRight } from "lucide-react-native";
import { View, ScrollView } from "../../tw";
import { cn } from "./utils";
import { Button } from "./button";

type CarouselProps = {
  orientation?: "horizontal" | "vertical";
  children: React.ReactNode;
  className?: string;
  style?: any;
};

type CarouselContextProps = {
  orientation: "horizontal" | "vertical";
  scrollPrev: () => void;
  scrollNext: () => void;
  canScrollPrev: boolean;
  canScrollNext: boolean;
  scrollViewRef: React.RefObject<RNScrollView | null>;
  width: number;
  height: number;
  setWidth: (w: number) => void;
  setHeight: (h: number) => void;
  currentIndex: number;
  setCurrentIndex: (index: number) => void;
} & CarouselProps;

const CarouselContext = React.createContext<CarouselContextProps | null>(null);

function useCarousel() {
  const context = React.useContext(CarouselContext);
  if (!context) {
    throw new Error("useCarousel must be used within a <Carousel />");
  }
  return context;
}

function Carousel({
  orientation = "horizontal",
  className,
  style,
  children,
  ...props
}: CarouselProps) {
  const scrollViewRef = React.useRef<RNScrollView | null>(null);
  const [canScrollPrev, _setCanScrollPrev] = React.useState(false);
  const [canScrollNext, _setCanScrollNext] = React.useState(true);
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [width, setWidth] = React.useState(0);
  const [height, setHeight] = React.useState(0);

  const scrollPrev = () => {
    if (!scrollViewRef.current) return;
    const nextIndex = Math.max(currentIndex - 1, 0);
    if (orientation === "horizontal") {
      scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      scrollViewRef.current.scrollTo({ y: nextIndex * height, animated: true });
    }
    setCurrentIndex(nextIndex);
  };

  const scrollNext = () => {
    if (!scrollViewRef.current) return;
    const nextIndex = currentIndex + 1;
    if (orientation === "horizontal") {
      scrollViewRef.current.scrollTo({ x: nextIndex * width, animated: true });
    } else {
      scrollViewRef.current.scrollTo({ y: nextIndex * height, animated: true });
    }
    setCurrentIndex(nextIndex);
  };

  return (
    <CarouselContext.Provider
      value={{
        orientation,
        scrollPrev,
        scrollNext,
        canScrollPrev,
        canScrollNext,
        scrollViewRef,
        width,
        height,
        setWidth,
        setHeight,
        currentIndex,
        setCurrentIndex,
        children,
      }}
    >
      <View className={cn("relative w-full", className)} style={style} {...props}>
        {children}
      </View>
    </CarouselContext.Provider>
  );
}

function CarouselContent({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  style?: any;
}) {
  const { scrollViewRef, orientation, setWidth, setHeight } = useCarousel();

  const handleLayout = (e: LayoutChangeEvent) => {
    setWidth(e.nativeEvent.layout.width);
    setHeight(e.nativeEvent.layout.height);
  };

  return (
    <ScrollView
      ref={scrollViewRef}
      horizontal={orientation === "horizontal"}
      pagingEnabled
      showsHorizontalScrollIndicator={false}
      showsVerticalScrollIndicator={false}
      onLayout={handleLayout}
      className={cn("w-full overflow-hidden", className)}
      style={style}
      {...props}
    >
      <View className={cn("flex", orientation === "horizontal" ? "flex-row" : "flex-col")}>
        {children}
      </View>
    </ScrollView>
  );
}

function CarouselItem({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  style?: any;
}) {
  const { orientation } = useCarousel();

  return (
    <View
      className={cn(
        "w-full shrink-0 grow-0 basis-full",
        orientation === "horizontal" ? "px-2" : "py-2",
        className
      )}
      style={style}
      {...props}
    >
      {children}
    </View>
  );
}

function CarouselPrevious({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: any) {
  const { scrollPrev, canScrollPrev } = useCarousel();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("absolute left-2 top-1/2 -translate-y-1/2 rounded-full z-10", className)}
      disabled={!canScrollPrev}
      onPress={scrollPrev}
      {...props}
    >
      <ArrowLeft className="size-4" />
    </Button>
  );
}

function CarouselNext({
  className,
  variant = "outline",
  size = "icon",
  ...props
}: any) {
  const { scrollNext, canScrollNext } = useCarousel();

  return (
    <Button
      variant={variant}
      size={size}
      className={cn("absolute right-2 top-1/2 -translate-y-1/2 rounded-full z-10", className)}
      disabled={!canScrollNext}
      onPress={scrollNext}
      {...props}
    >
      <ArrowRight className="size-4" />
    </Button>
  );
}

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselPrevious,
  CarouselNext,
};
