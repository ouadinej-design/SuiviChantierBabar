import { View, Text, StyleSheet } from 'react-native';

export default function KpiCard({ title, value, color, subtitle }) {
  const formattedValue = typeof value === 'number'
    ? value.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' DZD'
    : value;

  return (
    <View style={[styles.card, { borderLeftColor: color || '#3498db' }]}>
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.value, { color: color || '#3498db' }]}>{formattedValue}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 13,
    color: '#7f8c8d',
    marginBottom: 4,
    fontWeight: '500',
  },
  value: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  subtitle: {
    fontSize: 11,
    color: '#95a5a6',
    marginTop: 2,
  },
});
