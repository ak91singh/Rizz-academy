import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/');
          },
        },
      ]
    );
  };

  const menuItems = [
    {
      icon: 'diamond-outline' as const,
      label: 'Upgrade to Premium',
      subtitle: 'Unlock all features',
      color: COLORS.gold,
      onPress: () => router.push('/subscription'),
    },
    {
      icon: 'analytics-outline' as const,
      label: 'Retake Quiz',
      subtitle: 'Discover your archetype again',
      onPress: () => router.push('/quiz'),
    },
    {
      icon: 'help-circle-outline' as const,
      label: 'Help & Support',
      subtitle: 'FAQ and contact us',
      onPress: () => router.push('/help'),
    },
    {
      icon: 'shield-checkmark-outline' as const,
      label: 'Privacy Policy',
      subtitle: 'How we protect your data',
      onPress: () => router.push('/privacy'),
    },
    {
      icon: 'document-text-outline' as const,
      label: 'Terms of Service',
      subtitle: 'Our terms and conditions',
      onPress: () => Alert.alert('Terms of Service', 'Terms of Service coming soon.'),
    },
    {
      icon: 'star-outline' as const,
      label: 'Rate the App',
      subtitle: 'Love Rizz Academy? Rate us!',
      onPress: () => Alert.alert('Rate Us', 'Thank you for your support! Rating feature coming soon.'),
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Profile</Text>
        </View>

        {/* User Info Card */}
        <Card style={styles.userCard}>
          <View style={styles.avatarContainer}>
            {user?.picture ? (
              <Image
                source={{ uri: user.picture }}
                style={styles.avatar}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={40} color={COLORS.gold} />
              </View>
            )}
          </View>
          <Text style={styles.userName}>{user?.name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
          
          {/* Free Plan Badge */}
          <View style={styles.planBadge}>
            <Ionicons name="star" size={14} color={COLORS.gold} />
            <Text style={styles.planText}>Free Plan</Text>
          </View>
        </Card>

        {/* Upgrade Banner */}
        <TouchableOpacity 
          style={styles.upgradeBanner}
          onPress={() => router.push('/subscription')}
          activeOpacity={0.9}
        >
          <View style={styles.upgradeContent}>
            <Ionicons name="rocket" size={28} color={COLORS.gold} />
            <View style={styles.upgradeText}>
              <Text style={styles.upgradeTitle}>Unlock Premium</Text>
              <Text style={styles.upgradeSubtitle}>
                Unlimited AI chats, all features & more
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={24} color={COLORS.gold} />
        </TouchableOpacity>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <View style={[
                  styles.menuIconContainer,
                  item.color && { backgroundColor: `${item.color}20` }
                ]}>
                  <Ionicons 
                    name={item.icon} 
                    size={22} 
                    color={item.color || COLORS.gold} 
                  />
                </View>
                <View>
                  <Text style={[
                    styles.menuItemLabel,
                    item.color && { color: item.color }
                  ]}>
                    {item.label}
                  </Text>
                  {item.subtitle && (
                    <Text style={styles.menuItemSubtitle}>{item.subtitle}</Text>
                  )}
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={COLORS.textMuted} />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout Button */}
        <View style={styles.logoutSection}>
          <Button
            title="Logout"
            onPress={handleLogout}
            variant="outline"
            size="large"
            style={styles.logoutButton}
            icon={<Ionicons name="log-out-outline" size={20} color={COLORS.gold} />}
          />
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>Rizz Academy v1.0.0</Text>
        <Text style={styles.copyrightText}>Made with love in India</Text>
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
    marginBottom: SPACING.lg,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  userCard: {
    alignItems: 'center',
    paddingVertical: SPACING.xl,
    marginBottom: SPACING.lg,
  },
  avatarContainer: {
    marginBottom: SPACING.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.backgroundTertiary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: COLORS.gold,
  },
  userName: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  planBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${COLORS.gold}20`,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
    gap: SPACING.xs,
  },
  planText: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },
  upgradeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.backgroundSecondary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    marginBottom: SPACING.xl,
    borderWidth: 1,
    borderColor: COLORS.gold,
  },
  upgradeContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  upgradeText: {
    flex: 1,
  },
  upgradeTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '700',
    color: COLORS.gold,
  },
  upgradeSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  menuSection: {
    marginBottom: SPACING.xl,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.cardBg,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.sm,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.md,
  },
  menuIconContainer: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.gold}15`,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemLabel: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    fontWeight: '500',
  },
  menuItemSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
    marginTop: 2,
  },
  logoutSection: {
    marginBottom: SPACING.lg,
  },
  logoutButton: {
    width: '100%',
  },
  versionText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    textAlign: 'center',
  },
});
