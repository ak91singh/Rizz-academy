import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface NotificationSetting {
  id: string;
  title: string;
  description: string;
  enabled: boolean;
}

interface Notification {
  id: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  type: 'achievement' | 'reminder' | 'tip' | 'update';
}

const SAMPLE_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    title: 'Achievement Unlocked!',
    message: 'You completed your first journal entry. +25 XP',
    time: '2 hours ago',
    read: false,
    type: 'achievement',
  },
  {
    id: '2',
    title: 'Daily Reminder',
    message: "Don't forget to practice today! Your streak is at risk.",
    time: '5 hours ago',
    read: false,
    type: 'reminder',
  },
  {
    id: '3',
    title: 'Pro Tip',
    message: 'Eye contact is 80% of communication. Practice holding it for 3 seconds.',
    time: '1 day ago',
    read: true,
    type: 'tip',
  },
  {
    id: '4',
    title: 'New Content Available',
    message: 'Check out the new "Coffee Shop Mastery" scenario in Conversation Combat!',
    time: '2 days ago',
    read: true,
    type: 'update',
  },
];

export default function NotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>(SAMPLE_NOTIFICATIONS);
  const [settings, setSettings] = useState<NotificationSetting[]>([
    {
      id: 'daily_reminder',
      title: 'Daily Reminders',
      description: 'Get reminded to practice daily',
      enabled: true,
    },
    {
      id: 'achievements',
      title: 'Achievements',
      description: 'Notifications when you unlock achievements',
      enabled: true,
    },
    {
      id: 'tips',
      title: 'Pro Tips',
      description: 'Receive daily tips to improve your game',
      enabled: true,
    },
    {
      id: 'updates',
      title: 'App Updates',
      description: 'Be notified about new features and content',
      enabled: false,
    },
  ]);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const savedSettings = await AsyncStorage.getItem('notification_settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async (newSettings: NotificationSetting[]) => {
    try {
      await AsyncStorage.setItem('notification_settings', JSON.stringify(newSettings));
    } catch (error) {
      console.error('Error saving settings:', error);
    }
  };

  const toggleSetting = (id: string) => {
    const newSettings = settings.map((setting) =>
      setting.id === id ? { ...setting, enabled: !setting.enabled } : setting
    );
    setSettings(newSettings);
    saveSettings(newSettings);
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const clearAll = () => {
    Alert.alert(
      'Clear All Notifications',
      'Are you sure you want to clear all notifications?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => setNotifications([]),
        },
      ]
    );
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'achievement':
        return 'trophy';
      case 'reminder':
        return 'alarm';
      case 'tip':
        return 'bulb';
      case 'update':
        return 'rocket';
      default:
        return 'notifications';
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'achievement':
        return COLORS.gold;
      case 'reminder':
        return COLORS.orange;
      case 'tip':
        return COLORS.success;
      case 'update':
        return '#3B82F6';
      default:
        return COLORS.textSecondary;
    }
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Notifications</Text>
          {unreadCount > 0 && (
            <Text style={styles.unreadCount}>{unreadCount} unread</Text>
          )}
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => setShowSettings(!showSettings)}
          >
            <Ionicons
              name={showSettings ? 'list' : 'settings-outline'}
              size={24}
              color={COLORS.textPrimary}
            />
          </TouchableOpacity>
          {notifications.length > 0 && !showSettings && (
            <TouchableOpacity style={styles.headerButton} onPress={clearAll}>
              <Ionicons name="trash-outline" size={24} color={COLORS.error} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {showSettings ? (
          // Settings View
          <View>
            <Text style={styles.sectionTitle}>Notification Settings</Text>
            {settings.map((setting) => (
              <Card key={setting.id} style={styles.settingCard}>
                <View style={styles.settingInfo}>
                  <Text style={styles.settingTitle}>{setting.title}</Text>
                  <Text style={styles.settingDescription}>
                    {setting.description}
                  </Text>
                </View>
                <Switch
                  value={setting.enabled}
                  onValueChange={() => toggleSetting(setting.id)}
                  trackColor={{ false: COLORS.border, true: COLORS.gold }}
                  thumbColor={setting.enabled ? COLORS.background : COLORS.textMuted}
                />
              </Card>
            ))}
          </View>
        ) : notifications.length === 0 ? (
          // Empty State
          <View style={styles.emptyState}>
            <Ionicons name="notifications-off" size={64} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Notifications</Text>
            <Text style={styles.emptySubtitle}>
              You're all caught up! Check back later for updates.
            </Text>
          </View>
        ) : (
          // Notifications List
          <View>
            {notifications.map((notification) => (
              <TouchableOpacity
                key={notification.id}
                onPress={() => markAsRead(notification.id)}
                activeOpacity={0.8}
              >
                <Card
                  style={[
                    styles.notificationCard,
                    !notification.read && styles.unreadCard,
                  ]}
                >
                  <View
                    style={[
                      styles.notificationIcon,
                      { backgroundColor: `${getNotificationColor(notification.type)}20` },
                    ]}
                  >
                    <Ionicons
                      name={getNotificationIcon(notification.type) as any}
                      size={24}
                      color={getNotificationColor(notification.type)}
                    />
                  </View>
                  <View style={styles.notificationContent}>
                    <View style={styles.notificationHeader}>
                      <Text style={styles.notificationTitle}>
                        {notification.title}
                      </Text>
                      {!notification.read && <View style={styles.unreadDot} />}
                    </View>
                    <Text style={styles.notificationMessage}>
                      {notification.message}
                    </Text>
                    <Text style={styles.notificationTime}>{notification.time}</Text>
                  </View>
                </Card>
              </TouchableOpacity>
            ))}
          </View>
        )}
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
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  unreadCount: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  headerButton: {
    padding: SPACING.sm,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  settingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.md,
  },
  settingInfo: {
    flex: 1,
    marginRight: SPACING.md,
  },
  settingTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl * 2,
  },
  emptyTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginTop: SPACING.lg,
  },
  emptySubtitle: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textSecondary,
    marginTop: SPACING.sm,
    textAlign: 'center',
  },
  notificationCard: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
  },
  unreadCard: {
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  notificationIcon: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  notificationContent: {
    flex: 1,
  },
  notificationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  notificationTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    flex: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.gold,
    marginLeft: SPACING.sm,
  },
  notificationMessage: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: 4,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  notificationTime: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
  },
});
