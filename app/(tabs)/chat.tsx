import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Send, Mic, Bot, User as UserIcon, Sparkles } from 'lucide-react-native';
import * as Speech from 'expo-speech';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withSequence,
  withDelay,
} from 'react-native-reanimated';

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
}

export default function ChatScreen() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const messageScale = useSharedValue(0);

  useEffect(() => {
    loadChatHistory();
    // Welcome message
    setTimeout(() => {
      addAIMessage("Namaste! I'm here to listen and support you. What's on your mind today? 💙");
    }, 1000);
  }, []);

  const loadChatHistory = async () => {
    try {
      const history = await AsyncStorage.getItem('chatHistory');
      if (history) {
        const parsedHistory = JSON.parse(history).map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(parsedHistory.slice(-50)); // Keep last 50 messages
      }
    } catch (error) {
      console.log('Error loading chat history:', error);
    }
  };

  const saveChatHistory = async (newMessages: Message[]) => {
    try {
      await AsyncStorage.setItem('chatHistory', JSON.stringify(newMessages));
    } catch (error) {
      console.log('Error saving chat history:', error);
    }
  };

  const addMessage = (text: string, isUser: boolean) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      text,
      isUser,
      timestamp: new Date(),
    };

    const updatedMessages = [...messages, newMessage];
    setMessages(updatedMessages);
    saveChatHistory(updatedMessages);
    
    // Animate new message
    messageScale.value = 0;
    messageScale.value = withDelay(100, withSpring(1, { damping: 15, stiffness: 200 }));
    
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);

    return newMessage;
  };

  const addAIMessage = (text: string) => {
    addMessage(text, false);
    Speech.speak(text, { 
      language: 'en-IN',
      pitch: 1.1,
      rate: 0.9 
    });
  };

  const generateAIResponse = (userMessage: string): string => {
    const lowerMessage = userMessage.toLowerCase();
    
    // Crisis detection keywords
    const crisisKeywords = ['suicide', 'kill myself', 'end it all', 'want to die', 'hurt myself'];
    if (crisisKeywords.some(keyword => lowerMessage.includes(keyword))) {
      return "I'm really concerned about you right now. Your life has value and you deserve support. Please reach out to AASRA at 91-22-27546669 or talk to a trusted adult immediately. I'm here with you, and you don't have to face this alone. 🫂";
    }

    // Academic stress
    if (lowerMessage.includes('exam') || lowerMessage.includes('study') || lowerMessage.includes('marks') || lowerMessage.includes('pressure')) {
      return "Academic pressure can feel overwhelming, especially with family expectations. Remember, your worth isn't defined by marks alone. Take breaks, practice deep breathing, and talk to someone you trust. What specific part of studying is stressing you the most? 📚💙";
    }

    // Family issues
    if (lowerMessage.includes('parents') || lowerMessage.includes('family') || lowerMessage.includes('fight')) {
      return "Family conflicts are really tough, especially when you feel misunderstood. It's natural to feel frustrated when generations see things differently. Your feelings are valid. Sometimes, small conversations can help bridge gaps. Would you like to talk about what happened? 🏠💙";
    }

    // Loneliness
    if (lowerMessage.includes('lonely') || lowerMessage.includes('alone') || lowerMessage.includes('friends')) {
      return "Feeling lonely is painful, and I want you to know that you're not actually alone - I'm here, and there are people who care about you. Building connections takes time, but you're worthy of friendship and love. What makes you feel most isolated? 🤗";
    }

    // Anxiety
    if (lowerMessage.includes('anxious') || lowerMessage.includes('worried') || lowerMessage.includes('scared')) {
      return "Anxiety can feel overwhelming, like your heart is racing and thoughts are spinning. Try the 5-4-3-2-1 technique: name 5 things you see, 4 you can touch, 3 you hear, 2 you smell, and 1 you taste. This helps ground you in the present moment. What's making you feel most anxious? 🌸";
    }

    // General responses
    const responses = [
      "I hear you, and I want you to know that what you're feeling is completely valid. Can you tell me more about what's going on? 💙",
      "It sounds like you're going through something difficult right now. I'm here to listen without any judgment. What's weighing on your heart? 🫂",
      "Thank you for trusting me with your feelings. You're showing real courage by reaching out. What would feel most helpful for you right now? 💚",
      "I can sense this is important to you. Your feelings matter, and I want to understand better. Can you help me see this from your perspective? 🌟",
      "That sounds really challenging. It takes strength to share these feelings. What support do you need most right now? 💙"
    ];

    return responses[Math.floor(Math.random() * responses.length)];
  };

  const animatedMessageStyle = useAnimatedStyle(() => ({
    transform: [{ scale: messageScale.value }],
  }));
  const sendMessage = async () => {
    if (!inputText.trim()) return;

    const userMessage = inputText.trim();
    setInputText('');
    addMessage(userMessage, true);

    // Show typing indicator
    setIsTyping(true);
    
    setTimeout(() => {
      setIsTyping(false);
      const aiResponse = generateAIResponse(userMessage);
      addAIMessage(aiResponse);
    }, 1500 + Math.random() * 1000); // Realistic typing delay
  };

  const handleVoiceInput = () => {
    // Placeholder for voice input functionality
    Speech.speak("Voice input feature coming soon! For now, you can type your message.", {
      language: 'en-IN'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Your Safe Space</Text>
        <Text style={styles.headerSubtitle}>Private & Confidential</Text>
      </View>

      <KeyboardAvoidingView 
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={90}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map((message) => (
            <Animated.View
              key={message.id}
              style={[
                styles.messageWrapper,
                message.isUser ? styles.userMessageWrapper : styles.aiMessageWrapper,
                animatedMessageStyle,
              ]}
            >
              <View style={styles.messageHeader}>
                {message.isUser ? (
                  <UserIcon size={16} color="#9F7AEA" />
                ) : (
                  <View style={styles.aiIconContainer}>
                    <Bot size={16} color="#63B3ED" />
                    <Sparkles size={10} color="#63B3ED" style={styles.aiSparkle} />
                  </View>
                )}
                <Text style={styles.messageLabel}>
                  {message.isUser ? 'You' : 'AI Companion'}
                </Text>
              </View>
              <View
                style={[
                  styles.messageBubble,
                  message.isUser ? styles.userMessage : styles.aiMessage,
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    message.isUser ? styles.userMessageText : styles.aiMessageText,
                  ]}
                >
                  {message.text}
                </Text>
              </View>
            </Animated.View>
          ))}
          
          {isTyping && (
            <View style={styles.typingWrapper}>
              <View style={styles.messageHeader}>
                <View style={styles.aiIconContainer}>
                  <Bot size={16} color="#63B3ED" />
                  <Sparkles size={10} color="#63B3ED" style={styles.aiSparkle} />
                </View>
                <Text style={styles.messageLabel}>AI Companion</Text>
              </View>
              <View style={styles.typingBubble}>
                <View style={styles.typingDots}>
                  <View style={[styles.typingDot, styles.typingDot1]} />
                  <View style={[styles.typingDot, styles.typingDot2]} />
                  <View style={[styles.typingDot, styles.typingDot3]} />
                </View>
              </View>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Share what's on your mind..."
              placeholderTextColor="#94A3B8"
              multiline
              maxLength={500}
              onSubmitEditing={sendMessage}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.voiceButton}
                onPress={handleVoiceInput}
                activeOpacity={0.7}
              >
                <Mic size={20} color="#64748B" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.sendButton, !inputText.trim() && styles.sendButtonDisabled]}
                onPress={sendMessage}
                disabled={!inputText.trim()}
                activeOpacity={0.8}
              >
                <Send size={18} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2D3748',
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 20,
    paddingBottom: 20,
  },
  messageWrapper: {
    marginBottom: 20,
  },
  userMessageWrapper: {
    alignItems: 'flex-end',
  },
  aiMessageWrapper: {
    alignItems: 'flex-start',
  },
  messageHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    paddingHorizontal: 4,
  },
  messageLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 6,
  },
  aiIconContainer: {
    position: 'relative',
  },
  aiSparkle: {
    position: 'absolute',
    top: -2,
    right: -2,
  },
  messageBubble: {
    maxWidth: '85%',
    padding: 16,
    borderRadius: 20,
  },
  userMessage: {
    backgroundColor: '#9F7AEA',
    borderBottomRightRadius: 6,
  },
  aiMessage: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 6,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userMessageText: {
    color: '#FFFFFF',
  },
  aiMessageText: {
    color: '#2D3748',
  },
  typingWrapper: {
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  typingBubble: {
    backgroundColor: '#E2E8F0',
    padding: 16,
    borderRadius: 20,
    borderBottomLeftRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 50,
  },
  typingDots: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
    marginHorizontal: 2,
  },
  typingDot1: {
    opacity: 0.4,
  },
  typingDot2: {
    opacity: 0.7,
  },
  typingDot3: {
    opacity: 1,
  },
  inputContainer: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 48,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    color: '#2D3748',
    maxHeight: 100,
    paddingVertical: 8,
  },
  inputActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
  },
  voiceButton: {
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    backgroundColor: '#9F7AEA',
    padding: 10,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#9F7AEA',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  sendButtonDisabled: {
    backgroundColor: '#CBD5E0',
    elevation: 0,
    shadowOpacity: 0,
  },
});