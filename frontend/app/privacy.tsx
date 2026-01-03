import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../src/constants/theme';

const PRIVACY_SECTIONS = [
  {
    title: '1. Information We Collect',
    content: `We collect information you provide directly to us, such as:

• Account information (email, name, profile picture)
• Quiz responses and personality assessment data
• Journal entries and reflections
• Conversation practice history
• Progress data (XP, streaks, achievements)
• Device information and usage analytics

We use this information to provide, maintain, and improve our services, and to personalize your experience.`,
  },
  {
    title: '2. How We Use Your Information',
    content: `Your information is used to:

• Provide and personalize our services
• Calculate your Attraction Archetype and learning path
• Track your progress and achievements
• Send notifications and reminders (with your consent)
• Improve our AI coaching capabilities
• Analyze usage patterns to enhance the app
• Respond to your requests and support inquiries`,
  },
  {
    title: '3. Data Storage and Security',
    content: `We implement industry-standard security measures to protect your data:

• All data is encrypted in transit using TLS 1.3
• Data at rest is encrypted using AES-256
• We use secure, compliant cloud infrastructure
• Access to user data is strictly limited to authorized personnel
• Regular security audits and penetration testing

Your journal entries and conversation history are private and encrypted.`,
  },
  {
    title: '4. Data Sharing',
    content: `We do NOT sell your personal information. We may share data only in these cases:

• With service providers who assist our operations (under strict confidentiality agreements)
• To comply with legal obligations or law enforcement requests
• To protect the rights and safety of our users
• In connection with a merger or acquisition (with notice to users)

Your private content (journals, conversations) is never shared.`,
  },
  {
    title: '5. AI and Machine Learning',
    content: `Our AI features (Conversation Combat) process your messages to generate responses:

• Conversations are processed in real-time and not stored for AI training
• We use third-party AI providers (OpenAI) under strict data processing agreements
• AI responses are generated based on general models, not your personal data
• You can request deletion of your conversation history at any time`,
  },
  {
    title: '6. Your Rights and Choices',
    content: `You have the right to:

• Access your personal data
• Correct inaccurate information
• Delete your account and all associated data
• Export your data in a portable format
• Opt out of marketing communications
• Disable analytics tracking

To exercise these rights, contact support@rizzacademy.com or use the in-app settings.`,
  },
  {
    title: '7. Data Retention',
    content: `We retain your data for as long as your account is active:

• Account data: Until you delete your account
• Usage logs: 90 days
• Analytics data: 12 months (aggregated)
• Conversation history: Until you delete it or your account

After account deletion, data is permanently removed within 30 days.`,
  },
  {
    title: '8. Children\'s Privacy',
    content: `Rizz Academy is intended for users 18 years and older. We do not knowingly collect information from children under 18. If we learn we have collected data from a minor, we will delete it immediately.`,
  },
  {
    title: '9. International Users',
    content: `Our services are operated from India. If you are accessing from outside India, please be aware that your information may be transferred to, stored, and processed in India or other countries where our servers are located.

We comply with applicable data protection laws including GDPR for EU users.`,
  },
  {
    title: '10. Changes to This Policy',
    content: `We may update this Privacy Policy from time to time. We will notify you of significant changes through:

• In-app notifications
• Email to your registered address
• A notice on our website

Continued use after changes constitutes acceptance of the updated policy.`,
  },
  {
    title: '11. Contact Us',
    content: `If you have questions about this Privacy Policy or our data practices, please contact us:

• Email: privacy@rizzacademy.com
• Support: support@rizzacademy.com

We aim to respond to all inquiries within 48 hours.`,
  },
];

export default function PrivacyScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Privacy Policy</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Last Updated */}
        <View style={styles.lastUpdated}>
          <Ionicons name="time-outline" size={16} color={COLORS.textSecondary} />
          <Text style={styles.lastUpdatedText}>Last updated: January 1, 2025</Text>
        </View>

        {/* Introduction */}
        <View style={styles.intro}>
          <Text style={styles.introText}>
            At Rizz Academy, we take your privacy seriously. This Privacy Policy
            explains how we collect, use, disclose, and safeguard your information
            when you use our mobile application and services.
          </Text>
        </View>

        {/* Sections */}
        {PRIVACY_SECTIONS.map((section, index) => (
          <View key={index} style={styles.section}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            <Text style={styles.sectionContent}>{section.content}</Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>
            By using Rizz Academy, you agree to this Privacy Policy and our Terms
            of Service.
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
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
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
  lastUpdated: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginTop: SPACING.lg,
    marginBottom: SPACING.md,
  },
  lastUpdatedText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  intro: {
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
  },
  introText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.6,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '700',
    color: COLORS.gold,
    marginBottom: SPACING.md,
  },
  sectionContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.7,
  },
  footer: {
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.lg,
    marginTop: SPACING.xl,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  footerText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    fontStyle: 'italic',
    lineHeight: FONT_SIZES.sm * 1.5,
  },
});
