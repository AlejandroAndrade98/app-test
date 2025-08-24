import 'react-native-gesture-handler';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Tabs } from 'expo-router';

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <Tabs>
          <Tabs.Screen name="venta" options={{ title: 'Venta' }} />
          <Tabs.Screen name="productos" options={{ title: 'Productos' }} />
          <Tabs.Screen name="reportes" options={{ title: 'Reportes' }} />
        </Tabs>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
