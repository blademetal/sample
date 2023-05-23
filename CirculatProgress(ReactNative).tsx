import React, { ReactNode, useMemo, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import Animated from 'react-native-reanimated';
import Text from './Text';
import useDimensions from '../hooks/useDimensions';

const { multiply, interpolateNode } = Animated;
const AnimatedCircle = Animated.createAnimatedComponent(Circle);
const strokeWidth = 4;
const { PI } = Math;

interface CircularPogressProps {
  progress: number;
  children: ReactNode;
  hideProgress?: boolean;
  newType?: boolean;
}

function CircularPogress({
  progress,
  children,
  newType,
}: CircularPogressProps) {
  const { width } = useDimensions();
  const size = useMemo(() => width / 4, [width]);
  const sizeOuter = useMemo(() => Math.round(size + 16.25), [size]);

  const r = useRef((sizeOuter - strokeWidth) / 2).current;
  const cx = useRef(sizeOuter / 2).current;
  const cy = useRef(sizeOuter / 2).current;

  const progressPerc = useMemo(() => {
    return (progress * 100).toFixed(0);
  }, [progress]);

  const progressValue = useMemo(() => {
    const prog = 1 - progress;
    return new Animated.Value(prog);
  }, [progress]);

  const color = useMemo(
    () => (!progress || progress === 1 ? '#009AA8' : '#31009F'),
    [progress]
  );

  const circumference = r * 2 * PI;
  const alpha = interpolateNode(progressValue, {
    inputRange: [0, 1],
    outputRange: [0, PI * 2],
  });
  const strokeDashoffset = multiply(alpha, r);
  return (
    <View style={styles.container}>
      <View style={styles.textContainer}>
        {(progress || newType) && (
          <View
            style={[
              styles.textInnerContainer,
              {
                backgroundColor: color,
              },
            ]}
          >
            <Text style={styles.text} bold>
              {newType ? 'NEW' : `${progressPerc}%`}
            </Text>
          </View>
        )}
      </View>
      <View style={{ position: 'absolute', top: 8 }}>{children}</View>
      <Svg width={sizeOuter} height={sizeOuter} style={styles.circle}>
        <AnimatedCircle
          stroke={color}
          fill="none"
          strokeDasharray={`${circumference}, ${circumference}`}
          {...{
            strokeDashoffset,
            strokeWidth,
            cx,
            cy,
            r,
          }}
        />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  textContainer: {
    position: 'absolute',
    top: -10,
    zIndex: 3,
  },
  textInnerContainer: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  text: {
    color: '#FFFFFF',
    fontSize: 12,
    letterSpacing: 0,
  },
  circle: {
    transform: [{ rotateZ: '270deg' }],
    zIndex: -1,
  },
});

export default CircularPogress;
