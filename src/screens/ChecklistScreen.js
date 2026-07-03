import { useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import ProgressBar from '../components/ProgressBar';
import { getDatabase } from '../database/database';

const statusLabels = {
  en_attente: 'En attente',
  en_cours: 'En cours',
  termine: 'Terminé',
};

const statusColors = {
  en_attente: '#95a5a6',
  en_cours: '#f39c12',
  termine: '#27ae60',
};

export default function ChecklistScreen() {
  const [tasks, setTasks] = useState([]);
  const [groups, setGroups] = useState({});
  const [refreshing, setRefreshing] = useState(false);

  const loadTasks = useCallback(async () => {
    try {
      const db = getDatabase();
      const allTasks = await db.getAllAsync('SELECT * FROM tasks ORDER BY id');
      setTasks(allTasks);

      const grouped = {};
      for (const task of allTasks) {
        if (!grouped[task.category]) grouped[task.category] = [];
        grouped[task.category].push(task);
      }
      setGroups(grouped);
    } catch (e) {
      console.error(e);
    }
  }, []);

  useFocusEffect(useCallback(() => { loadTasks(); }, [loadTasks]));

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTasks();
    setRefreshing(false);
  };

  const cycleStatus = async (task) => {
    const order = ['en_attente', 'en_cours', 'termine'];
    const idx = order.indexOf(task.status);
    const nextStatus = order[(idx + 1) % order.length];
    const nextProgress = nextStatus === 'termine' ? 100 : nextStatus === 'en_cours' ? 50 : 0;

    try {
      const db = getDatabase();
      await db.runAsync('UPDATE tasks SET status = ?, progress = ? WHERE id = ?', [nextStatus, nextProgress, task.id]);
      await loadTasks();
    } catch (e) {
      console.error(e);
    }
  };

  const allDone = tasks.length > 0 && tasks.every(t => t.status === 'termine');
  const doneCount = tasks.filter(t => t.status === 'termine').length;
  const totalProgress = tasks.length > 0 ? Math.round((doneCount / tasks.length) * 100) : 0;

  return (
    <ScrollView style={styles.container} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}>
      <Text style={styles.title}>Check-list des Travaux</Text>
      <View style={styles.summaryCard}>
        <Text style={styles.summaryText}>{doneCount} / {tasks.length} tâches terminées</Text>
        <ProgressBar progress={totalProgress} color={allDone ? '#27ae60' : '#3498db'} />
        <Text style={styles.percentText}>{totalProgress}%</Text>
      </View>

      {Object.entries(groups).map(([category, catTasks]) => (
        <View key={category} style={styles.groupCard}>
          <Text style={styles.groupTitle}>{category}</Text>
          {catTasks.map(task => (
            <TouchableOpacity key={task.id} style={styles.taskRow} onPress={() => cycleStatus(task)}>
              <View style={[styles.checkbox, { backgroundColor: statusColors[task.status], borderColor: statusColors[task.status] }]}>
                {task.status === 'termine' && <Text style={styles.checkmark}>✓</Text>}
                {task.status === 'en_cours' && <Text style={styles.checkmark}>◐</Text>}
              </View>
              <View style={styles.taskInfo}>
                <Text style={[styles.taskTitle, task.status === 'termine' && styles.doneText]}>{task.title}</Text>
                <Text style={[styles.statusBadge, { color: statusColors[task.status] }]}>
                  {statusLabels[task.status]}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
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
    marginBottom: 16,
  },
  summaryCard: {
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
  summaryText: {
    fontSize: 14,
    color: '#555',
    marginBottom: 8,
    fontWeight: '500',
  },
  percentText: {
    textAlign: 'center',
    marginTop: 6,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#3498db',
  },
  groupCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  groupTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2c3e50',
    marginBottom: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f5f5f5',
  },
  checkbox: {
    width: 26,
    height: 26,
    borderRadius: 13,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  taskInfo: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  taskTitle: {
    fontSize: 13,
    color: '#333',
    flex: 1,
  },
  doneText: {
    textDecorationLine: 'line-through',
    color: '#95a5a6',
  },
  statusBadge: {
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 8,
  },
});
