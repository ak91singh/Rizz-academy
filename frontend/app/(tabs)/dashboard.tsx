import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { StatCard } from '../../src/components/StatCard';
import { ProgressBar } from '../../src/components/ProgressBar';
import { Button } from '../../src/components/Button';
import { api } from '../../src/hooks/useApi';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

interface Progress {
  xp: number;
  level: number;
  streak_days: number;
  completed_modules: string[];
}

interface QuizResult {
  archetype_title: string;
  archetype: string;
}

export default function DashboardScreen() {
  const router = useRouter();
  const { user, isLoading: authLoading, isAuthenticated } = useAuth();
  const [progress, setProgress] = useState<Progress | null>(null);
  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.replace('/');
      return;
    }
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated, authLoading]);

  const fetchData = async () => {
    try {
      const [progressRes, quizRes] = await Promise.all([
        api.get('/user/progress'),
        api.get('/quiz/result'),
      ]);
      setProgress(progressRes.data);
      if (quizRes.data) {
        setQuizResult(quizRes.data);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const xpForNextLevel = (progress?.level || 1) * 500;
  const currentLevelXp = progress?.xp ? progress.xp % 500 : 0;
  const xpProgress = (currentLevelXp / 500) * 100;

  const modules = [
    {
      id: 'foundation',
      title: 'Foundation Protocol',
      description: 'Build your core confidence through journaling & affirmations',
      icon: 'book-outline' as const,
      color: COLORS.gold,
      route: '/(tabs)/foundation',
    },
    {
      id: 'combat',
      title: 'Conversation Combat',
      description: 'Practice real conversations with AI-powered simulations',
      icon: 'chatbubbles-outline' as const,
      color: COLORS.orange,
      route: '/(tabs)/combat',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
          />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greeting}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.name?.split(' ')[0] || 'King'}</Text>
          </View>
          {quizResult && (
            <View style={styles.archetypeBadge}>
              <Ionicons name="sparkles" size={14} color={COLORS.gold} />
              <Text style={styles.archetypeText}>{quizResult.archetype_title}</Text>
            </View>
          )}
        </View>

        {/* XP Progress Card */}
        <Card style={styles.xpCard} variant="elevated">
          <View style={styles.xpHeader}>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>LVL {progress?.level || 1}</Text>
            </View>
            <Text style={styles.xpText}>
              {progress?.xp || 0} XP
            </Text>
          </View>
          <ProgressBar
            progress={xpProgress}
            label="Progress to next level"
            showPercentage={false}
            height={10}
          />
          <Text style={styles.xpSubtext}>
            {500 - currentLevelXp} XP to Level {(progress?.level || 1) + 1}
          </Text>
        </Card>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            icon="flame"
            value={progress?.streak_days || 0}
            label="Day Streak"
            color={COLORS.orange}
          />
          <StatCard
            icon="trophy"
            value={progress?.level || 1}
            label="Level"
            color={COLORS.gold}
          />
          <StatCard
            icon="star"
            value={progress?.xp || 0}
            label="Total XP"
            color={COLORS.success}
          />
        </View>

        {/* Modules Section */}
        <View style={styles.modulesSection}>
          <Text style={styles.sectionTitle}>Your Modules</Text>
          
          {!quizResult && (
            <TouchableOpacity
              style={styles.quizPrompt}
              onPress={() => router.push('/quiz')}
            >
              <View style={styles.quizPromptContent}>
                <Ionicons name="help-circle" size={24} color={COLORS.gold} />
                <View style={styles.quizPromptText}>
                  <Text style={styles.quizPromptTitle}>Take the Quiz First</Text>
                  <Text style={styles.quizPromptSubtitle}>
                    Discover your archetype to unlock personalized content
                  </Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.gold} />
            </TouchableOpacity>
          )}

          {modules.map((module) => (
            <TouchableOpacity
              key={module.id}
              style={styles.moduleCard}
              onPress={() => router.push(module.route as any)}
              activeOpacity={0.8}
            >
              <View style={[styles.moduleIcon, { backgroundColor: `${module.color}20` }]}>
                <Ionicons name={module.icon} size={28} color={module.color} />
              </View>
              <View style={styles.moduleContent}>
                <Text style={styles.moduleTitle}>{module.title}</Text>
                <Text style={styles.moduleDescription}>{module.description}</Text>
              </View>
              <Ionicons name="chevron-forward" size={24} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Daily Tip */}
        <Card style={styles.tipCard}>
          <View style={styles.tipHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.gold} />
            <Text style={styles.tipTitle}>Daily Tip</Text>
          </View>
          <Text style={styles.tipText}>
            "Confidence isn't about being perfect—it's about being comfortable with imperfection.
            Own your quirks. They make you memorable."
          </Text>
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.lg,
  },
  greeting: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
  },
  userName: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  archetypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  archetypeText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  xpCard: {
    marginBottom: SPACING.lg,
    padding: SPACING.lg,
  },
  xpHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  levelBadge: {
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.md,
  },
  levelText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '700',
    color: COLORS.background,
  },
  xpText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
  },
  xpSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  statsRow: {
    flexDirection: 'row',
    gap: SPACING.md,
    marginBottom: SPACING.xl,
  },
  modulesSection: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  quizPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.gold}15`,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  quizPromptContent: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  quizPromptText: {
    flex: 1,
  },
  quizPromptTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  quizPromptSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  moduleCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  moduleIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  moduleContent: {
    flex: 1,
  },
  moduleTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  moduleDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.xs * 1.4,
  },
  tipCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  tipHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  tipTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  tipText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.sm * 1.6,
  },
});
