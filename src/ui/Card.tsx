import {  Image, ImageSourcePropType, Text, View } from "react-native";
import { StyleSheet } from 'react-native-unistyles';

type Props = {
  text: string;
  image: ImageSourcePropType
}

export const Card = ({ text, image }: Props) => {
  return (
    <View style={styles.card} >
      <Image source={image} style={styles.image} />
      <Text style={styles.text}>{text}</Text>
    </View>
  )
};

const styles = StyleSheet.create((theme, rt) => {
  
  const screenWidth = rt.screen.width - theme.spacings.x8
  
  return({
    card: {
      borderRadius: theme.roundings.r8,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.colors.gray300,
      gap: theme.spacings.x4,
      paddingBottom: theme.spacings.x4,
    },
    image: {
      width: rt.isPortrait ? screenWidth : screenWidth * 0.3,
      aspectRatio: 2,
    },
    text: {
      ...theme.typo.titleMedium,
      color: theme.colors.secondary10,
    },
  })
});
