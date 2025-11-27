import { useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react-lite';
import { WithNav } from '../nav'
import { StyleSheet, UnistylesRuntime } from 'react-native-unistyles';
import Animated, { FadeInRight, FadeOutRight } from 'react-native-reanimated';
import { Header, LineItem, screenAnimationDuration } from '../ui';
import { View } from 'react-native';
import { themeManager } from '../../modules/theme-manager/src/';
import { Button } from '../ui/Button';
import { createPost, fetchPosts } from './api';
import { themeStore, type PaletteType, type ThemeMode } from './themeStore';
import mobxDebugger from 'mobx-debuger'

const palletes = ['Default', 'Green', 'SkyBlue'] as const

export const Settings = observer(({ navigate }: WithNav<{}>) => {
  const handleBackPress = useCallback(() => {
    navigate('home');
  }, [navigate])

  const handleThemeModePress = useCallback((themeMode: ThemeMode) => {
    themeStore.setThemeMode(themeMode)
  }, [])

  const handlePalettePress = useCallback((palette: PaletteType) => {
    themeStore.setPalette(palette)
  }, [])

  const [defaultColors, greenColors, blueColors] = useMemo(() => {

    return palletes.map(palette => [
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.additional60,
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.primary50,
      UnistylesRuntime.getTheme(`${themeManager.theme}${palette}`).colors.primary90
    ])
  }, [])

  useEffect(() => {
    fetchPosts()

    const unregister = mobxDebugger.connectStore('themeStore', themeStore)

    return () => {
      unregister()
    }
  }, [])

  const handlePostRequest = useCallback(() => {
    createPost({ title: 'foo', body: 'bar', userId: 1 })
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
          isSelected={themeStore.themeMode === 'light'}
        />
        <LineItem
          text='Темная'
          type='dark'
          onPress={handleThemeModePress}
          isSelected={themeStore.themeMode === 'dark'}
        />
        <LineItem
          text='Авто'
          type='auto'
          onPress={handleThemeModePress}
          isSelected={themeStore.themeMode === 'auto'}
        />
      </View>
      <View style={styles.section}>
        <LineItem
          text='Стандарт'
          type='Default'
          colors={defaultColors}
          onPress={handlePalettePress}
          isSelected={themeStore.palette === 'Default'}
        />
        <LineItem
          text='Йода'
          type='Green'
          colors={greenColors}
          onPress={handlePalettePress}
          isSelected={themeStore.palette === 'Green'}
        />
        <LineItem
          text='Океан'
          type='SkyBlue'
          colors={blueColors}
          onPress={handlePalettePress}
          isSelected={themeStore.palette === 'SkyBlue'}
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
      <View style={styles.buttonContainer}>
        <Button text='POST Request' onPress={handlePostRequest} style='primary'/>
      </View>
    </Animated.ScrollView>
  );
});

const styles = StyleSheet.create((theme, rt) => {
  return ({
    abs: {
      position: 'absolute',
      bottom: 0,
      left: theme.spacings.x6,
    },
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
      flex: 1,
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
    textInput: {
      height: 40,
      width: rt.screen.width - theme.spacings.x8,
      borderColor: theme.colors.secondary10,
      borderWidth: 1,
      borderRadius: theme.roundings.r10,
      paddingHorizontal: theme.spacings.x8,
      marginVertical: theme.spacings.x4,
    },
  })
})