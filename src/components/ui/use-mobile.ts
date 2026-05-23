// React Native compatible — every screen is "mobile" on a phone
// Dimensions is used instead of window.matchMedia which doesn't exist in RN
import { useState, useEffect } from "react";
import { Dimensions } from "react-native";

const MOBILE_BREAKPOINT = 768;

export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean>(() => {
    const { width } = Dimensions.get("window");
    return width < MOBILE_BREAKPOINT;
  });

  useEffect(() => {
    const subscription = Dimensions.addEventListener("change", ({ window }) => {
      setIsMobile(window.width < MOBILE_BREAKPOINT);
    });
    return () => subscription?.remove();
  }, []);

  return isMobile;
}
