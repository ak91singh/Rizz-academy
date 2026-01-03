import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { api } from '../../src/hooks/useApi';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';
import { format } from 'date-fns';

interface JournalEntry {
  entry_id: string;
  entry_type: string;
  content: string;
  mood?: string;
  timestamp: string;
}

interface Prompts {
  journal: string[];
  affirmation: string[];
  reflection: string[];
}

const MOODS = [
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '😔', label: 'Low', value: 'low' },
  { emoji: '😐', label: 'Neutral', value: 'neutral' },
  { emoji: '😊', label: 'Good', value: 'good' },
  { emoji: '🔥', label: 'Confident', value: 'confident' },
];

const TABS = [
  { key: 'journal', label: 'Journal', icon: 'book-outline' as const },
  { key: 'affirmation', label: 'Affirm', icon: 'heart-outline' as const },
  { key: 'reflection', label: 'Reflect', icon: 'sparkles-outline' as const },
];

export default function FoundationScreen() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('journal');
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [prompts, setPrompts] = useState<Prompts | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchData();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (prompts) {
      const promptList = prompts[activeTab as keyof Prompts];
      const randomPrompt = promptList[Math.floor(Math.random() * promptList.length)];
      setCurrentPrompt(randomPrompt);
    }
  }, [activeTab, prompts]);

  const fetchData = async () => {
    try {
      const [entriesRes, promptsRes] = await Promise.all([
        api.get('/foundation/entries'),
        api.get('/foundation/prompts'),
      ]);
      setEntries(entriesRes.data.entries);
      setPrompts(promptsRes.data);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchData();
    setRefreshing(false);
  };

  const handleSubmit = async () => {
    if (!content.trim()) return;

    setSubmitting(true);
    try {
      await api.post('/foundation/entries', {
        entry_type: activeTab,
        content: content.trim(),
        mood: selectedMood,
      });
      setContent('');
      setSelectedMood(null);
      setShowModal(false);
      await fetchData();
    } catch (error) {
      console.error('Error creating entry:', error);
    } finally {
      setSubmitting(false);
    }
  };

  const filteredEntries = entries.filter((e) => e.entry_type === activeTab);

  const getEntryIcon = (type: string) => {
    switch (type) {
      case 'journal':
        return 'book';
      case 'affirmation':
        return 'heart';
      case 'reflection':
        return 'sparkles';
      default:
        return 'document';
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Foundation Protocol</Text>
        <Text style={styles.headerSubtitle}>
          Build unshakeable confidence through daily practice
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        {TABS.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
          >
            <Ionicons
              name={tab.icon}
              size={18}
              color={activeTab === tab.key ? COLORS.gold : COLORS.textMuted}
            />
            <Text
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Daily Prompt */}
      <View style={styles.promptContainer}>
        <Card style={styles.promptCard}>
          <View style={styles.promptHeader}>
            <Ionicons name="bulb" size={20} color={COLORS.gold} />
            <Text style={styles.promptLabel}>Today's Prompt</Text>
          </View>
          <Text style={styles.promptText}>{currentPrompt}</Text>
          <Button
            title="Write Now"
            onPress={() => setShowModal(true)}
            size="medium"
            style={styles.writeButton}
            icon={<Ionicons name="pencil" size={18} color={COLORS.background} />}
          />
        </Card>
      </View>

      {/* Entries List */}
      <ScrollView
        style={styles.entriesList}
        contentContainerStyle={styles.entriesContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={COLORS.gold}
          />
        }
      >
        <Text style={styles.sectionTitle}>
          Your {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}s
        </Text>

        {filteredEntries.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name={getEntryIcon(activeTab) as any} size={48} color={COLORS.textMuted} />
            <Text style={styles.emptyText}>No entries yet</Text>
            <Text style={styles.emptySubtext}>
              Start your journey by writing your first {activeTab}
            </Text>
          </View>
        ) : (
          filteredEntries.map((entry) => (
            <Card key={entry.entry_id} style={styles.entryCard}>
              <View style={styles.entryHeader}>
                <View style={styles.entryMeta}>
                  <Ionicons
                    name={getEntryIcon(entry.entry_type) as any}
                    size={16}
                    color={COLORS.gold}
                  />
                  <Text style={styles.entryDate}>
                    {format(new Date(entry.timestamp), 'MMM d, yyyy • h:mm a')}
                  </Text>
                </View>
                {entry.mood && (
                  <Text style={styles.entryMood}>
                    {MOODS.find((m) => m.value === entry.mood)?.emoji}
                  </Text>
                )}
              </View>
              <Text style={styles.entryContent}>{entry.content}</Text>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Write Modal */}
      <Modal
        visible={showModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowModal(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <SafeAreaView style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Ionicons name="close" size={24} color={COLORS.textPrimary} />
              </TouchableOpacity>
              <Text style={styles.modalTitle}>
                New {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
              </Text>
              <View style={{ width: 24 }} />
            </View>

            {/* Prompt */}
            <View style={styles.modalPrompt}>
              <Ionicons name="bulb" size={16} color={COLORS.gold} />
              <Text style={styles.modalPromptText}>{currentPrompt}</Text>
            </View>

            {/* Mood Selector (for journal) */}
            {activeTab === 'journal' && (
              <View style={styles.moodSelector}>
                <Text style={styles.moodLabel}>How are you feeling?</Text>
                <View style={styles.moodOptions}>
                  {MOODS.map((mood) => (
                    <TouchableOpacity
                      key={mood.value}
                      style={[
                        styles.moodOption,
                        selectedMood === mood.value && styles.moodOptionSelected,
                      ]}
                      onPress={() => setSelectedMood(mood.value)}
                    >
                      <Text style={styles.moodEmoji}>{mood.emoji}</Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Text Input */}
            <TextInput
              style={styles.textInput}
              placeholder={`Write your ${activeTab}...`}
              placeholderTextColor={COLORS.textMuted}
              multiline
              value={content}
              onChangeText={setContent}
              autoFocus
            />

            {/* Submit Button */}
            <View style={styles.modalFooter}>
              <Button
                title="Save Entry"
                onPress={handleSubmit}
                loading={submitting}
                disabled={!content.trim()}
                size="large"
                style={styles.submitButton}
              />
            </View>
          </SafeAreaView>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  header: {
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
    paddingBottom: SPACING.md,
  },
  headerTitle: {
    fontSize: FONT_SIZES.xl,
    fontWeight: '700',
    color: COLORS.textPrimary,
  },
  headerSubtitle: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginTop: SPACING.xs,
  },
  tabsContainer: {
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: COLORS.cardBg,
    gap: SPACING.xs,
  },
  tabActive: {
    backgroundColor: `${COLORS.gold}20`,
  },
  tabText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  tabTextActive: {
    color: COLORS.gold,
  },
  promptContainer: {
    paddingHorizontal: SPACING.lg,
    marginBottom: SPACING.md,
  },
  promptCard: {
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  promptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.sm,
  },
  promptLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.gold,
    fontWeight: '600',
  },
  promptText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.5,
    marginBottom: SPACING.md,
  },
  writeButton: {
    alignSelf: 'flex-start',
  },
  entriesList: {
    flex: 1,
  },
  entriesContent: {
    paddingHorizontal: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginBottom: SPACING.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xxl,
  },
  emptyText: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textSecondary,
    marginTop: SPACING.md,
  },
  emptySubtext: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textMuted,
    marginTop: SPACING.xs,
    textAlign: 'center',
  },
  entryCard: {
    marginBottom: SPACING.md,
  },
  entryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.sm,
  },
  entryMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  entryDate: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textMuted,
  },
  entryMood: {
    fontSize: 20,
  },
  entryContent: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.sm * 1.6,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  modalContent: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  modalTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  modalPrompt: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: SPACING.sm,
    padding: SPACING.lg,
    backgroundColor: COLORS.backgroundSecondary,
  },
  modalPromptText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  moodSelector: {
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  moodLabel: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    marginBottom: SPACING.sm,
  },
  moodOptions: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  moodOption: {
    width: 48,
    height: 48,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.cardBg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moodOptionSelected: {
    backgroundColor: COLORS.gold,
  },
  moodEmoji: {
    fontSize: 24,
  },
  textInput: {
    flex: 1,
    padding: SPACING.lg,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    textAlignVertical: 'top',
  },
  modalFooter: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
  },
  submitButton: {
    width: '100%',
  },
});
