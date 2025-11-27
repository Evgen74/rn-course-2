import { StyleSheet } from 'react-native-unistyles';

export const screenAnimationDuration = 250;

export const previewStyle = StyleSheet.create((theme) =>({
  view: {
    marginTop: 100,
    justifyContent: 'center',
    alignItems: 'center',
    gap: theme.spacings.x10,
  },
}));