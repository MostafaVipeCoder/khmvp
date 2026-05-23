import React from "react";
import { SvgProps } from "react-native-svg";

declare module "lucide-react-native" {
  export interface LucideProps extends SvgProps {
    className?: string;
  }
}

declare module "lucide-react" {
  export interface LucideProps extends SvgProps {
    className?: string;
  }
  export * from "lucide-react-native";
}
