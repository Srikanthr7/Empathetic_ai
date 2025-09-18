import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Switch,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, Shield, Bell, Moon, Heart, Settings, CircleHelp as HelpCircle, LogOut, ChevronRight, Star, Clock, Lock } from 'lucide-react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function ProfileScreen() {
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [dailyReminder, setDailyReminder] = useState(true);
  const [userStats, setUserStats] = useState({
    daysActive: 0,
    conversationsCount: 0,
    moodsLogged: 0,
  });

  useEffect(() => {
    loadUserStats();
    loadSettings();
  }, []);

  const loadUserStats = async () => {
    try {
      const chatHistory = await AsyncStorage.getItem('chatHistory');
      const moodHistory = await AsyncStorage.getItem('moodHistory');
      
      const conversations = chatHistory ? JSON.parse(chatHistory).length : 0;
      const moods = moodHistory ? JSON.parse(moodHistory).length : 0;
      
      // Calculate days active (simplified)
      const daysActive = Math.max(Math.ceil(conversations / 5), moods);
      
      setUserStats({
        daysActive,
        conversationsCount: conversations,
        moodsLogged: moods,
      });
    } catch (error) {
      console.log('Error loading user stats:', error);
    }
  };

  const loadSettings = async () => {
    try {
      const settings = await AsyncStorage.getItem('userSettings');
      if (settings) {
        const parsedSettings = JSON.parse(settings);
        setDarkMode(parsedSettings.darkMode || false);
        setNotifications(parsedSettings.notifications !== false);
        setDailyReminder(parsedSettings.dailyReminder !== false);
      }
    } catch (error) {
      console.log('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    try {
      const settings = {
        darkMode,
        notifications,
        dailyReminder,
      };
      await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
    } catch (error) {
      console.log('Error saving settings:', error);
    }
  };

  useEffect(() => {
    saveSettings();
  }, [darkMode, notifications, dailyReminder]);

  const handleClearData = () => {
    Alert.alert(
      'Clear All Data',
      'This will permanently delete all your conversations and mood logs. This action cannot be undone.\n\nAre you sure?',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Clear All Data', 
          style: 'destructive',
          onPress: async () => {
            try {
              await AsyncStorage.multiRemove(['chatHistory', 'moodHistory']);
              setUserStats({
                daysActive: 0,
                conversationsCount: 0,
                moodsLogged: 0,
              });
              Alert.alert('Data Cleared', 'All your data has been successfully removed.');
            } catch (error) {
              Alert.alert('Error', 'Failed to clear data. Please try again.');
            }
          }
        }
      ]
    );
  };

  const handleAbout = () => {
    Alert.alert(
      'About Empathetic AI',
      'Version 1.0.0\n\nEmpathetic AI is designed specifically for Indian teenagers to provide a safe, judgment-free space for emotional support.\n\nYour privacy is our priority - all conversations are stored locally on your device.\n\nBuilt with ❤️ for your wellbeing.',
      [{ text: 'OK' }]
    );
  };

  const handleSupport = () => {
    Alert.alert(
      'Get Help',
      'If you\'re experiencing a mental health crisis:\n\n• AASRA: 91-22-27546669\n• Vandrevala Foundation: 1860-2662-345\n\nFor app support, please check the Resources tab for additional help.',
      [{ text: 'OK' }]
    );
  };

  const settingsOptions = [
    {
      title: 'Dark Mode',
      subtitle: 'Use dark theme',
      icon: <Moon size={20} color="#64748B" />,
      action: (
        <Switch
          value={darkMode}
          onValueChange={setDarkMode}
          trackColor={{ false: '#CBD5E0', true: '#9F7AEA' }}
          thumbColor={darkMode ? '#FFFFFF' : '#F1F5F9'}
        />
      ),
    },
    {
      title: 'Notifications',
      subtitle: 'Receive app notifications',
      icon: <Bell size={20} color="#64748B" />,
      action: (
        <Switch
          value={notifications}
          onValueChange={setNotifications}
          trackColor={{ false: '#CBD5E0', true: '#48BB78' }}
          thumbColor={notifications ? '#FFFFFF' : '#F1F5F9'}
        />
      ),
    },
    {
      title: 'Daily Check-in Reminder',
      subtitle: 'Gentle mood tracking reminder',
      icon: <Clock size={20} color="#64748B" />,
      action: (
        <Switch
          value={dailyReminder}
          onValueChange={setDailyReminder}
          trackColor={{ false: '#CBD5E0', true: '#63B3ED' }}
          thumbColor={dailyReminder ? '#FFFFFF' : '#F1F5F9'}
        />
      ),
    },
  ];

  const menuOptions = [
    {
      title: 'Privacy & Security',
      subtitle: 'Your data stays on your device',
      icon: <Shield size={20} color="#64748B" />,
      onPress: () => Alert.alert(
        'Privacy & Security',
        'Your privacy is our top priority:\n\n• All conversations are stored locally on your device\n• No data is sent to external servers\n• You can delete all data anytime\n• No personal information is required\n\nYour wellbeing journey is completely private.',
        [{ text: 'OK' }]
      ),
    },
    {
      title: 'About',
      subtitle: 'App information and version',
      icon: <HelpCircle size={20} color="#64748B" />,
      onPress: handleAbout,
    },
    {
      title: 'Get Support',
      subtitle: 'Crisis support and app help',
      icon: <Heart size={20} color="#64748B" />,
      onPress: handleSupport,
    },
    {
      title: 'Clear All Data',
      subtitle: 'Permanently delete conversations & moods',
      icon: <LogOut size={20} color="#F56565" />,
      onPress: handleClearData,
      danger: true,
    },
  ];

  return (
    <SafeAreaView style={[styles.container, darkMode && styles.darkContainer]}>
      <LinearGradient
        colors={darkMode ? ['#553C9A', '#1E40AF'] : ['#9F7AEA', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            <User size={32} color="#FFFFFF" />
          </View>
          <Text style={styles.welcomeText}>Welcome Back!</Text>
          <Text style={styles.subtitleText}>Your wellbeing matters</Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Your Journey</Text>
          <View style={styles.statsContainer}>
            <View style={[styles.statCard, darkMode && styles.darkCard]}>
              <Clock size={24} color="#9F7AEA" />
              <Text style={[styles.statNumber, darkMode && styles.darkText]}>{userStats.daysActive}</Text>
              <Text style={[styles.statLabel, darkMode && styles.darkSubtext]}>Days Active</Text>
            </View>
            <View style={[styles.statCard, darkMode && styles.darkCard]}>
              <Heart size={24} color="#F56565" />
              <Text style={[styles.statNumber, darkMode && styles.darkText]}>{userStats.moodsLogged}</Text>
              <Text style={[styles.statLabel, darkMode && styles.darkSubtext]}>Moods Logged</Text>
            </View>
            <View style={[styles.statCard, darkMode && styles.darkCard]}>
              <Star size={24} color="#48BB78" />
              <Text style={[styles.statNumber, darkMode && styles.darkText]}>{Math.floor(userStats.conversationsCount / 2)}</Text>
              <Text style={[styles.statLabel, darkMode && styles.darkSubtext]}>Conversations</Text>
            </View>
          </View>
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Settings</Text>
          {settingsOptions.map((option, index) => (
            <View key={index} style={[styles.optionCard, darkMode && styles.darkCard]}>
              <View style={styles.optionIcon}>{option.icon}</View>
              <View style={styles.optionContent}>
                <Text style={[styles.optionTitle, darkMode && styles.darkText]}>{option.title}</Text>
                <Text style={[styles.optionSubtitle, darkMode && styles.darkSubtext]}>{option.subtitle}</Text>
              </View>
              {option.action}
            </View>
          ))}
        </View>

        {/* Menu Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, darkMode && styles.darkText]}>Help & Information</Text>
          {menuOptions.map((option, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.optionCard, 
                darkMode && styles.darkCard,
                option.danger && styles.dangerCard
              ]}
              onPress={option.onPress}
              activeOpacity={0.8}
            >
              <View style={styles.optionIcon}>{option.icon}</View>
              <View style={styles.optionContent}>
                <Text style={[
                  styles.optionTitle, 
                  darkMode && styles.darkText,
                  option.danger && styles.dangerText
                ]}>
                  {option.title}
                </Text>
                <Text style={[
                  styles.optionSubtitle, 
                  darkMode && styles.darkSubtext,
                  option.danger && styles.dangerSubtext
                ]}>
                  {option.subtitle}
                </Text>
              </View>
              <ChevronRight size={16} color={option.danger ? '#F56565' : '#64748B'} />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.bottomMessage}>
          <Text style={[styles.bottomText, darkMode && styles.darkSubtext]}>
            Thank you for trusting us with your wellbeing journey. Remember, every step towards 
            better mental health is a victory worth celebrating. 💙
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
  darkContainer: {
    backgroundColor: '#1A202C',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  profileSection: {
    alignItems: 'center',
    paddingTop: 10,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  subtitleText: {
    fontSize: 16,
    color: '#E2E8F0',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  darkText: {
    color: '#F7FAFC',
  },
  darkSubtext: {
    color: '#A0AEC0',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  darkCard: {
    backgroundColor: '#2D3748',
  },
  statNumber: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2D3748',
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
  },
  optionCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    elevation: 1,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  dangerCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  optionIcon: {
    marginRight: 16,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#2D3748',
    marginBottom: 2,
  },
  dangerText: {
    color: '#F56565',
  },
  optionSubtitle: {
    fontSize: 14,
    color: '#64748B',
  },
  dangerSubtext: {
    color: '#FCA5A5',
  },
  bottomMessage: {
    backgroundColor: '#EDE9FE',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 30,
    alignItems: 'center',
  },
  bottomText: {
    fontSize: 16,
    color: '#581C87',
    textAlign: 'center',
    lineHeight: 24,
  },
});