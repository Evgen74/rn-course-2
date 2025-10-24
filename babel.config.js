module.exports = function (api) {
  api.cache(true);

  return {
    presets: ['module:@react-native/babel-preset'],
    plugins: [
      [
        'react-native-unistyles/plugin',
        {
          // использовать для отладки зависимостей стилей
          debug: true,
          root: 'src',
        },
      ],
      [
        '@babel/plugin-proposal-decorators',
        {
          version: '2023-05',
        },
      ],
      ['@babel/plugin-transform-class-static-block'],
      'react-native-worklets/plugin',
    ],
  };
};
