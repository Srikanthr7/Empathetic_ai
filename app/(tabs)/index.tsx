import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mic, MicOff, Heart, Shield, Users, BookOpen, Phone, Wind, Sparkles } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withSequence,
  withRepeat,
  withTiming,
  Easing
} from 'react-native-reanimated';

export default function HomeScreen() {
  const [isListening, setIsListening] = useState(false);
  const [greeting, setGreeting] = useState('');
  const scaleAnimation = useSharedValue(1);
  const pulseAnimation = useSharedValue(1);
  const glowAnimation = useSharedValue(0);

  useEffect(() => {
    const hour = new Date().getHours();
    if (hour < 12) {
      setGreeting('Good Morning');
    } else if (hour < 17) {
      setGreeting('Good Afternoon');
    } else {
      setGreeting('Good Evening');
    }
  }, []);

  const toggleListening = async () => {
    if (Platform.OS !== 'web') {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
    
    if (isListening) {
      setIsListening(false);
      pulseAnimation.value = 1;
      glowAnimation.value = withTiming(0, { duration: 300 });
      Speech.speak("I'm here to listen whenever you need me.", { 
        language: 'en-IN',
        pitch: 1.1,
        rate: 0.9 
      });
    } else {
      setIsListening(true);
      pulseAnimation.value = withRepeat(
        withSequence(
          withSpring(1.2),
          withSpring(1)
        ),
        -1,
        false
      );
      glowAnimation.value = withRepeat(
        withTiming(1, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
        -1,
        true
      );
      Speech.speak("I'm listening. Share what's on your mind.", { 
        language: 'en-IN',
        pitch: 1.1,
        rate: 0.9 
      });
    }
  };

  const handleEmergency = () => {
    Alert.alert(
      'Emergency Support',
      'If you\'re in crisis, please reach out:\n\n• AASRA Helpline: 91-22-27546669\n• Vandrevala Foundation: 1860-2662-345\n• Or contact a trusted adult immediately',
      [
        { text: 'Call Now', onPress: () => {} },
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const animatedMicStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: scaleAnimation.value },
      { scale: pulseAnimation.value }
    ],
    shadowOpacity: 0.3 + (glowAnimation.value * 0.4),
    elevation: 8 + (glowAnimation.value * 8),
  }));

  const features = [
    {
      icon: <Heart size={24} color="#F56565" />,
      title: 'Safe Space',
      description: 'Share your feelings without judgment'
    },
    {
      icon: <Shield size={24} color="#63B3ED" />,
      title: 'Complete Privacy',
      description: 'Your conversations are completely anonymous'
    },
    {
      icon: <Wind size={24} color="#48BB78" />,
      title: 'Breathing Exercises',
      description: 'Guided breathing techniques for instant calm'
    },
    {
      icon: <Users size={24} color="#9F7AEA" />,
      title: 'Cultural Understanding',
      description: 'Designed for Indian teenage experiences'
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#9F7AEA', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <Text style={styles.greeting}>{greeting}!</Text>
          <Text style={styles.subtitle}>
            I'm here to support you through anything you're going through.
          </Text>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.voiceSection}>
          <Text style={styles.sectionTitle}>Talk to Me</Text>
          <Text style={styles.sectionDescription}>
            Press and hold to share what's on your mind. I'm here to listen with empathy and understanding.
          </Text>
          
          <View style={styles.breathingRings}>
            {[1, 2, 3].map((ring) => (
              <Animated.View
                key={ring}
                style={[
                  styles.breathingRing,
                  {
                    opacity: isListening ? 0.3 - (ring * 0.1) : 0,
                    transform: [
                      { scale: isListening ? 1 + (ring * 0.2) : 1 }
                    ]
                  }
                ]}
              />
            ))}
          </View>
          
          <Animated.View style={[styles.micContainer, animatedMicStyle]}>
            <TouchableOpacity
              style={[styles.micButton, isListening && styles.micButtonActive]}
              onPress={toggleListening}
              activeOpacity={0.8}
            >
              {isListening ? (
                <MicOff size={32} color="#FFFFFF" />
              ) : (
                <Mic size={32} color="#FFFFFF" />
              )}
              {isListening && (
                <View style={styles.listeningIndicator}>
                  <Sparkles size={16} color="#FFFFFF" />
                </View>
              )}
            </TouchableOpacity>
          </Animated.View>
          
          <Text style={styles.micText}>
            {isListening ? 'I\'m listening...' : 'Tap to start talking'}
          </Text>
        </View>

        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>Why Trust Me?</Text>
          {features.map((feature, index) => (
            <View key={index} style={styles.featureCard}>
              <View style={styles.featureIcon}>{feature.icon}</View>
              <View style={styles.featureContent}>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </View>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergency}>
          <Phone size={20} color="#FFFFFF" />
          <Text style={styles.emergencyText}>Emergency Help</Text>
        </TouchableOpacity>

        <View style={styles.supportMessage}>
          <Text style={styles.supportText}>
            Remember: You are not alone. Every feeling you have is valid, and seeking support shows incredible strength. 
            I'm here 24/7 to listen, understand, and help you navigate through difficult times.
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
  headerContent: {
    marginTop: 10,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#E2E8F0',
    lineHeight: 24,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
  },
  voiceSection: {
    alignItems: 'center',
    paddingVertical: 30,
    position: 'relative',
  },
  sectionTitle: {
    fontSize: 24,
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
    marginBottom: 30,
  },
  breathingRings: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginTop: -50,
    marginLeft: -50,
  },
  breathingRing: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 2,
    borderColor: '#9F7AEA',
  },
  micContainer: {
    alignItems: 'center',
    marginBottom: 20,
    position: 'relative',
  },
  micButton: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#9F7AEA',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  micButtonActive: {
    backgroundColor: '#F56565',
    shadowColor: '#F56565',
  },
  listeningIndicator: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#48BB78',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  micText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  featuresSection: {
    marginTop: 20,
    marginBottom: 30,
  },
  featureCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  featureIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#64748B',
    lineHeight: 20,
  },
  emergencyButton: {
    flexDirection: 'row',
    backgroundColor: '#F56565',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    elevation: 4,
    shadowColor: '#F56565',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  emergencyText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  supportMessage: {
    backgroundColor: '#E6FFFA',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#48BB78',
  },
  supportText: {
    fontSize: 16,
    color: '#2D3748',
    lineHeight: 24,
    textAlign: 'center',
  },
});