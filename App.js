import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';

const Tab = createBottomTabNavigator();

function SimpleScreen({ title }) {
  return (
    <View style={styles.screen}>
      <Text style={styles.screenText}>{title}</Text>
    </View>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch(err => {
        console.error(err);
        setError(err.message || String(err));
      });
  }, []);

  if (error) return (
    <View style={styles.center}><Text style={{ color: '#e74c3c', fontSize: 18 }}>{error}</Text></View>
  );

  if (!ready) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#3498db" />
    </View>
  );

  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Home" component={() => <SimpleScreen title="Dashboard" />} />
        <Tab.Screen name="Checklist" component={() => <SimpleScreen title="Check-list" />} />
        <Tab.Screen name="Expenses" component={() => <SimpleScreen title="Dépenses" />} />
        <Tab.Screen name="Revenue" component={() => <SimpleScreen title="Recettes" />} />
        <Tab.Screen name="Withdrawals" component={() => <SimpleScreen title="Retraits" />} />
      </Tab.Navigator>
      <StatusBar style="auto" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f3f7' },
  screenText: { fontSize: 20, color: '#2c3e50' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f3f7' },
});
