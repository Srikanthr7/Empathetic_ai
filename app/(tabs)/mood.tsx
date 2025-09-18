import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Smile, 
  Frown, 
  Meh, 
  Heart, 
  Zap, 
  Cloud, 
  Sun, 
  CloudRain,
  Calendar,
  TrendingUp,
  Sparkles
} from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface MoodEntry {
  id: string;
  mood: number; // 1-5 scale
  emoji: string;
  note: string;
  date: string;
  timestamp: Date;
}

const moods = [
  { value: 1, label: 'Very Sad', emoji: '😢', icon: CloudRain, color: '#60A5FA' },
  { value: 2, label: 'Sad', emoji: '🙁', icon: Cloud, color: '#93C5FD' },
  { value: 3, label: 'Okay', emoji: '😐', icon: Meh, color: '#FDE047' },
  { value: 4, label: 'Good', emoji: '🙂', icon: Sun, color: '#86EFAC' },
  { value: 5, label: 'Great', emoji: '😊', icon: Heart, color: '#FB7185' },
];

export default function MoodScreen() {
  const [selectedMood, setSelectedMood] = useState<number | null>(null);
  const [moodNote, setMoodNote] = useState('');
  const [moodHistory, setMoodHistory] = useState<MoodEntry[]>([]);
  const [todayLogged, setTodayLogged] = useState(false);
  const buttonScale = useSharedValue(1);
  const cardScale = useSharedValue(0);

  useEffect(() => {
    loadMoodHistory();
    checkTodayEntry();
  }, []);

  const loadMoodHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('moodHistory');
      if (history) {
        const parsedHistory = JSON.parse(history).map((entry: any) => ({
          ...entry,
          timestamp: new Date(entry.timestamp)
        }));
        setMoodHistory(parsedHistory.slice(-30)); // Keep last 30 days
      }
    } catch (error) {
      console.log('Error loading mood history:', error);
    }
  };

  const checkTodayEntry = async () => {
    try {
      const history = await AsyncStorage.getItem('moodHistory');
      if (history) {
        const parsedHistory = JSON.parse(history);
        const today = new Date().toDateString();
        const todayEntry = parsedHistory.find((entry: any) => 
          new Date(entry.timestamp).toDateString() === today
        );
        setTodayLogged(!!todayEntry);
      }
    } catch (error) {
      console.log('Error checking today entry:', error);
    }
  };

  const saveMoodEntry = async () => {
    if (!selectedMood) {
      Alert.alert('Please select a mood', 'How are you feeling today?');
      return;
    }

    const selectedMoodData = moods.find(m => m.value === selectedMood);
    if (!selectedMoodData) return;

    const newEntry: MoodEntry = {
      id: Date.now().toString(),
      mood: selectedMood,
      emoji: selectedMoodData.emoji,
      note: moodNote.trim(),
      date: new Date().toDateString(),
      timestamp: new Date(),
    };

    try {
      const history = await AsyncStorage.getItem('moodHistory');
      const parsedHistory = history ? JSON.parse(history) : [];
      
      // Check if already logged today
      const today = new Date().toDateString();
      const existingTodayIndex = parsedHistory.findIndex((entry: any) => 
        new Date(entry.timestamp).toDateString() === today
      );

      if (existingTodayIndex >= 0) {
        parsedHistory[existingTodayIndex] = newEntry;
      } else {
        parsedHistory.push(newEntry);
      }

      await AsyncStorage.setItem('moodHistory', JSON.stringify(parsedHistory));
      setMoodHistory(parsedHistory.slice(-30));
      setTodayLogged(true);
      setSelectedMood(null);
      setMoodNote('');
      
      // Animate success
      cardScale.value = 0;
      cardScale.value = withDelay(200, withSpring(1, { damping: 15, stiffness: 200 }));
      
      Alert.alert(
        'Mood Logged! 💙',
        'Thank you for sharing how you\'re feeling. Remember, every emotion is valid and temporary.'
      );
    } catch (error) {
      console.log('Error saving mood entry:', error);
      Alert.alert('Error', 'Failed to save your mood entry. Please try again.');
    }
  };

  const getWeeklyAverage = () => {
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    
    const weeklyEntries = moodHistory.filter(entry => 
      entry.timestamp >= oneWeekAgo
    );
    
    if (weeklyEntries.length === 0) return 0;
    
    const average = weeklyEntries.reduce((sum, entry) => sum + entry.mood, 0) / weeklyEntries.length;
    return Math.round(average * 10) / 10;
  };

  const getMoodTrend = () => {
    if (moodHistory.length < 2) return 'neutral';
    
    const recent = moodHistory.slice(-3);
    const earlier = moodHistory.slice(-6, -3);
    
    if (recent.length === 0 || earlier.length === 0) return 'neutral';
    
    const recentAvg = recent.reduce((sum, entry) => sum + entry.mood, 0) / recent.length;
    const earlierAvg = earlier.reduce((sum, entry) => sum + entry.mood, 0) / earlier.length;
    
    if (recentAvg > earlierAvg + 0.3) return 'improving';
    if (recentAvg < earlierAvg - 0.3) return 'declining';
    return 'stable';
  };

  const animatedButtonStyle = useAnimatedStyle(() => ({
    transform: [{ scale: buttonScale.value }],
  }));

  const animatedCardStyle = useAnimatedStyle(() => ({
    transform: [{ scale: cardScale.value }],
  }));

  const handleMoodPress = (moodValue: number) => {
    setSelectedMood(moodValue);
    buttonScale.value = withSequence(
      withSpring(0.95, { damping: 15, stiffness: 400 }),
      withSpring(1, { damping: 15, stiffness: 200 })
    );
  };
  const renderMoodHistory = () => {
    const last7Days = moodHistory.slice(-7).reverse();
    
    return (
      <View style={styles.historyContainer}>
        <Text style={styles.sectionTitle}>Recent Moods</Text>
        {last7Days.length > 0 ? (
          last7Days.map((entry) => (
            <View key={entry.id} style={styles.historyItem}>
              <Text style={styles.historyEmoji}>{entry.emoji}</Text>
              <View style={styles.historyContent}>
                <Text style={styles.historyDate}>
                  {new Date(entry.timestamp).toLocaleDateString('en-IN', {
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric'
                  })}
                </Text>
                <Text style={styles.historyMood}>
                  {moods.find(m => m.value === entry.mood)?.label}
                </Text>
                {entry.note && (
                  <Text style={styles.historyNote}>{entry.note}</Text>
                )}
              </View>
            </View>
          ))
        ) : (
          <Text style={styles.noDataText}>Start logging your moods to see patterns!</Text>
        )}
      </View>
    );
  };

  const weeklyAverage = getWeeklyAverage();
  const trend = getMoodTrend();

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#9F7AEA', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Mood Tracker</Text>
        <Text style={styles.headerSubtitle}>Understanding your emotional patterns</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {!todayLogged && (
          <View style={styles.todaySection}>
            <Text style={styles.sectionTitle}>How are you feeling today?</Text>
            <Text style={styles.sectionDescription}>
              Your feelings are valid, and tracking them helps build emotional awareness.
            </Text>
            
            <View style={styles.moodSelector}>
              {moods.map((mood) => {
                const IconComponent = mood.icon;
                return (
                  <Animated.View
                    key={mood.value}
                    style={selectedMood === mood.value ? animatedButtonStyle : {}}
                  >
                    <TouchableOpacity
                      style={[
                        styles.moodButton,
                        selectedMood === mood.value && styles.moodButtonSelected,
                        { borderColor: mood.color }
                      ]}
                      onPress={() => handleMoodPress(mood.value)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                      <Text style={[styles.moodLabel, { color: mood.color }]}>
                        {mood.label}
                      </Text>
                      {selectedMood === mood.value && (
                        <View style={styles.selectedIndicator}>
                          <Sparkles size={12} color={mood.color} />
                        </View>
                      )}
                    </TouchableOpacity>
                  </Animated.View>
                );
              })}
            </View>

            {selectedMood && (
              <TouchableOpacity
                style={styles.saveButton}
                onPress={saveMoodEntry}
                activeOpacity={0.8}
              >
                <Text style={styles.saveButtonText}>Log My Mood</Text>
              </TouchableOpacity>
            )}
          </View>
        )}

        {todayLogged && (
          <Animated.View style={[styles.completedSection, animatedCardStyle]}>
            <Heart size={32} color="#48BB78" />
            <Text style={styles.completedTitle}>Today's Mood Logged! 🎉</Text>
            <Text style={styles.completedDescription}>
              Thank you for checking in with your emotions today.
            </Text>
          </Animated.View>
        )}

        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Your Insights</Text>
          
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Calendar size={24} color="#9F7AEA" />
              <Text style={styles.statNumber}>{moodHistory.length}</Text>
              <Text style={styles.statLabel}>Days Tracked</Text>
            </View>
            
            <View style={styles.statCard}>
              <TrendingUp size={24} color="#48BB78" />
              <Text style={styles.statNumber}>
                {weeklyAverage > 0 ? weeklyAverage.toFixed(1) : '-'}
              </Text>
              <Text style={styles.statLabel}>Weekly Average</Text>
            </View>
          </View>

          {trend !== 'neutral' && (
            <View style={styles.trendCard}>
              <Text style={styles.trendText}>
                Your mood has been {' '}
                <Text style={[
                  styles.trendLabel,
                  { color: trend === 'improving' ? '#48BB78' : '#F56565' }
                ]}>
                  {trend}
                </Text>
                {' '} lately. {trend === 'improving' 
                  ? "Keep doing what's working for you! 🌟" 
                  : "Remember, tough times don't last. Consider reaching out for support. 💙"}
              </Text>
            </View>
          )}
        </View>

        {renderMoodHistory()}

        <View style={styles.supportSection}>
          <Text style={styles.supportTitle}>Remember</Text>
          <Text style={styles.supportText}>
            Every emotion you experience is valid and temporary. Difficult feelings will pass, 
            and celebrating good ones helps build resilience. If you notice concerning patterns, 
            please reach out to a counselor or trusted adult.
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    textAlign: 'center',
    marginTop: 8,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  todaySection: {
    backgroundColor: '#FFFFFF',
    padding: 24,
    borderRadius: 20,
    marginTop: 20,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
    textAlign: 'center',
  },
  sectionDescription: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 24,
  },
  moodSelector: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    marginBottom: 24,
  },
  moodButton: {
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'transparent',
    backgroundColor: '#F8FAFC',
    margin: 4,
    minWidth: 80,
    position: 'relative',
  },
  moodButtonSelected: {
    backgroundColor: '#FFFFFF',
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  selectedIndicator: {
    position: 'absolute',
    top: 4,
    right: 4,
  },
  moodEmoji: {
    fontSize: 32,
    marginBottom: 8,
  },
  moodLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  saveButton: {
    backgroundColor: '#9F7AEA',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  completedSection: {
    backgroundColor: '#F0FDF4',
    padding: 24,
    borderRadius: 20,
    marginTop: 20,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#86EFAC',
  },
  completedTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#166534',
    marginTop: 12,
    marginBottom: 8,
  },
  completedDescription: {
    fontSize: 16,
    color: '#166534',
    textAlign: 'center',
    lineHeight: 24,
  },
  statsSection: {
    marginTop: 24,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 16,
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 8,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  statNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2D3748',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  trendCard: {
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 16,
    marginTop: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FB923C',
  },
  trendText: {
    fontSize: 16,
    color: '#9A3412',
    lineHeight: 24,
  },
  trendLabel: {
    fontWeight: 'bold',
  },
  historyContainer: {
    marginTop: 24,
  },
  historyItem: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  historyEmoji: {
    fontSize: 24,
    marginRight: 16,
    marginTop: 4,
  },
  historyContent: {
    flex: 1,
  },
  historyDate: {
    fontSize: 14,
    fontWeight: '600',
    color: '#64748B',
    marginBottom: 4,
  },
  historyMood: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  historyNote: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  noDataText: {
    fontSize: 16,
    color: '#64748B',
    textAlign: 'center',
    fontStyle: 'italic',
    padding: 20,
  },
  supportSection: {
    backgroundColor: '#EDE9FE',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#9F7AEA',
  },
  supportTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#581C87',
    marginBottom: 12,
  },
  supportText: {
    fontSize: 16,
    color: '#581C87',
    lineHeight: 24,
  },
});