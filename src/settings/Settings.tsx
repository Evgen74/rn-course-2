import { useCallback, useMemo, useState, useEffect } from 'react';
import { WithNav } from '../nav'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { Header, LineItem, screenAnimationDuration } from '../ui';
import { View } from 'react-native';
import { themeManager } from '../../modules/theme-manager/src/';
import { Button } from '../ui/Button';

type PaletteType = 'Default' | 'Green' | 'SkyBlue'
type ThemeMode = 'light' | 'dark' | 'auto'

const palletes = ['Default', 'Green', 'SkyBlue'] as const

export const Settings = ({ navigate }: WithNav<{}>) => {
  const handleBackPress = useCallback(() => {
    navigate('home');
  }, [navigate])

  const [selectedThemeMode, setSelectedThemeMode] = useState<ThemeMode>(themeManager.fullTheme)
  const [selectedPalette, setSelectedPalette] = useState<PaletteType>(themeManager.palette)

  const handleThemeModePress = useCallback((themeMode: ThemeMode) => {
    themeManager.setTheme(themeMode)
    setSelectedThemeMode(themeMode)
  }, [])

  const handlePalettePress = useCallback((palette: PaletteType) => {
    themeManager.setPalette(palette)
    setSelectedPalette(palette)
  }, [])

  const [defaultColors, greenColors, blueColors] = useMemo(() => {

    return palletes.map(palette => [
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.additional60,
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.primary50,
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.primary90
    ])
  }, [])

  return (
    <Animated.ScrollView
      style={styles.container}
      contentContainerStyle={styles.contentContainer}
      exiting={FadeOutRight.duration(screenAnimationDuration)}
      entering={FadeInRight.duration(screenAnimationDuration)}
    >
      <Header
        title='Настройки'
        onBack={handleBackPress}
      />
      <View style={styles.sectionTheme}>
        <LineItem
          text='Светлая'
          type='light'
          onPress={handleThemeModePress}
          isSelected={selectedThemeMode === 'light'}
        />
        <LineItem
          text='Темная'
          type='dark'
          onPress={handleThemeModePress}
          isSelected={selectedThemeMode === 'dark'}
        />
        <LineItem
          text='Авто'
          type='auto'
          onPress={handleThemeModePress}
          isSelected={selectedThemeMode === 'auto'}
        />
      </View>
      <View style={styles.section}>
        <LineItem
          text='Стандарт'
          type='Default'
          colors={defaultColors}
          onPress={handlePalettePress}
          isSelected={selectedPalette === 'Default'}
        />
        <LineItem
          text='Йода'
          type='Green'
          colors={greenColors}
          onPress={handlePalettePress}
          isSelected={selectedPalette === 'Green'}
        />
        <LineItem
          text='Океан'
          type='SkyBlue'
          colors={blueColors}
          onPress={handlePalettePress}
          isSelected={selectedPalette === 'SkyBlue'}
        />
      </View>
      <View style={styles.buttonContainer}>
        <Button text='Test' onPress={() => { }} style='primary'/>
        <Button text='Test2' onPress={() => { }} style='secondary'/>
        <Button text='Test3' onPress={() => { }} style='error'/>
        <Button text='Test4' onPress={() => { }} style='success'/>
      </View>
      <View style={styles.buttonContainer}>
        <Button text='Test' onPress={() => { }} style='primary' isDisabled/>
        <Button text='Test2' onPress={() => { }} style='secondary' isDisabled/>
        <Button text='Test3' onPress={() => { }} style='error' isDisabled/>
        <Button text='Test4' onPress={() => { }} style='success' isDisabled/>
      </View>
    </Animated.ScrollView>
  );
}

const styles = StyleSheet.create((theme, rt) => {
  return ({
  container: {
    flex: 1,
    backgroundColor: theme.colors.white,
    paddingTop: rt.insets.top,
    paddingBottom: rt.insets.bottom,
    paddingLeft: rt.insets.left,
    paddingRight: rt.insets.right,
  },
  contentContainer: {
    paddingHorizontal: theme.spacings.x6
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
})})