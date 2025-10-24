import { StyleSheet } from 'react-native-unistyles';
import { TouchableOpacity, Text, View } from 'react-native';
import { modifyLight } from '../style/themes/utils';
import { memo } from 'react';

export type Props = {
  mode?: 'contained' | 'outlined' | 'text';
  onPress: () => void;
  isDisabled?: boolean;
  text: string;
  size?: 'S' | 'M' | 'L';
  style?: 'primary' | 'secondary' | 'error' | 'success';
};

export const Button = memo(
  ({
    mode = 'contained',
    onPress,
    isDisabled = false,
    text,
    style = 'primary',
    size = 'M',
  }: Props) => {

    // для прокидывания пропсов в стили
    styles.useVariants({
      isDisabled,
      style,
      mode,
      size,
    });

    return (
      <TouchableOpacity onPress={onPress} disabled={isDisabled}>
        <View style={styles.button}>
          <Text style={styles.text}>{text}</Text>
        </View>
      </TouchableOpacity>
    );
  },
);

const styles = StyleSheet.create(theme => {
  return {
    button: {
      // для задания стилей зависящих от несокльких пропсов
      compoundVariants: [
        {
          isDisabled: false,
          style: 'primary',
          styles: {
            backgroundColor: theme.colors.primary50,
            borderColor: theme.colors.primary50,
          },
        },
        {
          isDisabled: false,
          style: 'secondary',
          styles: {
            backgroundColor: theme.colors.premium400,
            borderColor: theme.colors.premium400,
          },
        },
        {
          isDisabled: false,
          style: 'error',
          styles: {
            backgroundColor: theme.colors.grapefruit400,
            borderColor: theme.colors.grapefruit400,
          },
        },
        {
          isDisabled: false,
          style: 'success',
          styles: {
            backgroundColor: theme.colors.additional80,
            borderColor: theme.colors.additional80,
          },
        },
        {
          isDisabled: true,
          style: 'primary',
          styles: {
            backgroundColor: modifyLight(theme.colors.primary50, 10),
            borderColor: modifyLight(theme.colors.primary50, 10),
          },
        },
        {
          isDisabled: true,
          style: 'secondary',
          styles: {
            backgroundColor: modifyLight(theme.colors.premium400, 10),
            borderColor: modifyLight(theme.colors.premium400, 10),
          },
        },
        {
          isDisabled: true,
          style: 'error',
          styles: {
            backgroundColor: modifyLight(theme.colors.grapefruit400, 10),
            borderColor: modifyLight(theme.colors.grapefruit400, 10),
          },
        },
        {
          isDisabled: true,
          style: 'success',
          styles: {
            backgroundColor: modifyLight(theme.colors.additional80, 10),
            borderColor: modifyLight(theme.colors.additional80, 10),
          },
        },
      ],
      // для задания стилей зависящих от одного пропса
      variants: {
        size: {
          S: {
            paddingHorizontal: theme.spacings.x2,
            paddingVertical: theme.spacings.x2,
            borderRadius: theme.roundings.r4,
          },
          M: {
            paddingHorizontal: theme.spacings.x4,
            paddingVertical: theme.spacings.x3,
            borderRadius: theme.roundings.r4,
          },
          L: {
            paddingHorizontal: theme.spacings.x6,
            paddingVertical: theme.spacings.x4,
            borderRadius: theme.roundings.r6,
          },
        },
        mode: {
          contained: {
            borderColor: 'transparent',
          },
          outlined: {
            backgroundColor: 'transparent',
          },
          text: {
            borderColor: 'transparent',
            backgroundColor: 'transparent',
          },
        },
      },
    },
    text: {
      variants: {
        size: {
          S: {
            ...theme.typo.labelSmall,
          },
          M: {
            ...theme.typo.labelMedium,
          },
          L: {
            ...theme.typo.labelLarge,
          },
        },
        style: {
          primary: {
            color: theme.colors.secondary10,
          },
          secondary: {
            color: theme.colors.white,
          },
          error: {
            color: theme.colors.white,
          },
          success: {
            color: theme.colors.secondary10,
          },
        },
        isDisabled: {
          true: {
            color: theme.colors.white,
          },
        },
      },
    },
  };
});
