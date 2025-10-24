import { Text, TouchableOpacity, View } from 'react-native'
import { StyleSheet } from 'react-native-unistyles'

type Props = {
  onBack: () => void
  title: string
}

export const Header = ({onBack, title} : Props) => {
  return (
    <View style={styles.view}>
      <TouchableOpacity onPress={onBack} style={styles.backView}>
        <Text style={styles.backText}>{`Назад`}</Text>
      </TouchableOpacity>
      <Text style={styles.title}>{title}</Text>
    </View>
  )
}

const styles = StyleSheet.create((theme) => ({
  view: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacings.x4,
  },
  backView: {
    position: 'absolute',
    left: 0,
  },
  backText: {
    ...theme.typo.titleMedium,
    color: theme.colors.secondary30,
  },
  title: {
    ...theme.typo.headlineMedium,
    color: theme.colors.secondary10,
    fontWeight: '600',
  },
}))
