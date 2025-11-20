import React from 'react';
import { StyleSheet } from 'react-native';
import { Navigation } from './src/nav';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { KeyboardProvider } from 'react-native-keyboard-controller';

function App() {
  return (
    <KeyboardProvider>
      <GestureHandlerRootView style={styles.container}>
        <Navigation />
      </GestureHandlerRootView>
    </KeyboardProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default App;
