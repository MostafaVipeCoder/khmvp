import { useCssElement } from "react-native-css";
import { StyleSheet } from "react-native";
import Animated from "react-native-reanimated";
import { Image as RNImage } from "expo-image";

const AnimatedExpoImage = Animated.createAnimatedComponent(RNImage);

export type ImageProps = any;

function CSSImage({ src, alt, source, ...props }: any) {
  const { objectFit, objectPosition, ...style } =
    StyleSheet.flatten(props.style) || {};

  const finalSource = source || (src ? { uri: src } : undefined);

  return (
    <AnimatedExpoImage
      contentFit={objectFit as any}
      contentPosition={objectPosition}
      accessibilityLabel={alt}
      {...props}
      source={
        typeof finalSource === "string" ? { uri: finalSource } : finalSource
      }
      style={style}
    />
  );
}

export const Image = (
  props: ImageProps
) => {
  return useCssElement(CSSImage, props, { className: "style" });
};

Image.displayName = "CSS(Image)";
