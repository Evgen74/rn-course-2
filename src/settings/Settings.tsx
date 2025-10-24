import { useCallback } from 'react';
import { WithNav } from '../nav';
import { StyleSheet } from 'react-native-unistyles';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { Header, screenAnimationDuration } from '../ui';
import { View } from 'react-native';
import { Button } from '../ui/Button';

export const Settings = ({ navigate }: WithNav<{}>) => {
  const handleBackPress = useCallback(() => {
    navigate('home');
  }, [navigate]);

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      exiting={FadeOutRight.duration(screenAnimationDuration)}
      entering={FadeInRight.duration(screenAnimationDuration)}
    >
      <Header title="Настройки" onBack={handleBackPress} />
      <View style={styles.buttonContainer}>
        <Button text="Test" onPress={() => {}} style="primary" />
        <Button text="Test2" onPress={() => {}} style="secondary" />
        <Button text="Test3" onPress={() => {}} style="error" />
        <Button text="Test4" onPress={() => {}} style="success" />
      </View>
      <View style={styles.buttonContainer}>
        <Button text="Test" onPress={() => {}} style="primary" isDisabled />
        <Button text="Test2" onPress={() => {}} style="secondary" isDisabled />
        <Button text="Test3" onPress={() => {}} style="error" isDisabled />
        <Button text="Test4" onPress={() => {}} style="success" isDisabled />
      </View>
    </Animated.ScrollView>
  );
};

const styles = StyleSheet.create((theme, rt) => {
  return {
    container: {
      flex: 1,
      backgroundColor: theme.colors.white,
      paddingTop: rt.insets.top,
      paddingBottom: rt.insets.bottom,
      paddingLeft: rt.insets.left,
      paddingRight: rt.insets.right,
    },
    contentContainer: {
      paddingHorizontal: theme.spacings.x6,
    },
    sectionTheme: {
      marginTop: theme.spacings.x8,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    section: {
      marginTop: theme.spacings.x8,
    },
    title: {
      ...theme.typo.headlineLarge,
      color: theme.colors.secondary10,
    },
    buttonContainer: {
      marginTop: theme.spacings.x8,
      gap: theme.spacings.x4,
      flexDirection: 'row',
      alignItems: 'center',
    },
  };
});
