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
  Mic,
  MicOff,
  Volume2,
  VolumeX,
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
  const [isListening, setIsListening] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);

  // Clean up speech synthesis & recognition on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined') {
        if ('speechSynthesis' in window) {
          window.speechSynthesis.cancel();
        }
        if (recognitionRef.current) {
          try {
            recognitionRef.current.abort();
          } catch {}
        }
      }
    };
  }, []);

  // Text-to-Speech playback
  const toggleSpeech = (msgId: string, text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

    if (speakingMsgId === msgId) {
      window.speechSynthesis.cancel();
      setSpeakingMsgId(null);
      return;
    }

    window.speechSynthesis.cancel();

    // Clean symbols and markdown for smooth Indic/English speech
    const clean = text
      .replace(/₹\s*(\d+(?:,\d+)*(?:\.\d+)?)/g, (_match, p1) => {
        return language === 'hi' ? `${p1} रुपये` : language === 'gu' ? `${p1} રૂપિયા` : `${p1} rupees`;
      })
      .replace(/[•*#_`]/g, '')
      .replace(/\s+/g, ' ')
      .trim();

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';
    utterance.rate = 1.0;
    utterance.pitch = 1.0;

    utterance.onend = () => {
      setSpeakingMsgId(null);
    };

    utterance.onerror = () => {
      setSpeakingMsgId(null);
    };

    setSpeakingMsgId(msgId);
    window.speechSynthesis.speak(utterance);
  };

  // Voice Input via Web Speech API
  const toggleVoiceInput = () => {
    if (typeof window === 'undefined') return;

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert(
        language === 'hi'
          ? 'आपके ब्राउज़र में वॉयस इनपुट समर्थित नहीं है। कृपया लिखकर पूछें।'
          : language === 'gu'
          ? 'તમારા બ્રાઉઝરમાં વૉઇસ ઇનપુટ સપોર્ટેડ નથી. કૃપા કરીને ટાઇપ કરો.'
          : 'Voice recognition is not supported in this browser. Please type your query.'
      );
      return;
    }

    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {}
      }
      setIsListening(false);
      return;
    }

    try {
      // Cancel TTS before listening
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        setSpeakingMsgId(null);
      }

      const recognition = new SpeechRecognition();
      recognitionRef.current = recognition;
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }

        const spokenText = finalTranscript || interimTranscript;
        if (spokenText) {
          setInputText(spokenText);
        }

        if (finalTranscript.trim()) {
          setIsListening(false);
          handleSendMessage(finalTranscript.trim(), true);
        }
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch {
      setIsListening(false);
    }
  };

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
              : language === 'gu'
              ? 'નમસ્તે રાહુલ, મેં મેક્સ હોસ્પિટલમાં ₹48,200 નો તાજેતરનો ખર્ચ જોયો. શું તમને કેશલેસ ક્લેમ અથવા ઇમરજન્સી ફંડ સમીક્ષામાં મદદ જોઈએ છે?'
              : 'I noticed the recent ₹48,200 hospital payment at Max Super Speciality. Would you like help reviewing your insurance claim or emergency reserves?',
          prompts: ['File Insurance Claim', 'View Section 80D Receipt', 'Review Upcoming Commitments'],
        };
      }
      if (currentState === 'financial_stress') {
        return {
          text:
            language === 'hi'
              ? 'नमस्ते राहुल, इस महीने आपका नकदी प्रवाह सामान्य से थोड़ा तंग दिख रहा है। आगामी ईएमआई को प्रबंधित करने में मैं आपकी मदद कर सकता हूँ।'
              : language === 'gu'
              ? 'નમસ્તે રાહુલ, આ મહિને તમારો રોકડ પ્રવાહ સામાન્ય કરતાં ચુસ્ત દેખાય છે. આગામી EMI સંભાળવામાં હું મદદ કરી શકું છું.'
              : 'Hello Rahul, your cash flow looks tighter than usual with upcoming EMI commitments of ₹32,000. How can I assist you with budget stabilization?',
          prompts: ['View Upcoming EMIs', 'Flexible Repayment Options', 'Review Monthly Outflows'],
        };
      }
      if (currentState === 'fraud_alert') {
        return {
          text:
            language === 'hi'
              ? 'सुरक्षा चेतावनी: ₹31,800 का एक असत्यापित अंतर्राष्ट्रीय लेन-देन देखा गया है। क्या आप तुरंत कार्ड फ्रीज करना चाहते हैं?'
              : language === 'gu'
              ? 'સુરક્ષા ચેતવણી: ₹31,800 નો અજાણ્યો વ્યવહાર જણાયો છે. શું તમે તાત્કાલિક કાર્ડ ફ્રીઝ કરવા માંગો છો?'
              : 'Security Alert: An unverified charge of ₹31,800 was flagged. Would you like me to freeze your debit card or guide you through dispute resolution?',
          prompts: ['Freeze Debit Card Now', 'Dispute Transaction', 'Verify Transaction Details'],
        };
      }
      if (currentState === 'surplus') {
        return {
          text:
            language === 'hi'
              ? 'नमस्ते राहुल! वेतन आने के बाद आपके खाते में ₹24,000 की अधिशेष बचत उपलब्ध है। क्या आप ऑटो-स्वीप 7.2% योजना देखना चाहते हैं?'
              : language === 'gu'
              ? 'નમસ્તે રાહુલ! પગાર પછી ખાતામાં ₹24,000 વધારાનો સરપ્લસ છે. શું તમે 7.2% ઑટો-સ્વીપ પ્લાન જોવા માંગો છો?'
              : 'Hello Rahul! A surplus of ₹24,000 is available following salary credit. Would you like to review an auto-sweep liquid deposit earning 7.2%?',
          prompts: ['Auto-Sweep to 7.2%', 'Start Emergency SIP', 'View Savings Velocity'],
        };
      }
      return {
        text:
          language === 'hi'
            ? 'नमस्ते राहुल! मैं मित्रा हूँ। आपकी सुबह 8:40 की ₹40 मेट्रो यात्रा तैयार है। मैं आपकी क्या सहायता करूँ?'
            : language === 'gu'
            ? 'નમસ્તે રાહુલ! હું મિત્ર છું. તમારી સવારે 8:40 ની ₹40 મેટ્રો યાત્રા તૈયાર છે. હું શી મદદ કરી શકું?'
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

  const handleSendMessage = async (textToSend?: string, wasSpoken: boolean = false) => {
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
      if (wasSpoken) {
        toggleSpeech(res.reply.id, res.reply.text);
      }
    } else {
      // Offline fallback reply
      const fallbackText = `I understood your inquiry: "${text}". Your account data and contextual signals are active and up-to-date.`;
      const fallbackMsg: AssistantMessage = {
        id: `asst_${Date.now()}`,
        sender: 'assistant',
        text: fallbackText,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, fallbackMsg]);
      if (wasSpoken) {
        toggleSpeech(fallbackMsg.id, fallbackText);
      }
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
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={styles.title}>{t.assistant.name}</Text>
              <View style={styles.miniCpmPill}>
                <Text style={styles.miniCpmPillText}>MiniCPM-5</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={styles.statusText}>Edge NLU Pipeline • On-Device</Text>
            </View>
          </View>
        </View>

        <View style={styles.ethicsBadge}>
          <ShieldCheck size={12} color={colors.success} />
          <Text style={styles.ethicsText}>Lightweight</Text>
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

                {/* Voice Read-Aloud for Assistant Messages */}
                {!isUser && (
                  <View style={styles.bubbleVoiceBar}>
                    <TouchableOpacity
                      style={[
                        styles.voiceListenBtn,
                        speakingMsgId === msg.id && styles.voiceListenBtnActive,
                      ]}
                      onPress={() => toggleSpeech(msg.id, msg.text)}
                      activeOpacity={0.7}
                      accessibilityLabel="Listen to message"
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX size={12} color="#EF4444" />
                      ) : (
                        <Volume2 size={12} color={colors.primary} />
                      )}
                      <Text
                        style={[
                          styles.voiceListenText,
                          speakingMsgId === msg.id && styles.voiceListenTextActive,
                        ]}
                      >
                        {speakingMsgId === msg.id ? 'Stop' : 'Voice'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

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

      {/* Quick Action Suggestion Chips for MiniCPM Pipeline */}
      <View style={styles.quickChipsBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChipsContent}>
          {[
            { label: language === 'hi' ? 'बैलेंस जांचें' : language === 'gu' ? 'બેલેન્સ તપાસો' : 'Check Balance', query: 'Mera khata balance kitna hai?' },
            { label: language === 'hi' ? 'मेट्रो ₹40' : language === 'gu' ? 'મેટ્રો ₹40' : 'Pay Metro ₹40', query: 'Subah ki metro ka kitna lagega?' },
            { label: language === 'hi' ? 'बिजली बिल' : language === 'gu' ? 'વીજળી બિલ' : 'Electricity Bill', query: 'Bijli ka bill bhar do' },
            { label: language === 'hi' ? 'कार्ड लॉक करें' : language === 'gu' ? 'કાર્ડ બ્લોક કરો' : 'Lock My Card', query: 'Lock my card immediately' },
            { label: language === 'hi' ? 'आगामी ईएमआई' : language === 'gu' ? 'આગામી EMI' : 'EMI Due Date', query: 'Mara EMI nu payment kyare che?' },
          ].map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.quickChip}
              onPress={() => handleSendMessage(chip.query)}
              disabled={isSending}
              activeOpacity={0.75}
            >
              <Sparkles size={11} color="#4F46E5" />
              <Text style={styles.quickChipText}>{chip.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Listening Status Banner */}
      {isListening && (
        <View style={styles.listeningBanner}>
          <View style={styles.pulseDot} />
          <Text style={styles.listeningBannerText}>
            {language === 'hi'
              ? 'सुन रहा हूँ... बोलिए (हिंदी / English)'
              : language === 'gu'
              ? 'સાંભળી રહ્યો છું... બોલો (ગુજરાતી / English)'
              : 'Listening... Speak in English, Hindi, or Gujarati'}
          </Text>
          <TouchableOpacity onPress={toggleVoiceInput} style={styles.stopListeningBtn}>
            <Text style={styles.stopListeningText}>Stop</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Input Composer */}
      <View style={styles.composer}>
        <TextInput
          style={styles.composerInput}
          placeholder={isListening ? 'Listening...' : t.assistant.placeholder}
          placeholderTextColor={colors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />

        {/* Voice Option Mic Button */}
        <TouchableOpacity
          style={[styles.voiceButton, isListening && styles.voiceButtonActive]}
          onPress={toggleVoiceInput}
          activeOpacity={0.8}
          accessibilityLabel="Voice input"
        >
          {isListening ? (
            <MicOff size={18} color="#FFFFFF" />
          ) : (
            <Mic size={18} color={colors.primary} />
          )}
        </TouchableOpacity>

        {/* Send Button */}
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
  miniCpmPill: {
    backgroundColor: 'rgba(99, 102, 241, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  miniCpmPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#4F46E5',
  },
  quickChipsBar: {
    backgroundColor: colors.cardBg,
    paddingVertical: 6,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
  },
  quickChipsContent: {
    paddingHorizontal: spacing.md,
    gap: 8,
  },
  quickChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 5,
  },
  quickChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  voiceButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.25)',
  },
  voiceButtonActive: {
    backgroundColor: '#EF4444',
    borderColor: '#DC2626',
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  listeningBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#DC2626',
  },
  stopListeningBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  stopListeningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
  bubbleVoiceBar: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 4,
  },
  voiceListenBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.cardBgSecondary,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    borderWidth: 1,
    borderColor: colors.borderLight,
  },
  voiceListenBtnActive: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderColor: 'rgba(239, 68, 68, 0.3)',
  },
  voiceListenText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  voiceListenTextActive: {
    color: '#EF4444',
  },
});
