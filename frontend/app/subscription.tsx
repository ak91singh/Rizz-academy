import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { useAuth } from '../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';

interface Plan {
  id: string;
  name: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Get started with basic features',
    features: [
      'Personality Quiz',
      'Basic Dashboard',
      '3 AI Chat sessions/day',
      '5 Journal entries/month',
      'Limited Daily Prompts',
    ],
  },
  {
    id: 'premium',
    name: 'Premium',
    price: 499,
    period: '/month',
    description: 'Unlock your full potential',
    features: [
      'Everything in Free',
      'Unlimited AI Chat sessions',
      'Unlimited Journal entries',
      'All Daily Prompts',
      'Advanced Analytics',
      'Priority Support',
      'Exclusive Content',
    ],
    popular: true,
  },
  {
    id: 'pro',
    name: 'Pro',
    price: 999,
    period: '/month',
    description: 'For serious transformation',
    features: [
      'Everything in Premium',
      '1-on-1 Coaching Sessions',
      'Custom Learning Path',
      'Community Access',
      'Early Access to Features',
      'Detailed Progress Reports',
      'Personal Accountability Partner',
    ],
  },
];

const TESTIMONIALS = [
  {
    name: 'Arjun, 26',
    location: 'Delhi',
    text: 'Premium helped me build real confidence. Worth every rupee!',
  },
  {
    name: 'Vikram, 31',
    location: 'Mumbai',
    text: 'The AI practice sessions changed how I approach conversations.',
  },
  {
    name: 'Raj, 24',
    location: 'Bangalore',
    text: 'From shy introvert to confident communicator in 3 months.',
  },
];

export default function SubscriptionScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<string>('premium');
  const [loading, setLoading] = useState(false);
  const [currentPlan] = useState('free'); // Would come from user data

  const handleSubscribe = async (planId: string) => {
    if (planId === 'free') {
      Alert.alert('Free Plan', "You're already on the free plan!");
      return;
    }

    setLoading(true);
    
    // Simulate payment processing
    Alert.alert(
      'Subscribe to ' + PLANS.find(p => p.id === planId)?.name,
      `You will be charged ₹${PLANS.find(p => p.id === planId)?.price} per month. Continue?`,
      [
        { text: 'Cancel', style: 'cancel', onPress: () => setLoading(false) },
        {
          text: 'Subscribe',
          onPress: async () => {
            // In production, this would integrate with Stripe/Razorpay
            await new Promise(resolve => setTimeout(resolve, 2000));
            setLoading(false);
            Alert.alert(
              'Success!',
              `You've successfully subscribed to ${PLANS.find(p => p.id === planId)?.name}. Thank you for your support!`,
              [{ text: 'OK', onPress: () => router.back() }]
            );
          },
        },
      ]
    );
  };

  const handleRestore = () => {
    Alert.alert(
      'Restore Purchases',
      'Looking for previous purchases...',
      [{ text: 'OK' }]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="close" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Upgrade</Text>
        <TouchableOpacity onPress={handleRestore}>
          <Text style={styles.restoreText}>Restore</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero */}
        <View style={styles.hero}>
          <Text style={styles.heroTitle}>Unlock Your Full Potential</Text>
          <Text style={styles.heroSubtitle}>
            Join thousands of men transforming their dating lives with Premium
          </Text>
        </View>

        {/* Plans */}
        <View style={styles.plansContainer}>
          {PLANS.map((plan) => (
            <TouchableOpacity
              key={plan.id}
              onPress={() => setSelectedPlan(plan.id)}
              activeOpacity={0.8}
            >
              <Card
                style={[
                  styles.planCard,
                  selectedPlan === plan.id && styles.planCardSelected,
                  plan.popular && styles.planCardPopular,
                ]}
              >
                {plan.popular && (
                  <View style={styles.popularBadge}>
                    <Text style={styles.popularText}>MOST POPULAR</Text>
                  </View>
                )}
                
                <View style={styles.planHeader}>
                  <View>
                    <Text style={styles.planName}>{plan.name}</Text>
                    <Text style={styles.planDescription}>{plan.description}</Text>
                  </View>
                  <View style={styles.priceContainer}>
                    <Text style={styles.currency}>₹</Text>
                    <Text style={styles.price}>{plan.price}</Text>
                    <Text style={styles.period}>{plan.period}</Text>
                  </View>
                </View>

                <View style={styles.featuresContainer}>
                  {plan.features.map((feature, index) => (
                    <View key={index} style={styles.featureItem}>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color={COLORS.success}
                      />
                      <Text style={styles.featureText}>{feature}</Text>
                    </View>
                  ))}
                </View>

                {currentPlan === plan.id ? (
                  <View style={styles.currentPlanBadge}>
                    <Text style={styles.currentPlanText}>CURRENT PLAN</Text>
                  </View>
                ) : (
                  <View
                    style={[
                      styles.selectIndicator,
                      selectedPlan === plan.id && styles.selectIndicatorSelected,
                    ]}
                  >
                    {selectedPlan === plan.id && (
                      <Ionicons name="checkmark" size={16} color={COLORS.background} />
                    )}
                  </View>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Testimonials */}
        <View style={styles.testimonialsSection}>
          <Text style={styles.sectionTitle}>What Our Users Say</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.testimonialsScroll}
          >
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} style={styles.testimonialCard}>
                <View style={styles.testimonialStars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons key={star} name="star" size={14} color={COLORS.gold} />
                  ))}
                </View>
                <Text style={styles.testimonialText}>"{testimonial.text}"</Text>
                <Text style={styles.testimonialAuthor}>
                  {testimonial.name}, {testimonial.location}
                </Text>
              </Card>
            ))}
          </ScrollView>
        </View>

        {/* Guarantee */}
        <Card style={styles.guaranteeCard}>
          <Ionicons name="shield-checkmark" size={32} color={COLORS.gold} />
          <Text style={styles.guaranteeTitle}>7-Day Money Back Guarantee</Text>
          <Text style={styles.guaranteeText}>
            Not satisfied? Get a full refund within 7 days, no questions asked.
          </Text>
        </Card>

        {/* Terms */}
        <Text style={styles.termsText}>
          By subscribing, you agree to our Terms of Service and Privacy Policy.
          Subscriptions auto-renew unless cancelled 24 hours before the renewal
          date.
        </Text>
      </ScrollView>

      {/* CTA Button */}
      <View style={styles.ctaContainer}>
        <Button
          title={
            selectedPlan === 'free'
              ? 'Continue with Free'
              : `Subscribe to ${PLANS.find(p => p.id === selectedPlan)?.name} - ₹${PLANS.find(p => p.id === selectedPlan)?.price}/mo`
          }
          onPress={() => handleSubscribe(selectedPlan)}
          loading={loading}
          size="large"
          style={styles.ctaButton}
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  restoreText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingBottom: 100,
  },
  hero: {
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.xl,
  },
  heroTitle: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.gold,
    textAlign: 'center',
    marginBottom: SPACING.sm,
  },
  heroSubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  plansContainer: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  planCard: {
    position: 'relative',
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  planCardSelected: {
    borderColor: COLORS.gold,
  },
  planCardPopular: {
    borderColor: COLORS.gold,
  },
  popularBadge: {
    position: 'absolute',
    top: -12,
    right: SPACING.md,
    backgroundColor: COLORS.gold,
    paddingHorizontal: SPACING.md,
    paddingVertical: 4,
    borderRadius: BORDER_RADIUS.sm,
  },
  popularText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.background,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.md,
  },
  planName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  planDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  currency: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  price: {
    fontSize: FONT_SIZES.xxl,
    fontWeight: '800',
    color: COLORS.gold,
  },
  period: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginLeft: 2,
  },
  featuresContainer: {
    gap: SPACING.sm,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  featureText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
  },
  currentPlanBadge: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.success,
    paddingHorizontal: SPACING.md,
    paddingVertical: 6,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.md,
  },
  currentPlanText: {
    fontSize: FONT_SIZES.xs,
    fontWeight: '700',
    color: COLORS.background,
  },
  selectIndicator: {
    position: 'absolute',
    top: SPACING.md,
    right: SPACING.md,
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: COLORS.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectIndicatorSelected: {
    backgroundColor: COLORS.gold,
    borderColor: COLORS.gold,
  },
  testimonialsSection: {
    marginTop: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  testimonialsScroll: {
    paddingHorizontal: SPACING.lg,
    gap: SPACING.md,
  },
  testimonialCard: {
    width: 260,
    marginRight: SPACING.md,
  },
  testimonialStars: {
    flexDirection: 'row',
    gap: 2,
    marginBottom: SPACING.sm,
  },
  testimonialText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.sm * 1.5,
    marginBottom: SPACING.sm,
  },
  testimonialAuthor: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.gold,
    fontWeight: '600',
  },
  guaranteeCard: {
    marginHorizontal: SPACING.lg,
    marginTop: SPACING.xl,
    alignItems: 'center',
    padding: SPACING.lg,
  },
  guaranteeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginTop: SPACING.sm,
    marginBottom: SPACING.xs,
  },
  guaranteeText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  termsText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
    marginTop: SPACING.lg,
    lineHeight: FONT_SIZES.xs * 1.5,
  },
  ctaContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: SPACING.lg,
    backgroundColor: COLORS.background,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  ctaButton: {
    width: '100%',
  },
});
