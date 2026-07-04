import { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { initDatabase } from './src/database/database';

import DashboardScreen from './src/screens/DashboardScreen';
import ChecklistScreen from './src/screens/ChecklistScreen';
import ExpensesScreen from './src/screens/ExpensesScreen';
import RevenueScreen from './src/screens/RevenueScreen';
import WithdrawalsScreen from './src/screens/WithdrawalsScreen';

const Tab = createBottomTabNavigator();

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

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={{ color: '#e74c3c', fontSize: 18, marginBottom: 8 }}>Erreur</Text>
        <Text style={{ color: '#555', fontSize: 14, textAlign: 'center', paddingHorizontal: 40 }}>{error}</Text>
      </View>
    );
  }

  if (!ready) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3498db" />
        <Text style={{ marginTop: 12, color: '#7f8c8d' }}>Chargement...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#95a5a6',
          tabBarStyle: { backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#e8e8e8' },
          tabBarLabelStyle: { fontSize: 10, fontWeight: '600' },
          headerStyle: { backgroundColor: '#2c3e50' },
          headerTintColor: '#fff',
          headerTitleStyle: { fontWeight: '600', fontSize: 16 },
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} options={{ title: 'Tableau de Bord', headerTitle: 'Suivi Chantier Babar' }} />
        <Tab.Screen name="Checklist" component={ChecklistScreen} options={{ title: 'Avancement' }} />
        <Tab.Screen name="Expenses" component={ExpensesScreen} options={{ title: 'Dépenses' }} />
        <Tab.Screen name="Revenue" component={RevenueScreen} options={{ title: 'Recettes' }} />
        <Tab.Screen name="Withdrawals" component={WithdrawalsScreen} options={{ title: 'Retraits' }} />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f3f7',
  },
});
