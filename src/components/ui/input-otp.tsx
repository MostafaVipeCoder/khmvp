import * as React from "react";
import { TextInput as RNTextInput, StyleSheet } from "react-native";
import { MinusIcon } from "lucide-react-native";
import { View, Text, Pressable } from "../../tw";
import { cn } from "./utils";

interface InputOTPContextType {
  value: string;
  onChangeText?: (val: string) => void;
  maxLength: number;
}

const InputOTPContext = React.createContext<InputOTPContextType | null>(null);

interface InputOTPProps {
  className?: string;
  containerClassName?: string;
  value?: string;
  onChangeText?: (val: string) => void;
  maxLength?: number;
  children: React.ReactNode;
}

function InputOTP({
  containerClassName,
  value = "",
  onChangeText,
  maxLength = 6,
  children,
}: InputOTPProps) {
  const inputRef = React.useRef<RNTextInput | null>(null);

  const handlePress = () => {
    inputRef.current?.focus();
  };

  return (
    <InputOTPContext.Provider value={{ value, onChangeText, maxLength }}>
      <Pressable
        onPress={handlePress}
        className={cn("flex flex-row items-center gap-2", containerClassName)}
      >
        {children}
        <RNTextInput
          ref={inputRef}
          value={value}
          onChangeText={onChangeText}
          maxLength={maxLength}
          keyboardType="number-pad"
          textContentType="oneTimeCode"
          style={[StyleSheet.absoluteFillObject, { opacity: 0 }]}
          caretHidden
          pointerEvents="none"
        />
      </Pressable>
    </InputOTPContext.Provider>
  );
}

function InputOTPGroup({
  className,
  children,
  style,
  ...props
}: {
  className?: string;
  children: React.ReactNode;
  style?: any;
}) {
  return (
    <View className={cn("flex flex-row items-center gap-1", className)} style={style} {...props}>
      {children}
    </View>
  );
}

function InputOTPSlot({
  index,
  className,
  style,
  ...props
}: {
  index: number;
  className?: string;
  style?: any;
}) {
  const context = React.useContext(InputOTPContext);
  if (!context) throw new Error("InputOTPSlot must be used within InputOTP");

  const { value } = context;
  const char = value[index] || "";
  const isActive = value.length === index;

  return (
    <View
      className={cn(
        "border border-neutral-200 dark:border-neutral-800 flex h-10 w-10 items-center justify-center text-sm transition-all rounded-md bg-white dark:bg-neutral-900",
        isActive && "border-neutral-950 dark:border-neutral-50 border-2",
        className
      )}
      style={style}
      {...props}
    >
      <Text className="text-sm font-semibold text-neutral-900 dark:text-neutral-50">
        {char}
      </Text>
      {isActive && (
        <View className="absolute bg-neutral-900 dark:bg-neutral-50 h-4 w-px animate-pulse" />
      )}
    </View>
  );
}

function InputOTPSeparator({
  className,
  style,
  ...props
}: {
  className?: string;
  style?: any;
}) {
  return (
    <View className={cn("px-1", className)} style={style} {...props}>
      <MinusIcon className="size-4 text-neutral-400" />
    </View>
  );
}

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator };
