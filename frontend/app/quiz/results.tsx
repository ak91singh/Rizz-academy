import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/Button';
import { Card } from '../../src/components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

interface QuizResult {
  archetype: string;
  archetype_title: string;
  archetype_description: string;
  strengths: string[];
  areas_to_improve: string[];
  recommended_modules: string[];
}

export default function ResultsScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [result, setResult] = useState<QuizResult | null>(null);

  useEffect(() => {
    if (params.result) {
      try {
        setResult(JSON.parse(params.result as string));
      } catch (e) {
        console.error('Error parsing result:', e);
      }
    }
  }, [params.result]);

  const handleContinue = () => {
    router.replace('/(tabs)/dashboard');
  };

  if (!result) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading results...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={14} color={COLORS.gold} />
            <Text style={styles.badgeText}>Your Attraction Archetype</Text>
          </View>
          
          <Text style={styles.archetypeTitle}>{result.archetype_title}</Text>
          
          <View style={styles.iconContainer}>
            <Ionicons name="person-outline" size={48} color={COLORS.gold} />
          </View>
        </View>

        {/* Description */}
        <Card style={styles.descriptionCard}>
          <Text style={styles.descriptionText}>{result.archetype_description}</Text>
        </Card>

        {/* Strengths */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="checkmark-circle" size={24} color={COLORS.success} />
            <Text style={styles.sectionTitle}>Your Strengths</Text>
          </View>
          <Card style={styles.listCard}>
            {result.strengths.map((strength, index) => (
              <View key={index} style={styles.listItem}>
                <View style={styles.bulletPoint} />
                <Text style={styles.listItemText}>{strength}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Areas to Improve */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="trending-up" size={24} color={COLORS.orange} />
            <Text style={styles.sectionTitle}>Areas to Level Up</Text>
          </View>
          <Card style={styles.listCard}>
            {result.areas_to_improve.map((area, index) => (
              <View key={index} style={styles.listItem}>
                <View style={[styles.bulletPoint, { backgroundColor: COLORS.orange }]} />
                <Text style={styles.listItemText}>{area}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* Recommended Modules */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="book" size={24} color={COLORS.gold} />
            <Text style={styles.sectionTitle}>Your Personalized Path</Text>
          </View>
          <Card style={styles.modulesCard}>
            {result.recommended_modules.map((module, index) => (
              <View key={index} style={styles.moduleItem}>
                <View style={styles.moduleNumber}>
                  <Text style={styles.moduleNumberText}>{index + 1}</Text>
                </View>
                <Text style={styles.moduleText}>{module}</Text>
              </View>
            ))}
          </Card>
        </View>

        {/* CTA */}
        <View style={styles.ctaContainer}>
          <Text style={styles.ctaText}>
            Your transformation begins now. Let's build the confident,
            attractive man you're meant to be.
          </Text>
          <Button
            title="Start My Journey"
            onPress={handleContinue}
            size="large"
            style={styles.ctaButton}
            icon={<Ionicons name="rocket" size={20} color={COLORS.background} />}
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
    fontSize: FONT_SIZES.md,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.backgroundSecondary,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.full,
    marginBottom: SPACING.md,
    gap: SPACING.xs,
  },
  badgeText: {
    color: COLORS.gold,
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
  },
  archetypeTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.lg,
  },
  iconContainer: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: `${COLORS.gold}15`,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  descriptionCard: {
    marginBottom: SPACING.xl,
  },
  descriptionText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.6,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  listCard: {
    gap: SPACING.md,
  },
  listItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  bulletPoint: {
    width: 8,
    height: 8,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.success,
  },
  listItemText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
  },
  modulesCard: {
    gap: SPACING.md,
  },
  moduleItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  moduleNumber: {
    width: 32,
    height: 32,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleNumberText: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.background,
  },
  moduleText: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  ctaContainer: {
    alignItems: 'center',
    marginTop: SPACING.lg,
  },
  ctaText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginBottom: SPACING.lg,
    lineHeight: FONT_SIZES.md * 1.5,
  },
  ctaButton: {
    width: '100%',
  },
});
