import { HomeScreen } from '../home';
import { useCallback, useState } from 'react';
import { Settings } from '../settings';

type Screen = 'home' | 'screen'

export type WithNav<T> = T & {
  navigate: (screenName: Screen) => void
}

export const Navigation = () => {
  const [navState, setNavState] = useState<Screen>('home')

  const navigate = useCallback((screenName: Screen) => {
    setNavState(screenName)
  },[])

  if (navState === 'screen') {
    return <Settings navigate={navigate} />
  }
  return <HomeScreen navigate={navigate} />
}

