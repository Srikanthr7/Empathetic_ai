import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Play, Pause, RotateCcw, Wind, Heart, Zap } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';

interface BreathingExercise {
  name: string;
  description: string;
  inhale: number;
  hold: number;
  exhale: number;
  cycles: number;
  icon: React.ReactNode;
  color: string;
}

const exercises: BreathingExercise[] = [
  {
    name: '4-7-8 Technique',
    description: 'Perfect for anxiety relief and falling asleep',
    inhale: 4,
    hold: 7,
    exhale: 8,
    cycles: 4,
    icon: <Wind size={24} color="#63B3ED" />,
    color: '#63B3ED',
  },
  {
    name: 'Box Breathing',
    description: 'Used by Navy SEALs for focus and calm',
    inhale: 4,
    hold: 4,
    exhale: 4,
    cycles: 6,
    icon: <Heart size={24} color="#48BB78" />,
    color: '#48BB78',
  },
  {
    name: 'Energizing Breath',
    description: 'Quick technique to boost energy and focus',
    inhale: 3,
    hold: 2,
    exhale: 3,
    cycles: 8,
    icon: <Zap size={24} color="#F56565" />,
    color: '#F56565',
  },
];

export default function BreathingScreen() {
  const [selectedExercise, setSelectedExercise] = useState<BreathingExercise>(exercises[0]);
  const [isActive, setIsActive] = useState(false);
  const [currentPhase, setCurrentPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [currentCycle, setCurrentCycle] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);

  // Animation values
  const breathingScale = useSharedValue(1);
  const breathingOpacity = useSharedValue(0.7);
  const ringScale = useSharedValue(1);
  const textOpacity = useSharedValue(1);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (isActive && currentCycle < selectedExercise.cycles) {
      const phases = [
        { name: 'inhale' as const, duration: selectedExercise.inhale },
        { name: 'hold' as const, duration: selectedExercise.hold },
        { name: 'exhale' as const, duration: selectedExercise.exhale },
      ];
      
      let phaseIndex = phases.findIndex(p => p.name === currentPhase);
      let timeLeft = timeRemaining || phases[phaseIndex].duration;
      
      interval = setInterval(() => {
        timeLeft -= 1;
        setTimeRemaining(timeLeft);
        
        if (timeLeft <= 0) {
          phaseIndex = (phaseIndex + 1) % phases.length;
          
          if (phaseIndex === 0) {
            setCurrentCycle(prev => prev + 1);
          }
          
          setCurrentPhase(phases[phaseIndex].name);
          setTimeRemaining(phases[phaseIndex].duration);
          
          // Haptic feedback on phase change
          if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          }
        }
      }, 1000);
    } else if (currentCycle >= selectedExercise.cycles) {
      setIsActive(false);
      setCurrentCycle(0);
      setCurrentPhase('inhale');
      setTimeRemaining(0);
    }
    
    return () => clearInterval(interval);
  }, [isActive, currentPhase, currentCycle, timeRemaining, selectedExercise]);

  // Breathing animation
  useEffect(() => {
    if (isActive) {
      const duration = currentPhase === 'inhale' ? selectedExercise.inhale * 1000 :
                      currentPhase === 'hold' ? selectedExercise.hold * 1000 :
                      selectedExercise.exhale * 1000;
      
      if (currentPhase === 'inhale') {
        breathingScale.value = withTiming(1.4, {
          duration,
          easing: Easing.inOut(Easing.ease),
        });
        breathingOpacity.value = withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        });
      } else if (currentPhase === 'exhale') {
        breathingScale.value = withTiming(1, {
          duration,
          easing: Easing.inOut(Easing.ease),
        });
        breathingOpacity.value = withTiming(0.7, {
          duration,
          easing: Easing.inOut(Easing.ease),
        });
      }
      
      // Ring pulse animation
      ringScale.value = withRepeat(
        withSequence(
          withTiming(1.1, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        false
      );
    } else {
      breathingScale.value = withTiming(1);
      breathingOpacity.value = withTiming(0.7);
      ringScale.value = withTiming(1);
    }
  }, [isActive, currentPhase, selectedExercise]);

  const startExercise = () => {
    setIsActive(true);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(selectedExercise.inhale);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const pauseExercise = () => {
    setIsActive(false);
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
  };

  const resetExercise = () => {
    setIsActive(false);
    setCurrentCycle(0);
    setCurrentPhase('inhale');
    setTimeRemaining(0);
    
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }
  };

  const breathingAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: breathingScale.value }],
    opacity: breathingOpacity.value,
  }));

  const ringAnimatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: ringScale.value }],
  }));

  const getPhaseInstruction = () => {
    switch (currentPhase) {
      case 'inhale':
        return 'Breathe In';
      case 'hold':
        return 'Hold';
      case 'exhale':
        return 'Breathe Out';
      default:
        return 'Get Ready';
    }
  };

  const getPhaseColor = () => {
    switch (currentPhase) {
      case 'inhale':
        return '#48BB78';
      case 'hold':
        return '#ED8936';
      case 'exhale':
        return '#63B3ED';
      default:
        return selectedExercise.color;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#9F7AEA', '#63B3ED']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.header}
      >
        <Text style={styles.headerTitle}>Breathing Exercises</Text>
        <Text style={styles.headerSubtitle}>Find your calm through mindful breathing</Text>
      </LinearGradient>

      <View style={styles.content}>
        {/* Exercise Selection */}
        <View style={styles.exerciseSelection}>
          <Text style={styles.sectionTitle}>Choose Your Exercise</Text>
          {exercises.map((exercise, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.exerciseCard,
                selectedExercise.name === exercise.name && styles.exerciseCardSelected
              ]}
              onPress={() => {
                setSelectedExercise(exercise);
                resetExercise();
              }}
              activeOpacity={0.8}
            >
              <View style={styles.exerciseIcon}>{exercise.icon}</View>
              <View style={styles.exerciseContent}>
                <Text style={styles.exerciseName}>{exercise.name}</Text>
                <Text style={styles.exerciseDescription}>{exercise.description}</Text>
                <Text style={styles.exercisePattern}>
                  {exercise.inhale}s in • {exercise.hold}s hold • {exercise.exhale}s out • {exercise.cycles} cycles
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Breathing Animation */}
        <View style={styles.breathingContainer}>
          <Animated.View style={[styles.breathingRing, ringAnimatedStyle]}>
            <View style={[styles.breathingRingInner, { borderColor: selectedExercise.color }]} />
          </Animated.View>
          
          <Animated.View style={[styles.breathingCircle, breathingAnimatedStyle]}>
            <LinearGradient
              colors={[selectedExercise.color, `${selectedExercise.color}80`]}
              style={styles.breathingGradient}
            />
          </Animated.View>

          <View style={styles.breathingText}>
            <Text style={[styles.phaseText, { color: getPhaseColor() }]}>
              {getPhaseInstruction()}
            </Text>
            {isActive && (
              <Text style={styles.timerText}>{timeRemaining}</Text>
            )}
            {isActive && (
              <Text style={styles.cycleText}>
                Cycle {currentCycle + 1} of {selectedExercise.cycles}
              </Text>
            )}
          </View>
        </View>

        {/* Controls */}
        <View style={styles.controls}>
          {!isActive ? (
            <TouchableOpacity
              style={[styles.controlButton, styles.playButton]}
              onPress={startExercise}
              activeOpacity={0.8}
            >
              <Play size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Start</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.controlButton, styles.pauseButton]}
              onPress={pauseExercise}
              activeOpacity={0.8}
            >
              <Pause size={24} color="#FFFFFF" />
              <Text style={styles.controlButtonText}>Pause</Text>
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={[styles.controlButton, styles.resetButton]}
            onPress={resetExercise}
            activeOpacity={0.8}
          >
            <RotateCcw size={20} color="#64748B" />
            <Text style={[styles.controlButtonText, styles.resetButtonText]}>Reset</Text>
          </TouchableOpacity>
        </View>

        {/* Tips */}
        <View style={styles.tipsContainer}>
          <Text style={styles.tipsTitle}>💡 Breathing Tips</Text>
          <View style={styles.tipsList}>
            <Text style={styles.tip}>• Find a comfortable, quiet space</Text>
            <Text style={styles.tip}>• Place one hand on chest, one on belly</Text>
            <Text style={styles.tip}>• Focus on your belly rising and falling</Text>
            <Text style={styles.tip}>• If your mind wanders, gently return focus to breath</Text>
            <Text style={styles.tip}>• Practice regularly for best results</Text>
          </View>
        </View>
      </View>
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
  exerciseSelection: {
    marginTop: 24,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 16,
  },
  exerciseCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
    elevation: 2,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  exerciseCardSelected: {
    borderColor: '#9F7AEA',
    backgroundColor: '#F7FAFC',
  },
  exerciseIcon: {
    marginRight: 16,
    marginTop: 4,
  },
  exerciseContent: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 4,
  },
  exerciseDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 8,
    lineHeight: 20,
  },
  exercisePattern: {
    fontSize: 12,
    color: '#9F7AEA',
    fontWeight: '600',
  },
  breathingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 40,
    height: 300,
    position: 'relative',
  },
  breathingRing: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
  },
  breathingRingInner: {
    width: '100%',
    height: '100%',
    borderRadius: 100,
    borderWidth: 2,
    opacity: 0.3,
  },
  breathingCircle: {
    width: 150,
    height: 150,
    borderRadius: 75,
    overflow: 'hidden',
  },
  breathingGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
  },
  breathingText: {
    position: 'absolute',
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  timerText: {
    fontSize: 48,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 8,
  },
  cycleText: {
    fontSize: 16,
    color: '#64748B',
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
  },
  controlButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
    marginHorizontal: 8,
    elevation: 4,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  playButton: {
    backgroundColor: '#48BB78',
  },
  pauseButton: {
    backgroundColor: '#ED8936',
  },
  resetButton: {
    backgroundColor: '#FFFFFF',
    borderWidth: 2,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowOpacity: 0.1,
  },
  controlButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  resetButtonText: {
    color: '#64748B',
  },
  tipsContainer: {
    backgroundColor: '#F0FDF4',
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#48BB78',
  },
  tipsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#166534',
    marginBottom: 12,
  },
  tipsList: {
    marginLeft: 8,
  },
  tip: {
    fontSize: 16,
    color: '#166534',
    lineHeight: 24,
    marginBottom: 6,
  },
});