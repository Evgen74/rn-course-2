import React, { useCallback } from 'react';
import { View, Text, TextInput } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';
import { Card, screenAnimationDuration } from '../ui';
import { Button } from '../ui/Button';
import { WithNav } from '../nav';
import Animated, {
  FadeInLeft,
  FadeOutLeft,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { useAnimatedVariantColor } from 'react-native-unistyles/reanimated';
import { KeyboardAwareScrollView } from 'react-native-keyboard-controller';

const Scroll = Animated.createAnimatedComponent(KeyboardAwareScrollView)

export const HomeScreen = ({ navigate }: WithNav<{}>) => {
  const handlePress = useCallback(() => {
    navigate('screen');
  }, []);

  // получение анимированного значения цвета
  const color = useAnimatedVariantColor(styles.container, 'backgroundColor');
  const animatedStyle = useAnimatedStyle(() => {
    return {
      backgroundColor: withTiming(color.value, {
        duration: 500,
      }),
    };
  });

  console.log('render')
  
  return (
    <Animated.View
      style={styles.view}
      exiting={FadeOutLeft.duration(screenAnimationDuration)}
      entering={FadeInLeft.duration(screenAnimationDuration)}
    >
      <Scroll
        style={[styles.container, animatedStyle]}
        contentContainerStyle={styles.contentContainer}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode="interactive"
        bottomOffset={60}
        extraKeyboardSpace={60}
      >
        <Text style={styles.title}>Тема 1</Text>
        <Text style={styles.subtitle}>Знакомство с Unistyles</Text>
        <Text style={styles.description}>
          В этом уроке мы изучим основы работы с Unistyles - современной
          библиотекой для стилизации React Native приложений
        </Text>

        <Button
          text="Click me"
          onPress={handlePress}
          style="primary"
          size="L"
          mode="contained"
        />
        <View style={styles.cards}>
          <Card
            text="Example card #1"
            image={{ uri: 'https://picsum.photos/300/200' }}
          />
          <Card
            text="Example card #2"
            image={{ uri: 'https://picsum.photos/300/200' }}
          />
        </View>
        <TextInput
          placeholder="Enter your text"
          style={styles.input}
        />
        <TextInput
          placeholder="Enter your text"
          style={styles.input}
        />
      </Scroll>
    </Animated.View>
  );
};

const styles = StyleSheet.create((theme, rt) => {
  console.log('recalculate styles')
  
  return {
    view: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: {
        sm: theme.colors.white,
        md: theme.colors.grapefruit50,
      },
      paddingTop: rt.insets.top,
      paddingBottom: rt.insets.bottom,
      paddingLeft: rt.insets.left,
      paddingRight: rt.insets.right,
    },
    contentContainer: {
      alignItems: 'center',
    },
    title: {
      ...theme.typo.headlineLarge,
      color: theme.colors.secondary10,
      fontWeight: '600',
    },
    subtitle: {
      ...theme.typo.titleLarge,
      color: theme.colors.secondary30,
      marginTop: theme.spacings.x4,
      textAlign: 'center',
    },
    description: {
      ...theme.typo.bodyMedium,
      marginTop: theme.spacings.x6,
      marginBottom: theme.spacings.x6,
      color: theme.colors.secondary60,
      textAlign: 'center',
      paddingHorizontal: theme.spacings.x8,
      maxWidth: rt.isPortrait ? 400 : 600,
    },
    cards: {
      marginTop: theme.spacings.x6,
      gap: theme.spacings.x8,
      flexDirection: rt.isPortrait ? 'column' : 'row',
    },
    input: {
      height: 40,
      width: rt.screen.width - theme.spacings.x8,
      borderColor: theme.colors.secondary10,
      borderWidth: 1,
      borderRadius: theme.roundings.r10,
      paddingHorizontal: theme.spacings.x8,
      marginVertical: theme.spacings.x4,
    },
  };
});
