import type { PropsWithChildren } from "react";
import { useRef } from "react";
import { Animated, Pressable, type PressableProps, type StyleProp, type ViewStyle } from "react-native";

type PressableScaleProps = PropsWithChildren<
  PressableProps & {
    scaleTo?: number;
    wrapperStyle?: StyleProp<ViewStyle>;
  }
>;

export function PressableScale({ children, onPressIn, onPressOut, scaleTo = 0.97, wrapperStyle, ...props }: PressableScaleProps) {
  const scale = useRef(new Animated.Value(1)).current;

  return (
    <Animated.View style={[{ transform: [{ scale }] }, wrapperStyle]}>
      <Pressable
        {...props}
        onPressIn={(event) => {
          Animated.spring(scale, {
            toValue: scaleTo,
            speed: 28,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
          onPressIn?.(event);
        }}
        onPressOut={(event) => {
          Animated.spring(scale, {
            toValue: 1,
            speed: 28,
            bounciness: 4,
            useNativeDriver: true,
          }).start();
          onPressOut?.(event);
        }}
      >
        {children}
      </Pressable>
    </Animated.View>
  );
}
