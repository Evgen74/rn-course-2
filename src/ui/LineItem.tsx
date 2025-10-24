import React, { memo, useCallback } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { StyleSheet } from 'react-native-unistyles';

type Props<T extends string = string> = {
  type: T;
  onPress: (type: T) => void;
  text: string;
  colors?: string[];
  isSelected: boolean;
};

function LineItemInner<T extends string = string>({
  text,
  colors,
  type,
  onPress,
  isSelected,
}: Props<T>) {
  const press = useCallback(() => {
    onPress(type);
  }, [onPress, type]);

  styles.useVariants({ isSelected });

  return (
    <TouchableOpacity style={styles.view} onPress={press}>
      <Text style={styles.text}>{text}</Text>
      {colors && (
        <View style={styles.colorsView}>
          {colors.map((color, i) => (
            <View
              key={i}
              style={[styles.colorView, { backgroundColor: color }]}
            />
          ))}
        </View>
      )}
    </TouchableOpacity>
  );
}

export const LineItem = memo(LineItemInner) as <T extends string = string>(
  props: Props<T>,
) => React.ReactElement;

const styles = StyleSheet.create(theme => ({
  view: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacings.x4,
  },
  text: {
    ...theme.typo.labelLarge,
    color: theme.colors.secondary10,
    variants: {
      isSelected: {
        true: {
          color: theme.colors.primary50,
          fontWeight: '600',
        },
      },
    },
  },
  colorsView: {
    flexDirection: 'row',
  },
  colorView: {
    borderRadius: theme.roundings.rounded,
    marginLeft: -theme.spacings.x2,
    width: 16,
    height: 16,
  },
}));
