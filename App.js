import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';
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

  useEffect(() => {
    initDatabase()
      .then(() => setReady(true))
      .catch(console.error);
  }, []);

  if (!ready) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f3f7' }}>
        <ActivityIndicator size="large" color="#3498db" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#3498db',
          tabBarInactiveTintColor: '#95a5a6',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#e8e8e8',
            paddingBottom: 4,
            height: 56,
          },
          tabBarLabelStyle: {
            fontSize: 10,
            fontWeight: '600',
          },
          headerStyle: {
            backgroundColor: '#2c3e50',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 16,
          },
        }}
      >
        <Tab.Screen
          name="Dashboard"
          component={DashboardScreen}
          options={{
            title: 'Tableau de Bord',
            tabBarLabel: 'Dashboard',
            headerTitle: 'Suivi Chantier Babar',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color + '20', justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: size * 0.5, height: size * 0.5, borderRadius: size * 0.25, backgroundColor: color }} />
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Checklist"
          component={ChecklistScreen}
          options={{
            title: 'Avancement',
            tabBarLabel: 'Check-list',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: size * 0.5, height: size * 0.5, borderWidth: 2.5, borderColor: color, borderRadius: 3, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: size * 0.25, height: size * 0.25, backgroundColor: color, borderRadius: 1 }} />
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Expenses"
          component={ExpensesScreen}
          options={{
            title: 'Dépenses',
            tabBarLabel: 'Dépenses',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <View style={{ width: size * 0.5, height: size * 0.5, backgroundColor: color + '20', borderRadius: size * 0.1, justifyContent: 'center', alignItems: 'center' }}>
                  <View style={{ width: size * 0.3, height: size * 0.3, backgroundColor: color, borderRadius: size * 0.05 }} />
                </View>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Revenue"
          component={RevenueScreen}
          options={{
            title: 'Recettes',
            tabBarLabel: 'Recettes',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: size * 0.5, color }}>+</Text>
              </View>
            ),
          }}
        />
        <Tab.Screen
          name="Withdrawals"
          component={WithdrawalsScreen}
          options={{
            title: 'Retraits',
            tabBarLabel: 'Retraits',
            tabBarIcon: ({ color, size }) => (
              <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ fontSize: size * 0.5, color }}>−</Text>
              </View>
            ),
          }}
        />
      </Tab.Navigator>
      <StatusBar style="light" />
    </NavigationContainer>
  );
}
