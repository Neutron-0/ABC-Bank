import { Platform, UIManager, LayoutAnimation, Animated, Easing } from 'react-native';

// Enable LayoutAnimation on Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export const motion = {
  // Timing Durations (ms)
  duration: {
    fast: 150,
    standard: 250,
    gentle: 350,
    reorder: 400,
    emphasis: 500,
  },

  // Easing Curves
  easing: {
    standard: Easing.bezier(0.2, 0.0, 0, 1.0),
    decelerate: Easing.out(Easing.cubic),
    accelerate: Easing.in(Easing.cubic),
    spring: Easing.elastic(1.0),
  },

  // Layout Animation Presets for Adaptive Reorder
  reorderLayout: () => {
    LayoutAnimation.configureNext({
      duration: 380,
      create: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
      update: {
        type: LayoutAnimation.Types.spring,
        springDamping: 0.82,
      },
      delete: {
        type: LayoutAnimation.Types.easeInEaseOut,
        property: LayoutAnimation.Properties.opacity,
      },
    });
  },

  gentleLayout: () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
  },

  // Spring animation helper
  spring: (value: Animated.Value, toValue: number, callback?: () => void) => {
    return Animated.spring(value, {
      toValue,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start(callback);
  },

  // Timing helper
  timing: (value: Animated.Value, toValue: number, duration = 250, callback?: () => void) => {
    return Animated.timing(value, {
      toValue,
      duration,
      easing: Easing.bezier(0.2, 0.0, 0, 1.0),
      useNativeDriver: true,
    }).start(callback);
  },
};
