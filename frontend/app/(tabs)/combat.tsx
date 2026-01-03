import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Card } from '../../src/components/Card';
import { Button } from '../../src/components/Button';
import { api } from '../../src/hooks/useApi';
import { useAuth } from '../../src/contexts/AuthContext';
import { COLORS, SPACING, FONT_SIZES, BORDER_RADIUS } from '../../src/constants/theme';

interface Scenario {
  id: string;
  name: string;
  description: string;
}

interface Message {
  message_id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export default function CombatScreen() {
  const { isAuthenticated } = useAuth();
  const [scenarios, setScenarios] = useState<Scenario[]>([]);
  const [selectedScenario, setSelectedScenario] = useState<Scenario | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (isAuthenticated) {
      fetchScenarios();
    }
  }, [isAuthenticated]);

  const fetchScenarios = async () => {
    try {
      const response = await api.get('/combat/scenarios');
      setScenarios(response.data.scenarios);
    } catch (error) {
      console.error('Error fetching scenarios:', error);
    }
  };

  const startScenario = async (scenario: Scenario) => {
    setSelectedScenario(scenario);
    setMessages([]);
    setFeedback(null);
    
    try {
      const response = await api.post('/combat/new-session');
      setSessionId(response.data.session_id);
    } catch (error) {
      console.error('Error starting session:', error);
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || !selectedScenario || sending) return;

    const userMessage: Message = {
      message_id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setSending(true);
    setFeedback(null);

    try {
      const response = await api.post('/combat/chat', {
        message: userMessage.content,
        scenario: selectedScenario.id,
        session_id: sessionId,
      });

      const assistantMessage: Message = {
        message_id: Date.now().toString() + '_assistant',
        role: 'assistant',
        content: response.data.response,
        timestamp: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, assistantMessage]);
      setSessionId(response.data.session_id);
      
      if (response.data.feedback) {
        setFeedback(response.data.feedback);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      const errorMessage: Message = {
        message_id: Date.now().toString() + '_error',
        role: 'assistant',
        content: "Sorry, I'm having trouble responding. Let's try again.",
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setSending(false);
    }
  };

  const endConversation = () => {
    setSelectedScenario(null);
    setSessionId(null);
    setMessages([]);
    setFeedback(null);
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Scenario Selection Screen
  if (!selectedScenario) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Conversation Combat</Text>
          <Text style={styles.headerSubtitle}>
            Practice real-world conversations with AI coaching
          </Text>
        </View>

        <ScrollView
          style={styles.scenariosList}
          contentContainerStyle={styles.scenariosContent}
          showsVerticalScrollIndicator={false}
        >
          <Text style={styles.sectionTitle}>Choose Your Arena</Text>

          {scenarios.map((scenario) => (
            <TouchableOpacity
              key={scenario.id}
              onPress={() => startScenario(scenario)}
              activeOpacity={0.8}
            >
              <Card style={styles.scenarioCard}>
                <View style={styles.scenarioIcon}>
                  <Ionicons
                    name={
                      scenario.id === 'coffee_shop'
                        ? 'cafe'
                        : scenario.id === 'party'
                        ? 'wine'
                        : 'phone-portrait'
                    }
                    size={28}
                    color={COLORS.gold}
                  />
                </View>
                <View style={styles.scenarioContent}>
                  <Text style={styles.scenarioName}>{scenario.name}</Text>
                  <Text style={styles.scenarioDescription}>
                    {scenario.description}
                  </Text>
                </View>
                <Ionicons name="play-circle" size={32} color={COLORS.orange} />
              </Card>
            </TouchableOpacity>
          ))}

          {/* Tips Section */}
          <Card style={styles.tipsCard}>
            <View style={styles.tipsHeader}>
              <Ionicons name="bulb" size={20} color={COLORS.gold} />
              <Text style={styles.tipsTitle}>Pro Tips</Text>
            </View>
            <View style={styles.tipsList}>
              <Text style={styles.tipItem}>• Be genuine and show real interest</Text>
              <Text style={styles.tipItem}>• Ask open-ended questions</Text>
              <Text style={styles.tipItem}>• Don't try to impress, connect instead</Text>
              <Text style={styles.tipItem}>• Pay attention to the feedback after each message</Text>
            </View>
          </Card>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // Chat Screen
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        {/* Chat Header */}
        <View style={styles.chatHeader}>
          <TouchableOpacity onPress={endConversation} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={COLORS.textPrimary} />
          </TouchableOpacity>
          <View style={styles.chatHeaderInfo}>
            <Text style={styles.chatHeaderTitle}>{selectedScenario.name}</Text>
            <Text style={styles.chatHeaderSubtitle}>Practice Mode</Text>
          </View>
          <TouchableOpacity onPress={endConversation}>
            <Ionicons name="close-circle" size={28} color={COLORS.error} />
          </TouchableOpacity>
        </View>

        {/* Messages */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Scenario Context */}
          <View style={styles.contextCard}>
            <Ionicons name="information-circle" size={20} color={COLORS.gold} />
            <Text style={styles.contextText}>
              {selectedScenario.description}. Start the conversation!
            </Text>
          </View>

          {messages.map((message) => (
            <View
              key={message.message_id}
              style={[
                styles.messageBubble,
                message.role === 'user'
                  ? styles.userMessage
                  : styles.assistantMessage,
              ]}
            >
              <Text
                style={[
                  styles.messageText,
                  message.role === 'user' && styles.userMessageText,
                ]}
              >
                {message.content}
              </Text>
            </View>
          ))}

          {sending && (
            <View style={[styles.messageBubble, styles.assistantMessage]}>
              <ActivityIndicator size="small" color={COLORS.gold} />
            </View>
          )}

          {/* Feedback */}
          {feedback && (
            <View style={styles.feedbackCard}>
              <View style={styles.feedbackHeader}>
                <Ionicons name="school" size={18} color={COLORS.gold} />
                <Text style={styles.feedbackTitle}>Coach's Note</Text>
              </View>
              <Text style={styles.feedbackText}>{feedback}</Text>
            </View>
          )}
        </ScrollView>

        {/* Input */}
        <View style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="Type your message..."
            placeholderTextColor={COLORS.textMuted}
            value={input}
            onChangeText={setInput}
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              (!input.trim() || sending) && styles.sendButtonDisabled,
            ]}
            onPress={sendMessage}
            disabled={!input.trim() || sending}
          >
            <Ionicons
              name="send"
              size={20}
              color={input.trim() && !sending ? COLORS.background : COLORS.textMuted}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
  scenariosList: {
    flex: 1,
  },
  scenariosContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING.xxl,
  },
  sectionTitle: {
    fontSize: FONT_SIZES.lg,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.md,
  },
  scenarioCard: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  scenarioIcon: {
    width: 56,
    height: 56,
    borderRadius: BORDER_RADIUS.md,
    backgroundColor: `${COLORS.gold}20`,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: SPACING.md,
  },
  scenarioContent: {
    flex: 1,
  },
  scenarioName: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  scenarioDescription: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.textSecondary,
  },
  tipsCard: {
    marginTop: SPACING.lg,
    borderLeftWidth: 4,
    borderLeftColor: COLORS.gold,
  },
  tipsHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
    marginBottom: SPACING.md,
  },
  tipsTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.gold,
  },
  tipsList: {
    gap: SPACING.sm,
  },
  tipItem: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.5,
  },
  chatContainer: {
    flex: 1,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  backButton: {
    padding: SPACING.xs,
  },
  chatHeaderInfo: {
    flex: 1,
    marginLeft: SPACING.md,
  },
  chatHeaderTitle: {
    fontSize: FONT_SIZES.md,
    fontWeight: '600',
    color: COLORS.textPrimary,
  },
  chatHeaderSubtitle: {
    fontSize: FONT_SIZES.xs,
    color: COLORS.success,
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.lg,
  },
  contextCard: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: COLORS.backgroundSecondary,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
    gap: SPACING.sm,
  },
  contextText: {
    flex: 1,
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    fontStyle: 'italic',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    marginBottom: SPACING.sm,
  },
  userMessage: {
    alignSelf: 'flex-end',
    backgroundColor: COLORS.gold,
  },
  assistantMessage: {
    alignSelf: 'flex-start',
    backgroundColor: COLORS.cardBg,
  },
  messageText: {
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.md * 1.4,
  },
  userMessageText: {
    color: COLORS.background,
  },
  feedbackCard: {
    backgroundColor: `${COLORS.gold}15`,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    marginTop: SPACING.sm,
    borderLeftWidth: 3,
    borderLeftColor: COLORS.gold,
  },
  feedbackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
    marginBottom: SPACING.xs,
  },
  feedbackTitle: {
    fontSize: FONT_SIZES.sm,
    fontWeight: '600',
    color: COLORS.gold,
  },
  feedbackText: {
    fontSize: FONT_SIZES.sm,
    color: COLORS.textSecondary,
    lineHeight: FONT_SIZES.sm * 1.4,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    gap: SPACING.sm,
  },
  input: {
    flex: 1,
    backgroundColor: COLORS.cardBg,
    borderRadius: BORDER_RADIUS.lg,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    fontSize: FONT_SIZES.md,
    color: COLORS.textPrimary,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.gold,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    backgroundColor: COLORS.backgroundTertiary,
  },
});
