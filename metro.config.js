const {getDefaultConfig, mergeConfig} = require('@react-native/metro-config')
const {withRozenite} = require('@rozenite/metro')

const config = {}

// module.exports = mergeConfig(getDefaultConfig(__dirname), config)

module.exports = withRozenite(
  mergeConfig(getDefaultConfig(__dirname), config),
  {enabled: process.env.WITH_ROZENITE === 'true'},
)
