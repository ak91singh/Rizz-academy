import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Animated, {
  FadeInRight,
  FadeOutLeft,
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { Button } from '../../src/components/Button';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Card } from '../../src/components/Card';
import { api } from '../../src/hooks/useApi';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

const { width } = Dimensions.get('window');

interface Question {
  id: number;
  question: string;
  options: { value: string; text: string }[];
}

interface Answer {
  question_id: number;
  answer: string;
}

export default function QuizScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const progress = useSharedValue(0);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
      return;
    }
    fetchQuestions();
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    progress.value = withTiming(((currentIndex + 1) / questions.length) * 100, {
      duration: 300,
    });
  }, [currentIndex, questions.length]);

  const fetchQuestions = async () => {
    try {
      const response = await api.get('/quiz/questions');
      setQuestions(response.data.questions);
    } catch (error) {
      console.error('Error fetching questions:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOptionSelect = (value: string) => {
    setSelectedOption(value);
  };

  const handleNext = async () => {
    if (!selectedOption) return;

    const newAnswers = [
      ...answers,
      { question_id: questions[currentIndex].id, answer: selectedOption },
    ];
    setAnswers(newAnswers);
    setSelectedOption(null);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Submit quiz
      setSubmitting(true);
      try {
        const response = await api.post('/quiz/submit', { answers: newAnswers });
        router.replace({
          pathname: '/quiz/results',
          params: { result: JSON.stringify(response.data) },
        });
      } catch (error) {
        console.error('Error submitting quiz:', error);
        setSubmitting(false);
      }
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      const previousAnswer = answers[currentIndex - 1];
      setSelectedOption(previousAnswer?.answer || null);
      setAnswers(answers.slice(0, -1));
    }
  };

  if (loading || authLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading quiz...</Text>
      </View>
    );
  }

  if (submitting) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Analyzing your personality...</Text>
      </View>
    );
  }

  const currentQuestion = questions[currentIndex];

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={handleBack} disabled={currentIndex === 0}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={currentIndex === 0 ? COLORS.textMuted : COLORS.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.questionCount}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <TouchableOpacity onPress={() => router.replace('/')}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
      </View>

      {/* Progress */}
      <View style={styles.progressContainer}>
        <ProgressBar
          progress={(currentIndex + 1) / questions.length * 100}
          showPercentage={false}
          height={6}
        />
      </View>

      {/* Question */}
      <Animated.View
        key={currentIndex}
        entering={FadeInRight.duration(300)}
        exiting={FadeOutLeft.duration(200)}
        style={styles.questionContainer}
      >
        <Text style={styles.questionText}>{currentQuestion?.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQuestion?.options.map((option, index) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.optionButton,
                selectedOption === option.value && styles.optionButtonSelected,
              ]}
              onPress={() => handleOptionSelect(option.value)}
              activeOpacity={0.8}
            >
              <View
                style={[
                  styles.optionIndicator,
                  selectedOption === option.value && styles.optionIndicatorSelected,
                ]}
              >
                <Text
                  style={[
                    styles.optionLetter,
                    selectedOption === option.value && styles.optionLetterSelected,
                  ]}
                >
                  {option.value}
                </Text>
              </View>
              <Text
                style={[
                  styles.optionText,
                  selectedOption === option.value && styles.optionTextSelected,
                ]}
              >
                {option.text}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Animated.View>

      {/* Next Button */}
      <View style={styles.footer}>
        <Button
          title={currentIndex === questions.length - 1 ? 'See My Results' : 'Next'}
          onPress={handleNext}
          disabled={!selectedOption}
          size="large"
          style={styles.nextButton}
          icon={
            <Ionicons
              name={currentIndex === questions.length - 1 ? 'sparkles' : 'arrow-forward'}
              size={20}
              color={selectedOption ? COLORS.background : COLORS.textMuted}
            />
          }
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    fontSize: FONT_SIZES.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  questionCount: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    fontWeight: '600',
  },
  progressContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.xl,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: SPACING.lg,
  },
  questionText: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.xl * 1.4,
    marginBottom: SPACING.xl,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  optionButtonSelected: {
    borderColor: COLORS.gold,
    backgroundColor: `${COLORS.gold}15`,
  },
  optionIndicator: {
    width: 36,
    height: 36,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  optionIndicatorSelected: {
    backgroundColor: COLORS.gold,
  },
  optionLetter: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textSecondary,
  },
  optionLetterSelected: {
    color: COLORS.background,
  },
  optionText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.4,
  },
  optionTextSelected: {
    color: COLORS.gold,
  },
  footer: {
    padding: SPACING.lg,
  },
  nextButton: {
    width: '100%',
  },
});
