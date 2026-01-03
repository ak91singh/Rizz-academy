import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../src/components/Card';
import { Button } from '../src/components/Button';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';

interface FAQItem {
  question: string;
  answer: string;
}

const FAQ_DATA: FAQItem[] = [
  {
    question: 'How does the personality quiz work?',
    answer:
      'Our 10-question quiz analyzes your responses to determine your Attraction Archetype. This helps us personalize your learning path and provide targeted advice based on your unique personality traits and communication style.',
  },
  {
    question: 'What is XP and how do I earn it?',
    answer:
      'XP (Experience Points) is earned by completing activities like journaling, practicing conversations, and maintaining daily streaks. Every 500 XP levels you up, unlocking new achievements and content.',
  },
  {
    question: 'How does Conversation Combat work?',
    answer:
      'Conversation Combat uses AI to simulate realistic dating scenarios. You practice your conversation skills with an AI that responds like a real person would, providing coaching feedback after each message to help you improve.',
  },
  {
    question: 'Is my data private and secure?',
    answer:
      'Absolutely. We use industry-standard encryption to protect your data. Your journal entries and conversation history are private and never shared with third parties. See our Privacy Policy for details.',
  },
  {
    question: 'How do I cancel my subscription?',
    answer:
      'You can cancel your subscription anytime from the Profile > Subscription Settings. Your access will continue until the end of your billing period.',
  },
  {
    question: 'Can I use Rizz Academy offline?',
    answer:
      'Some features like viewing your saved journal entries work offline. However, AI-powered features like Conversation Combat require an internet connection.',
  },
];

const CONTACT_OPTIONS = [
  {
    icon: 'mail-outline' as const,
    title: 'Email Support',
    subtitle: 'support@rizzacademy.com',
    action: () => Linking.openURL('mailto:support@rizzacademy.com'),
  },
  {
    icon: 'logo-twitter' as const,
    title: 'Twitter',
    subtitle: '@RizzAcademyApp',
    action: () => Linking.openURL('https://twitter.com/RizzAcademyApp'),
  },
  {
    icon: 'logo-instagram' as const,
    title: 'Instagram',
    subtitle: '@rizz.academy',
    action: () => Linking.openURL('https://instagram.com/rizz.academy'),
  },
];

export default function HelpScreen() {
  const router = useRouter();
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);
  const [feedbackText, setFeedbackText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
  };

  const submitFeedback = async () => {
    if (!feedbackText.trim()) {
      Alert.alert('Error', 'Please enter your feedback or question.');
      return;
    }

    setSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSubmitting(false);
    setFeedbackText('');
    Alert.alert(
      'Thank You!',
      'Your feedback has been submitted. We will get back to you soon.'
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Quick Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactGrid}>
            {CONTACT_OPTIONS.map((option, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={option.action}
                activeOpacity={0.8}
              >
                <View style={styles.contactIcon}>
                  <Ionicons name={option.icon} size={24} color={COLORS.gold} />
                </View>
                <Text style={styles.contactTitle}>{option.title}</Text>
                <Text style={styles.contactSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          {FAQ_DATA.map((faq, index) => (
            <TouchableOpacity
              key={index}
              onPress={() => toggleFAQ(index)}
              activeOpacity={0.8}
            >
              <Card style={styles.faqCard}>
                <View style={styles.faqHeader}>
                  <Text style={styles.faqQuestion}>{faq.question}</Text>
                  <Ionicons
                    name={expandedFAQ === index ? 'chevron-up' : 'chevron-down'}
                    size={20}
                    color={COLORS.textSecondary}
                  />
                </View>
                {expandedFAQ === index && (
                  <Text style={styles.faqAnswer}>{faq.answer}</Text>
                )}
              </Card>
            </TouchableOpacity>
          ))}
        </View>

        {/* Feedback Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send Us a Message</Text>
          <Card style={styles.feedbackCard}>
            <TextInput
              style={styles.feedbackInput}
              placeholder="Describe your issue or feedback..."
              placeholderTextColor={COLORS.textMuted}
              multiline
              numberOfLines={5}
              value={feedbackText}
              onChangeText={setFeedbackText}
              textAlignVertical="top"
            />
            <Button
              title="Submit"
              onPress={submitFeedback}
              loading={submitting}
              disabled={!feedbackText.trim()}
              style={styles.submitButton}
            />
          </Card>
        </View>

        {/* App Info */}
        <View style={styles.appInfo}>
          <Text style={styles.appVersion}>Rizz Academy v1.0.0</Text>
          <Text style={styles.appCopyright}>
            © 2025 Rizz Academy. All rights reserved.
          </Text>
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
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  contactGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  contactCard: {
    flex: 1,
    minWidth: 100,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    alignItems: 'center',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.sm,
  },
  contactTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
  faqCard: {
    marginBottom: SPACING.sm,
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginRight: SPACING.sm,
  },
  faqAnswer: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
    lineHeight: FONT_SIZES.sm * 1.6,
  },
  feedbackCard: {
    padding: SPACING.md,
  },
  feedbackInput: {
    backgroundColor: COLORS.backgroundTertiary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.md,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    minHeight: 120,
    marginBottom: SPACING.md,
  },
  submitButton: {
    width: '100%',
  },
  appInfo: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
  },
  appVersion: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.xs,
  },
  appCopyright: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
});
