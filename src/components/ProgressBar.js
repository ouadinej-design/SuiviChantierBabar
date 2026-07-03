import { View, StyleSheet } from 'react-native';

export default function ProgressBar({ progress, color }) {
  const pct = Math.min(Math.max(progress || 0, 0), 100);
  return (
    <View style={styles.container}>
      <View style={[styles.fill, { width: `${pct}%`, backgroundColor: color || '#27ae60' }]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 10,
    backgroundColor: '#ecf0f1',
    borderRadius: 5,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    borderRadius: 5,
  },
});
