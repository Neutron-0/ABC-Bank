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
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { BankingApi } from '../../services/api';
import { AssistantMessage } from '../../types';
import {
  Bot,
  Send,
  Sparkles,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  HeartHandshake,
} from 'lucide-react-native';

export const MitraChatScreen: React.FC = () => {
  const {
    currentState,
    language,
    openJourney,
    performPayment,
    setActiveTab,
  } = useCustomerStore();
  const t = getTranslation(language);

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  // Load initial contextual greeting
  useEffect(() => {
    loadInitialGreeting();
  }, [currentState, language]);

  const loadInitialGreeting = async () => {
    const getContextGreeting = () => {
      if (currentState === 'medical_event') {
        return {
          text:
            language === 'hi'
              ? 'नमस्ते राहुल, मैंने मैक्स अस्पताल में ₹48,200 का हालिया भुगतान देखा। क्या आप क्लेम रीइंबर्समेंट या टैक्स रसीद में सहायता चाहते हैं?'
              : 'I noticed the recent ₹48,200 hospital payment at Max Super Speciality. Would you like help reviewing your insurance claim or emergency reserves?',
          prompts: ['File Insurance Claim', 'View Section 80D Receipt', 'Review Upcoming Commitments'],
        };
      }
      if (currentState === 'financial_stress') {
        return {
          text:
            language === 'hi'
              ? 'नमस्ते राहुल, इस महीने आपका नकदी प्रवाह सामान्य से थोड़ा तंग दिख रहा है। आगामी ईएमआई को प्रबंधित करने में मैं आपकी मदद कर सकता हूँ।'
              : 'Hello Rahul, your cash flow looks tighter than usual with upcoming EMI commitments of ₹32,000. How can I assist you with budget stabilization?',
          prompts: ['View Upcoming EMIs', 'Flexible Repayment Options', 'Review Monthly Outflows'],
        };
      }
      if (currentState === 'fraud_alert') {
        return {
          text:
            language === 'hi'
              ? 'सुरक्षा चेतावनी: ₹31,800 का एक असत्यापित अंतर्राष्ट्रीय लेन-देन देखा गया है। क्या आप तुरंत कार्ड फ्रीज करना चाहते हैं?'
              : 'Security Alert: An unverified charge of ₹31,800 was flagged. Would you like me to freeze your debit card or guide you through dispute resolution?',
          prompts: ['Freeze Debit Card Now', 'Dispute Transaction', 'Verify Transaction Details'],
        };
      }
      if (currentState === 'surplus') {
        return {
          text:
            language === 'hi'
              ? 'नमस्ते राहुल! वेतन आने के बाद आपके खाते में ₹24,000 की अधिशेष बचत उपलब्ध है। क्या आप ऑटो-स्वीप 7.2% योजना देखना चाहते हैं?'
              : 'Hello Rahul! A surplus of ₹24,000 is available following salary credit. Would you like to review an auto-sweep liquid deposit earning 7.2%?',
          prompts: ['Auto-Sweep to 7.2%', 'Start Emergency SIP', 'View Savings Velocity'],
        };
      }
      return {
        text:
          language === 'hi'
            ? 'नमस्ते राहुल! मैं मित्रा हूँ। आपकी सुबह 8:40 की ₹40 मेट्रो यात्रा तैयार है। मैं आपकी क्या सहायता करूँ?'
            : "Hello Rahul! I'm Mitra. Your routine 8:40 AM Metro recharge of ₹40 is ready. How can I assist you with your day-to-day banking?",
        prompts: ['Pay my morning Metro ₹40', 'Upcoming commitments', 'Monthly cash flow status'],
      };
    };

    const ctx = getContextGreeting();
    setMessages([
      {
        id: `init_${currentState}_${Date.now()}`,
        sender: 'assistant',
        text: ctx.text,
        timestamp: new Date().toISOString(),
        suggestedPrompts: ctx.prompts,
      },
    ]);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputText;
    if (!text.trim()) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    // Scroll to bottom
    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    const res = await BankingApi.sendAssistantMessage(text, language);
    setIsSending(false);

    if (res && res.reply) {
      setMessages((prev) => [...prev, res.reply]);
    } else {
      // Offline fallback reply
      setMessages((prev) => [
        ...prev,
        {
          id: `asst_${Date.now()}`,
          sender: 'assistant',
          text: `I understood your inquiry: "${text}". Your account data and contextual signals are active and up-to-date.`,
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleChipAction = (action: string, payload?: any) => {
    if (action === 'INSTANT_PAY' && payload) {
      performPayment({
        amount: payload.amount,
        merchant: payload.merchant,
        category: 'transport',
        description: `Mitra fast pay for ${payload.merchant}`,
      });
      return;
    }

    if (action === 'OPEN_JOURNEY' && payload?.journeyId) {
      openJourney(payload.journeyId);
      return;
    }

    if (action === 'OPEN_SCREEN' && payload?.targetScreen) {
      if (payload.targetScreen === 'Insights') setActiveTab('insights');
      if (payload.targetScreen === 'Activity') setActiveTab('activity');
      if (payload.targetScreen === 'Payments') setActiveTab('payments');
      return;
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color="#111318" />
          </TouchableOpacity>
          <View style={styles.avatarBox}>
            <Bot size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.title}>{t.assistant.name}</Text>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>{t.assistant.status}</Text>
            </View>
          </View>
        </View>

        <View style={styles.ethicsBadge}>
          <ShieldCheck size={12} color={colors.success} />
          <Text style={styles.ethicsText}>Ethical AI</Text>
        </View>
      </View>

      {/* Messages Scroll */}
      <ScrollView
        ref={scrollRef}
        style={styles.messagesList}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Context Banner */}
        <View style={styles.contextPillWrap}>
          <View style={styles.contextPill}>
            <Sparkles size={12} color={colors.primary} />
            <Text style={styles.contextPillText}>
              Active State Context: {currentState.toUpperCase()}
            </Text>
          </View>
        </View>

        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <View
              key={msg.id}
              style={[styles.messageBubbleWrap, isUser ? styles.userWrap : styles.assistantWrap]}
            >
              {!isUser && (
                <View style={styles.mitraBubbleAvatar}>
                  <Bot size={14} color={colors.primary} />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser ? styles.userBubble : styles.assistantBubble,
                ]}
              >
                <Text
                  style={[styles.messageText, isUser ? styles.userText : styles.assistantText]}
                >
                  {msg.text}
                </Text>

                {/* Action Chips */}
                {msg.actionChips && msg.actionChips.length > 0 && (
                  <View style={styles.chipsContainer}>
                    {msg.actionChips.map((chip, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.actionChip}
                        onPress={() => handleChipAction(chip.action, chip.payload)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.actionChipText}>{chip.label}</Text>
                        <ArrowRight size={12} color={colors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Suggested Prompts */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <View style={styles.suggestedWrap}>
                    <Text style={styles.suggestedLabel}>{t.assistant.suggestedTopics}:</Text>
                    {msg.suggestedPrompts.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={styles.promptBtn}
                        onPress={() => handleSendMessage(p)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.promptBtnText}>“{p}”</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })}

        {isSending && (
          <View style={[styles.messageBubbleWrap, styles.assistantWrap]}>
            <View style={styles.mitraBubbleAvatar}>
              <Bot size={14} color={colors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble]}>
              <ActivityIndicator size="small" color={colors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Input Composer */}
      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          placeholder={t.assistant.placeholder}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />
        <TouchableOpacity
          style={[styles.sendButton, !inputText.trim() && styles.sendDisabled]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          activeOpacity={0.85}
        >
          <Send size={18} color={colors.textWhite} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.bg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.cardBg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  backButton: {
    padding: 6,
    borderRadius: radii.full,
    backgroundColor: colors.cardBgSecondary,
    marginRight: 2,
  },
  avatarBox: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: {
    ...typography.h3,
    color: colors.textPrimary,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.success,
  },
  statusText: {
    ...typography.tiny,
    color: colors.textSecondary,
  },
  ethicsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.successLight,
    paddingHorizontal: spacing.sm,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  ethicsText: {
    ...typography.tiny,
    color: '#065F46',
    fontWeight: '700',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  contextPillWrap: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  contextPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.md,
    paddingVertical: 3,
    borderRadius: radii.full,
  },
  contextPillText: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '700',
  },
  messageBubbleWrap: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.xs,
  },
  userWrap: {
    justifyContent: 'flex-end',
  },
  assistantWrap: {
    justifyContent: 'flex-start',
  },
  mitraBubbleAvatar: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageBubble: {
    maxWidth: '82%',
    padding: spacing.md,
    borderRadius: radii.lg,
  },
  userBubble: {
    backgroundColor: colors.primary,
    borderTopRightRadius: 2,
  },
  assistantBubble: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: 2,
    borderWidth: 1,
    borderColor: colors.border,
    ...shadows.sm,
  },
  messageText: {
    ...typography.body,
  },
  userText: {
    color: colors.textWhite,
  },
  assistantText: {
    color: colors.textPrimary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionChipText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  suggestedWrap: {
    marginTop: spacing.md,
    paddingTop: spacing.xs,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    gap: 4,
  },
  suggestedLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
  },
  promptBtn: {
    backgroundColor: colors.cardBgSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
  },
  promptBtnText: {
    ...typography.caption,
    color: colors.textSecondary,
    fontStyle: 'italic',
  },
  composer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.sm,
  },
  composerInput: {
    flex: 1,
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.full,
    paddingHorizontal: spacing.md,
    paddingVertical: Platform.OS === 'ios' ? spacing.sm : 6,
    ...typography.body,
    color: colors.textPrimary,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
