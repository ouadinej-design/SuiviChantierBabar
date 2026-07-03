import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity, RefreshControl, Alert } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { getDatabase } from '../database/database';

const PAYMENT_STATUSES = ['en_attente', 'payé', 'retard'];
const STATUS_LABELS = { en_attente: 'En attente', payé: 'Payé', retard: 'En retard' };
const STATUS_COLORS = { en_attente: '#f39c12', payé: '#27ae60', retard: '#e74c3c' };

export default function RevenueScreen() {
  const [revenues, setRevenues] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [client, setClient] = useState('');
  const [amount, setAmount] = useState('');
  const [paymentStatus, setPaymentStatus] = useState('en_attente');
  const [refreshing, setRefreshing] = useState(false);

  const loadRevenues = useCallback(async () => {
    try {
      const db = getDatabase();
      const rows = await db.getAllAsync('SELECT * FROM revenues ORDER BY date DESC, id DESC');
      setRevenues(rows);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadRevenues(); }, [loadRevenues]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadRevenues();
    setRefreshing(false);
  };

  const addRevenue = async () => {
    if (!date || !client || !amount) {
      Alert.alert('Erreur', 'Veuillez remplir la date, le client et le montant');
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
        'INSERT INTO revenues (date, invoice_number, client, amount, payment_status) VALUES (?, ?, ?, ?, ?)',
        [date, invoiceNumber, client, numAmount, paymentStatus]
      );
      setShowForm(false);
      setInvoiceNumber('');
      setClient('');
      setAmount('');
      setPaymentStatus('en_attente');
      await loadRevenues();
    } catch (e) {
      console.error(e);
    }
  };

  const toggleStatus = async (rev) => {
    const order = ['en_attente', 'payé', 'retard'];
    const idx = order.indexOf(rev.payment_status);
    const next = order[(idx + 1) % order.length];
    try {
      const db = getDatabase();
      await db.runAsync('UPDATE revenues SET payment_status = ? WHERE id = ?', [next, rev.id]);
      await loadRevenues();
    } catch (e) {
      console.error(e);
    }
  };

  const totalPaid = revenues.filter(r => r.payment_status === 'payé').reduce((s, r) => s + r.amount, 0);

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Registre des Recettes</Text>
      <Text style={styles.total}>Total encaissé : {totalPaid.toLocaleString('fr-FR')} DZD</Text>

      <TouchableOpacity style={styles.addBtn} onPress={() => setShowForm(!showForm)}>
        <Text style={styles.addBtnText}>{showForm ? 'Annuler' : '+ Ajouter une recette'}</Text>
      </TouchableOpacity>

      {showForm && (
        <View style={styles.form}>
          <TextInput style={styles.input} placeholder="Date (AAAA-MM-JJ)" value={date} onChangeText={setDate} />
          <TextInput style={styles.input} placeholder="N° de Facture" value={invoiceNumber} onChangeText={setInvoiceNumber} />
          <TextInput style={styles.input} placeholder="Client / Désignation" value={client} onChangeText={setClient} />
          <TextInput style={styles.input} placeholder="Montant (DZD)" value={amount} onChangeText={setAmount} keyboardType="numeric" />
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.statusRow}>
            {PAYMENT_STATUSES.map(s => (
              <TouchableOpacity key={s} style={[styles.statusChip, paymentStatus === s && { backgroundColor: STATUS_COLORS[s] }]} onPress={() => setPaymentStatus(s)}>
                <Text style={[styles.statusChipText, paymentStatus === s && { color: '#fff' }]}>{STATUS_LABELS[s]}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.submitBtn} onPress={addRevenue}>
            <Text style={styles.submitBtnText}>Enregistrer</Text>
          </TouchableOpacity>
        </View>
      )}

      {revenues.map(rev => (
        <TouchableOpacity key={rev.id} style={styles.card} onPress={() => toggleStatus(rev)}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{rev.date}</Text>
            {rev.invoice_number ? <Text style={styles.cardInvoice}>#{rev.invoice_number}</Text> : null}
          </View>
          <Text style={styles.cardClient}>{rev.client}</Text>
          <Text style={styles.cardAmount}>{rev.amount.toLocaleString('fr-FR')} DZD</Text>
          <View style={[styles.statusBadge, { backgroundColor: STATUS_COLORS[rev.payment_status] }]}>
            <Text style={styles.statusBadgeText}>{STATUS_LABELS[rev.payment_status]}</Text>
          </View>
        </TouchableOpacity>
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
    color: '#27ae60',
    marginBottom: 12,
  },
  addBtn: {
    backgroundColor: '#27ae60',
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
  statusRow: {
    marginBottom: 10,
  },
  statusChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 8,
  },
  statusChipText: {
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
  cardInvoice: {
    fontSize: 12,
    color: '#3498db',
    fontWeight: '600',
  },
  cardClient: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
    marginBottom: 4,
  },
  cardAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 4,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
  },
  statusBadgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '600',
  },
});
