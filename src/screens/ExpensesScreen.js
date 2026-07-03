import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/database';

const CATEGORIES = [
  'Matériaux', 'Main d\'œuvre', 'Logistique', 'Équipement',
  'Sous-traitance', 'Administratif', 'Imprévu', 'Autre'
];

const CATEGORY_COLORS = {
  'Matériaux': '#3498db',
  'Main d\'œuvre': '#27ae60',
  'Logistique': '#f1c40f',
  'Équipement': '#e67e22',
  'Sous-traitance': '#9b59b6',
  'Administratif': '#1abc9c',
  'Imprévu': '#e74c3c',
  'Autre': '#95a5a6',
};

export default function ExpensesScreen() {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [notes, setNotes] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  const loadExpenses = useCallback(async () => {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM expenses ORDER BY date DESC, id DESC');
      setExpenses(rows);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadExpenses(); }, [loadExpenses]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadExpenses();
    setRefreshing(false);
  };

  const addExpense = async () => {
    if (!date || !title || !amount) {
      Alert.alert('Erreur', 'Veuillez remplir la date, l\'intitulé et le montant');
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
        'INSERT INTO expenses (date, category, title, amount, notes) VALUES (?, ?, ?, ?, ?)',
        [date, category, title, numAmount, notes]
      );
      setShowForm(false);
      setTitle('');
      setAmount('');
      setNotes('');
      await loadExpenses();
    } catch (e) {
      console.error(e);
    }
  };

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Registre des Dépenses</Text>
      <Text style={styles.total}>Total : {totalExpenses.toLocaleString('fr-FR')} DZD</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? 'Annuler' : '+ Ajouter une dépense'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catRow}>
            {CATEGORIES.map(c => (
              <TouchableOpacity key={c} style={[styles.catChip, category === c && { backgroundColor: CATEGORY_COLORS[c] }]} onPress={() => setCategory(c)}>
                <Text style={[styles.catChipText, category === c && { color: '#fff' }]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TextInput style={styles.input} placeholder="Intitulé" value={title} onChangeText={setTitle} />
          <TextInput style={styles.input} placeholder="Montant (DZD)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <TextInput style={styles.input} placeholder="Commentaires (optionnel)" value={notes} onChangeText={setNotes} />
          <TouchableOpacity style={styles.submitBtn} onPress={addExpense}>
            <Text style={styles.submitBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      )}

      {expenses.map(exp => (
        <View key={exp.id} style={[styles.card, { borderLeftColor: CATEGORY_COLORS[exp.category] || '#95a5a6' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{exp.date}</Text>
            <View style={[styles.catBadge, { backgroundColor: CATEGORY_COLORS[exp.category] || '#95a5a6' }]}>
              <Text style={styles.catBadgeText}>{exp.category}</Text>
            </View>
          </View>
          <Text style={styles.cardTitle}>{exp.title}</Text>
          <Text style={styles.cardAmount}>{exp.amount.toLocaleString('fr-FR')} DZD</Text>
          {exp.notes ? <Text style={styles.cardNotes}>{exp.notes}</Text> : null}
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
    color: '#e74c3c',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#3498db',
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
  catRow: {
    marginBottom: 10,
  },
  catChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  catChipText: {
    fontSize: 12,
    color: '#555',
    fontWeight: '500',
  },
  submitBtn: {
    backgroundColor: '#27ae60',
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
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  catBadge: {
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  catBadgeText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '600',
  },
  cardTitle: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#e74c3c',
  },
  cardNotes: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 4,
  },
});
