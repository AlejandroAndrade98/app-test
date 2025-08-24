module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'react-native-reanimated/plugin', // ← este es el correcto para SDK 53
      // (no pongas 'expo-router/babel')
    ],
  };
};
