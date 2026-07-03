import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, Dimensions, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import KpiCard from '../components/KpiCard';
import ProgressBar from '../components/ProgressBar';
import { getDatabase, getTotalRevenues, getTotalExpenses, getTotalWithdrawals } from '../database/database';

const screenWidth = Dimensions.get('window').width - 40;

export default function DashboardScreen() {
  const [revenues, setRevenues] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [withdrawals, setWithdrawals] = useState(0);
  const [budgetData, setBudgetData] = useState({ vrd: [], logements: [] });
  const [projectName, setProjectName] = useState('Chargement...');
  const [refreshing, setRefreshing] = useState(false);

  const loadData = useCallback(async () => {
    try {
      const db = getDatabase();
      const rev = await getTotalRevenues();
      const exp = await getTotalExpenses();
      const wd = await getTotalWithdrawals();
      setRevenues(rev);
      setExpenses(exp);
      setWithdrawals(wd);

      const proj = await db.getFirstAsync('SELECT * FROM project WHERE id = 1');
      if (proj) setProjectName(proj.name);

      const cats = await db.getAllAsync('SELECT * FROM budget_categories ORDER BY category_type, code');
      const vrd = cats.filter(c => c.category_type === 'vrd');
      const logements = cats.filter(c => c.category_type === 'logements');
      setBudgetData({ vrd, logements });
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadData(); }, [loadData]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const profit = revenues - expenses;
  const remaining = profit - withdrawals;
  const totalBudget = 38069021;
  const progressPct = totalBudget > 0 ? Math.min((expenses / totalBudget) * 100, 100) : 0;

  const BarChart = ({ vrd, logements }) => {
    const allItems = [...vrd, ...logements];
    const maxVal = Math.max(...allItems.map(i => i.montant_ht), 1);
    const barWidth = Math.min((screenWidth - 80) / Math.max(allItems.length, 1), 60);

    return (
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Recettes vs Dépenses</Text>
        <View style={styles.barRow}>
          <View style={[styles.bar, { height: 120, backgroundColor: '#27ae60', width: 40, marginRight: 20 }]}>
            <Text style={styles.barLabel}>Recettes</Text>
            <Text style={styles.barValue}>{(revenues / 1000000).toFixed(1)}M</Text>
          </View>
          <View style={[styles.bar, { height: Math.max((expenses / Math.max(revenues, 1)) * 120, 10), backgroundColor: '#e74c3c', width: 40 }]}>
            <Text style={styles.barLabel}>Dépenses</Text>
            <Text style={styles.barValue}>{(expenses / 1000000).toFixed(1)}M</Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.projectName}>{projectName}</Text>
      <Text style={styles.deadline}>Livraison : 31 décembre 2026</Text>

      <KpiCard title="Total des Recettes" value={revenues} color="#27ae60" />
      <KpiCard title="Total des Dépenses" value={expenses} color="#e74c3c" />
      <KpiCard title="Bénéfice Réel" value={profit} color={profit >= 0 ? '#2980b9' : '#e74c3c'} />
      <KpiCard title="Reste à Distribuer" value={remaining} color={remaining >= 0 ? '#8e44ad' : '#e74c3c'} />

      <BarChart {...budgetData} />

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Avancement Global des Travaux</Text>
        <ProgressBar progress={progressPct} color="#3498db" />
        <Text style={styles.percentText}>{progressPct.toFixed(1)}%</Text>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Budget VRD par catégorie</Text>
        {budgetData.vrd.map(item => (
          <View key={item.id} style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>{item.code} - {item.name}</Text>
            <Text style={styles.budgetAmount}>{item.montant_ht.toLocaleString('fr-FR')} DZD</Text>
          </View>
        ))}
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Budget Logements par catégorie</Text>
        {budgetData.logements.map(item => (
          <View key={item.id} style={styles.budgetRow}>
            <Text style={styles.budgetLabel}>{item.code} - {item.name}</Text>
            <Text style={styles.budgetAmount}>{item.montant_ht.toLocaleString('fr-FR')} DZD</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f7',
    padding: 16,
  },
  projectName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  deadline: {
    fontSize: 14,
    color: '#e74c3c',
    fontWeight: '600',
    marginBottom: 16,
  },
  chartContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#2c3e50',
    marginBottom: 12,
  },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    height: 140,
  },
  bar: {
    borderRadius: 6,
    justifyContent: 'flex-end',
    alignItems: 'center',
    paddingBottom: 6,
  },
  barLabel: {
    color: '#fff',
    fontSize: 9,
    fontWeight: '600',
    marginBottom: 2,
  },
  barValue: {
    color: '#fff',
    fontSize: 10,
    fontWeight: 'bold',
  },
  percentText: {
    textAlign: 'center',
    marginTop: 8,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#3498db',
  },
  budgetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  budgetLabel: {
    fontSize: 12,
    color: '#555',
    flex: 1,
  },
  budgetAmount: {
    fontSize: 12,
    fontWeight: '600',
    color: '#2c3e50',
  },
});
