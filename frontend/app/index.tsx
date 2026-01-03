import React, { useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../src/components/Button';
import { Card } from '../src/components/Card';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';

const { width } = Dimensions.get('window');

const STATS = [
  { number: '10K+', label: 'Active Users' },
  { number: '85%', label: 'Success Rate' },
  { number: '50K+', label: 'Conversations' },
];

const FEATURES = [
  {
    icon: 'analytics-outline' as const,
    title: 'Personality Quiz',
    description: 'Discover your unique attraction archetype',
  },
  {
    icon: 'chatbubbles-outline' as const,
    title: 'AI Chat Practice',
    description: 'Master conversations with realistic simulations',
  },
  {
    icon: 'fitness-outline' as const,
    title: 'Daily Habits',
    description: 'Build confidence through journaling & affirmations',
  },
  {
    icon: 'trophy-outline' as const,
    title: 'Gamified Progress',
    description: 'Track XP, streaks, and level up your skills',
  },
];

export default function LandingScreen() {
  const router = useRouter();
  const { isAuthenticated, isLoading, login } = useAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/(tabs)/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.gold} />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  const handleTakeQuiz = () => {
    login();
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Section */}
        <View style={styles.heroSection}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>For Indian Men</Text>
          </View>
          
          <Text style={styles.heroTitle}>
            From <Text style={styles.heroHighlight}>Invisible</Text>
          </Text>
          <Text style={styles.heroTitle}>
            to <Text style={styles.heroHighlight}>Irresistible</Text>
          </Text>
          
          <Text style={styles.heroSubtitle}>
            Master the art of conversation, build unshakeable confidence, and
            become the man women naturally gravitate towards.
          </Text>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            {STATS.map((stat, index) => (
              <View key={index} style={styles.statItem}>
                <Text style={styles.statNumber}>{stat.number}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>

          {/* CTA Button */}
          <Button
            title="Take the Quiz"
            onPress={handleTakeQuiz}
            size="large"
            style={styles.ctaButton}
            icon={<Ionicons name="arrow-forward" size={20} color={COLORS.background} />}
          />
          
          <Text style={styles.ctaSubtext}>
            Discover your Attraction Archetype in 2 minutes
          </Text>
        </View>

        {/* Features Section */}
        <View style={styles.featuresSection}>
          <Text style={styles.sectionTitle}>What You'll Master</Text>
          
          <View style={styles.featuresGrid}>
            {FEATURES.map((feature, index) => (
              <Card key={index} style={styles.featureCard} variant="bordered">
                <View style={styles.featureIconContainer}>
                  <Ionicons name={feature.icon} size={28} color={COLORS.gold} />
                </View>
                <Text style={styles.featureTitle}>{feature.title}</Text>
                <Text style={styles.featureDescription}>{feature.description}</Text>
              </Card>
            ))}
          </View>
        </View>

        {/* Social Proof */}
        <View style={styles.socialProof}>
          <Text style={styles.socialProofText}>
            "Finally, a program that actually understands the unique challenges
            Indian men face in dating."
          </Text>
          <Text style={styles.socialProofAuthor}>- Rahul, 28, Mumbai</Text>
        </View>

        {/* Bottom CTA */}
        <View style={styles.bottomCta}>
          <Button
            title="Start Your Transformation"
            onPress={handleTakeQuiz}
            variant="secondary"
            size="large"
            style={styles.bottomCtaButton}
          />
        </View>
      </ScrollView>
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
  scrollContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  heroSection: {
    paddingTop: SPACING.xl,
    alignItems: 'center',
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.lg,
    gap: SPACING.xs,
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  heroTitle: {
    fontSize: FONT_SIZES.hero,
    fontWeight: '800',
    color: COLORS.textPrimary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.hero * 1.1,
  },
  heroHighlight: {
    color: COLORS.gold,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.lg,
    lineHeight: FONT_SIZES.md * 1.6,
    maxWidth: 320,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginTop: SPACING.xl,
    marginBottom: SPACING.xl,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '700',
    color: COLORS.gold,
  },
  statLabel: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  ctaButton: {
    width: '100%',
    maxWidth: 300,
  },
  ctaSubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.md,
  },
  featuresSection: {
    marginTop: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  featureCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    alignItems: 'center',
    paddingVertical: SPACING.lg,
  },
  featureIconContainer: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.gold}15`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  featureTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  featureDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: FONT_SIZES.xs * 1.5,
  },
  socialProof: {
    marginTop: SPACING.xxl,
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  socialProofText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.md * 1.6,
  },
  socialProofAuthor: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    marginTop: SPACING.md,
    fontWeight: '600',
  },
  bottomCta: {
    marginTop: SPACING.xxl,
    alignItems: 'center',
  },
  bottomCtaButton: {
    width: '100%',
  },
});
