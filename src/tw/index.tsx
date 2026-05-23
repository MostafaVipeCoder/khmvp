import {
  useCssElement,
  useNativeVariable as useFunctionalVariable,
} from "react-native-css";

import { Link as RouterLink } from "expo-router";
import Animated from "react-native-reanimated";
import React from "react";
import {
  View as RNView,
  Text as RNText,
  Pressable as RNPressable,
  ScrollView as RNScrollView,
  TouchableHighlight as RNTouchableHighlight,
  TextInput as RNTextInput,
  StyleSheet,
} from "react-native";

// CSS-enabled Link
export const Link = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RouterLink as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;

Link.Trigger = RouterLink.Trigger;
Link.Menu = RouterLink.Menu;
Link.MenuAction = RouterLink.MenuAction;
Link.Preview = RouterLink.Preview;

// CSS Variable hook
export const useCSSVariable =
  process.env.EXPO_OS !== "web"
    ? useFunctionalVariable
    : (variable: string) => `var(${variable})`;

// View
export type ViewProps = any;
export const View = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RNView as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;
View.displayName = "CSS(View)";

// Text
export const Text = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RNText as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;
Text.displayName = "CSS(Text)";

// ScrollView
export const ScrollView = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RNScrollView as any, { ...props, ref } as any, {
    className: "style",
    contentContainerClassName: "contentContainerStyle",
  } as any) as any;
}) as any;
ScrollView.displayName = "CSS(ScrollView)";

// Pressable
export const Pressable = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RNPressable as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;
Pressable.displayName = "CSS(Pressable)";

// TextInput
export const TextInput = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(RNTextInput as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;
TextInput.displayName = "CSS(TextInput)";

// AnimatedScrollView
export const AnimatedScrollView = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(Animated.ScrollView as any, { ...props, ref } as any, {
    className: "style",
    contentClassName: "contentContainerStyle",
    contentContainerClassName: "contentContainerStyle",
  } as any) as any;
}) as any;
AnimatedScrollView.displayName = "CSS(AnimatedScrollView)";

// TouchableHighlight with underlayColor extraction
function XXTouchableHighlight(
  props: any,
  ref: any
) {
  const flattenedStyle = StyleSheet.flatten(props.style) as any || {};
  const { underlayColor, ...style } = flattenedStyle;
  return (
    <RNTouchableHighlight
      ref={ref}
      underlayColor={underlayColor}
      {...props}
      style={style}
    />
  );
}

export const TouchableHighlight = React.forwardRef<any, any>((props, ref) => {
  return (useCssElement as any)(React.forwardRef(XXTouchableHighlight) as any, { ...props, ref } as any, { className: "style" } as any) as any;
}) as any;
TouchableHighlight.displayName = "CSS(TouchableHighlight)";

export { Image } from './image';
