import React from 'react';
import { StyleSheet } from 'react-native';
import { Navigation } from './src/nav';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useNetworkActivityDevTools } from '@rozenite/network-activity-plugin';
import { KeyboardProvider } from 'react-native-keyboard-controller';
import { PreviewHost } from 'rozenite-preview';
import { useMobXDevTools } from './mobx-debuger';

function App() {
  useNetworkActivityDevTools();
  useMobXDevTools();
  
  return (
    <KeyboardProvider statusBarTranslucent navigationBarTranslucent>
      <GestureHandlerRootView style={styles.container}>
        <PreviewHost>
          <Navigation />
        </PreviewHost>
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
