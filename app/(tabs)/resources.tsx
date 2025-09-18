import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Linking,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  Phone, 
  ExternalLink, 
  Heart, 
  Brain, 
  Shield, 
  Users, 
  BookOpen, 
  Headphones,
  MessageCircle,
  Star,
  ChevronRight
} from 'lucide-react-native';

const emergencyContacts = [
  {
    name: 'AASRA',
    number: '91-22-27546669',
    description: '24/7 suicide prevention helpline',
    icon: <Phone size={20} color="#F56565" />
  },
  {
    name: 'Vandrevala Foundation',
    number: '1860-2662-345',
    description: 'Free mental health support',
    icon: <Heart size={20} color="#F56565" />
  },
  {
    name: 'iCall',
    number: '022-25521111',
    description: 'Psychosocial helpline (10 AM - 8 PM)',
    icon: <MessageCircle size={20} color="#F56565" />
  },
];

const copingStrategies = [
  {
    title: 'Deep Breathing (4-7-8 Technique)',
    description: 'Breathe in for 4, hold for 7, exhale for 8. Repeat 3-4 times to calm anxiety.',
    icon: <Brain size={24} color="#63B3ED" />,
    category: 'Anxiety Relief'
  },
  {
    title: 'Grounding Exercise (5-4-3-2-1)',
    description: 'Name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, 1 you taste.',
    icon: <Shield size={24} color="#48BB78" />,
    category: 'Mindfulness'
  },
  {
    title: 'Progressive Muscle Relaxation',
    description: 'Tense and release each muscle group from toes to head for 5 seconds each.',
    icon: <Star size={24} color="#9F7AEA" />,
    category: 'Stress Relief'
  },
  {
    title: 'Journaling Prompts',
    description: 'Write about: What am I grateful for? What went well today? How do I feel?',
    icon: <BookOpen size={24} color="#F56565" />,
    category: 'Self-Reflection'
  },
];

const resources = [
  {
    title: 'Mental Health India Resources',
    description: 'Comprehensive directory of mental health professionals across India',
    url: 'https://www.mentalhealthindia.net',
    icon: <Users size={20} color="#9F7AEA" />
  },
  {
    title: 'Headspace - Meditation App',
    description: 'Guided meditation and mindfulness exercises for teenagers',
    url: 'https://www.headspace.com',
    icon: <Headphones size={20} color="#63B3ED" />
  },
  {
    title: 'Student Crisis Support',
    description: 'Academic stress and exam anxiety support resources',
    url: 'https://www.studentcrisis.org.in',
    icon: <BookOpen size={20} color="#48BB78" />
  },
];

const categories = ['All', 'Crisis Support', 'Coping Strategies', 'Professional Help', 'Self-Care'];

export default function ResourcesScreen() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const handlePhoneCall = (number: string, name: string) => {
    Alert.alert(
      `Call ${name}`,
      `Are you sure you want to call ${number}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Call Now', 
          onPress: () => Linking.openURL(`tel:${number}`)
        }
      ]
    );
  };

  const handleWebLink = (url: string, title: string) => {
    Alert.alert(
      `Open ${title}`,
      'This will open in your browser.',
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Open', 
          onPress: () => Linking.openURL(url)
        }
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#9F7AEA', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Support Resources</Text>
        <Text style={styles.headerSubtitle}>
          You're not alone - help is always available
        </Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Emergency Contacts Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🚨 Emergency Support</Text>
          <Text style={styles.sectionDescription}>
            If you're in crisis or having thoughts of self-harm, please reach out immediately:
          </Text>
          
          {emergencyContacts.map((contact, index) => (
            <TouchableOpacity
              key={index}
              style={styles.emergencyCard}
              onPress={() => handlePhoneCall(contact.number, contact.name)}
              activeOpacity={0.8}
            >
              <View style={styles.emergencyIcon}>{contact.icon}</View>
              <View style={styles.emergencyContent}>
                <Text style={styles.emergencyName}>{contact.name}</Text>
                <Text style={styles.emergencyNumber}>{contact.number}</Text>
                <Text style={styles.emergencyDescription}>{contact.description}</Text>
              </View>
              <ChevronRight size={20} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Coping Strategies Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🧘 Coping Strategies</Text>
          <Text style={styles.sectionDescription}>
            Quick techniques you can use anytime you're feeling overwhelmed:
          </Text>
          
          {copingStrategies.map((strategy, index) => (
            <View key={index} style={styles.strategyCard}>
              <View style={styles.strategyHeader}>
                <View style={styles.strategyIcon}>{strategy.icon}</View>
                <View style={styles.strategyTitleContainer}>
                  <Text style={styles.strategyTitle}>{strategy.title}</Text>
                  <Text style={styles.strategyCategory}>{strategy.category}</Text>
                </View>
              </View>
              <Text style={styles.strategyDescription}>{strategy.description}</Text>
            </View>
          ))}
        </View>

        {/* Resources Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📚 Helpful Resources</Text>
          <Text style={styles.sectionDescription}>
            Professional support and educational materials:
          </Text>
          
          {resources.map((resource, index) => (
            <TouchableOpacity
              key={index}
              style={styles.resourceCard}
              onPress={() => handleWebLink(resource.url, resource.title)}
              activeOpacity={0.8}
            >
              <View style={styles.resourceIcon}>{resource.icon}</View>
              <View style={styles.resourceContent}>
                <Text style={styles.resourceTitle}>{resource.title}</Text>
                <Text style={styles.resourceDescription}>{resource.description}</Text>
              </View>
              <ExternalLink size={16} color="#64748B" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Academic Stress Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📖 Academic Stress Support</Text>
          <View style={styles.academicCard}>
            <Text style={styles.academicTitle}>Dealing with Exam Pressure</Text>
            <View style={styles.academicTips}>
              <Text style={styles.academicTip}>• Break study sessions into 25-minute blocks</Text>
              <Text style={styles.academicTip}>• Remember: Your worth isn't defined by marks</Text>
              <Text style={styles.academicTip}>• Talk to parents about realistic expectations</Text>
              <Text style={styles.academicTip}>• Celebrate small achievements along the way</Text>
              <Text style={styles.academicTip}>• Get adequate sleep (7-9 hours nightly)</Text>
            </View>
          </View>
        </View>

        {/* Family Support Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>👨‍👩‍👧‍👦 Family Communication</Text>
          <View style={styles.familyCard}>
            <Text style={styles.familyTitle}>Talking to Indian Parents About Mental Health</Text>
            <View style={styles.familyTips}>
              <Text style={styles.familyTip}>• Choose a calm moment when they're not stressed</Text>
              <Text style={styles.familyTip}>• Use phrases like "I need support" instead of clinical terms</Text>
              <Text style={styles.familyTip}>• Share specific examples of how you're feeling</Text>
              <Text style={styles.familyTip}>• Explain that seeking help shows strength, not weakness</Text>
              <Text style={styles.familyTip}>• Consider involving a trusted relative or teacher</Text>
            </View>
          </View>
        </View>

        {/* Bottom Message */}
        <View style={styles.bottomMessage}>
          <Heart size={24} color="#F56565" />
          <Text style={styles.bottomText}>
            Remember: Seeking help is a sign of strength, not weakness. You deserve support, 
            understanding, and happiness. Every step towards better mental health is a victory.
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
  section: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  sectionDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
    marginBottom: 16,
  },
  emergencyCard: {
    flexDirection: 'row',
    backgroundColor: '#FEF2F2',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  emergencyIcon: {
    marginRight: 16,
  },
  emergencyContent: {
    flex: 1,
  },
  emergencyName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#991B1B',
    marginBottom: 4,
  },
  emergencyNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#DC2626',
    marginBottom: 4,
  },
  emergencyDescription: {
    fontSize: 14,
    color: '#7F1D1D',
  },
  strategyCard: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  strategyHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  strategyIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  strategyTitleContainer: {
    flex: 1,
  },
  strategyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  strategyCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: '#9F7AEA',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  strategyDescription: {
    fontSize: 16,
    color: '#64748B',
    lineHeight: 24,
  },
  resourceCard: {
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
  resourceIcon: {
    marginRight: 16,
  },
  resourceContent: {
    flex: 1,
  },
  resourceTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  resourceDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  academicCard: {
    backgroundColor: '#FFF7ED',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#FB923C',
  },
  academicTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#9A3412',
    marginBottom: 16,
  },
  academicTips: {
    marginLeft: 8,
  },
  academicTip: {
    fontSize: 16,
    color: '#9A3412',
    lineHeight: 24,
    marginBottom: 8,
  },
  familyCard: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    borderLeftWidth: 4,
    borderLeftColor: '#48BB78',
  },
  familyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 16,
  },
  familyTips: {
    marginLeft: 8,
  },
  familyTip: {
    fontSize: 16,
    color: '#166534',
    lineHeight: 24,
    marginBottom: 8,
  },
  bottomMessage: {
    flexDirection: 'row',
    backgroundColor: '#FDF2F8',
    padding: 20,
    borderRadius: 16,
    marginTop: 24,
    marginBottom: 30,
    alignItems: 'flex-start',
    borderLeftWidth: 4,
    borderLeftColor: '#F56565',
  },
  bottomText: {
    flex: 1,
    fontSize: 16,
    color: '#BE185D',
    lineHeight: 24,
    marginLeft: 12,
  },
});