import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/database';

const BENEFICIARIES = ['Takiedine', 'Salah', 'Nejmeddine'];

export default function WithdrawalsScreen() {
  const [withdrawals, setWithdrawals] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [amount, setAmount] = useState('');
  const [beneficiary, setBeneficiary] = useState(BENEFICIARIES[0]);
  const [refreshing, setRefreshing] = useState(false);

  const loadWithdrawals = useCallback(async () => {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM withdrawals ORDER BY date DESC, id DESC');
      setWithdrawals(rows);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadWithdrawals(); }, [loadWithdrawals]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadWithdrawals();
    setRefreshing(false);
  };

  const addWithdrawal = async () => {
    if (!date || !amount) {
      Alert.alert('Erreur', 'Veuillez remplir la date et le montant');
      return;
    }
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Erreur', 'Montant invalide');
      return;
    }
    try {
      const db = getDatabase();
      await db.runAsync(
        'INSERT INTO withdrawals (date, amount, beneficiary) VALUES (?, ?, ?)',
        [date, numAmount, beneficiary]
      );
      setShowForm(false);
      setAmount('');
      await loadWithdrawals();
    } catch (e) {
      console.error(e);
    }
  };

  const totalByBeneficiary = {};
  for (const b of BENEFICIARIES) totalByBeneficiary[b] = 0;
  for (const w of withdrawals) {
    if (totalByBeneficiary[w.beneficiary] !== undefined) {
      totalByBeneficiary[w.beneficiary] += w.amount;
    }
  }

  const totalWithdrawals = withdrawals.reduce((s, w) => s + w.amount, 0);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Retrait des Bénéfices</Text>
      <Text style={styles.total}>Total retiré : {totalWithdrawals.toLocaleString('fr-FR')} DZD</Text>

      <View style={styles.summaryRow}>
        {BENEFICIARIES.map(b => (
          <View key={b} style={styles.benefCard}>
            <Text style={styles.benefName}>{b}</Text>
            <Text style={styles.benefAmount}>{totalByBeneficiary[b].toLocaleString('fr-FR')} DZD</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? 'Annuler' : '+ Nouveau retrait'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
          <TextInput style={styles.input} placeholder="Montant (DZD)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <Text style={styles.label}>Bénéficiaire</Text>
          <View style={styles.benefRow}>
            {BENEFICIARIES.map(b => (
              <TouchableOpacity key={b} style={[styles.benefChip, beneficiary === b && styles.benefChipActive]} onPress={() => setBeneficiary(b)}>
                <Text style={[styles.benefChipText, beneficiary === b && styles.benefChipTextActive]}>{b}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity style={styles.submitBtn} onPress={addWithdrawal}>
            <Text style={styles.submitBtnText}>Enregistrer le retrait</Text>
          </TouchableOpacity>
        </View>
      )}

      {withdrawals.map(w => (
        <View key={w.id} style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{w.date}</Text>
            <View style={styles.benefBadge}>
              <Text style={styles.benefBadgeText}>{w.beneficiary}</Text>
            </View>
          </View>
          <Text style={styles.cardAmount}>{w.amount.toLocaleString('fr-FR')} DZD</Text>
        </View>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f0f3f7',
    padding: 16,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 4,
  },
  total: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8e44ad',
    marginBottom: 12,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  benefCard: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 12,
    flex: 1,
    marginHorizontal: 3,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  benefName: {
    fontSize: 11,
    color: '#7f8c8d',
    fontWeight: '600',
    marginBottom: 4,
  },
  benefAmount: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
  addBtn: {
    backgroundColor: '#8e44ad',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 12,
  },
  addBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  form: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    fontSize: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#555',
    marginBottom: 8,
  },
  benefRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  benefChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  benefChipActive: {
    backgroundColor: '#8e44ad',
    borderColor: '#8e44ad',
  },
  benefChipText: {
    fontSize: 13,
    color: '#555',
    fontWeight: '500',
  },
  benefChipTextActive: {
    color: '#fff',
  },
  submitBtn: {
    backgroundColor: '#8e44ad',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontWeight: '700',
    fontSize: 15,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  benefBadge: {
    backgroundColor: '#8e44ad',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  benefBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#8e44ad',
  },
});
