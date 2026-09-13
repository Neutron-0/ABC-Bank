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
  Modal,
  Animated,
} from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useAppTheme } from '../../theme/ThemeContext';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { BankingApi } from '../../services/api';
import { AssistantMessage } from '../../types';
import {
  Bot,
  Send,
  ShieldCheck,
  ArrowRight,
  ArrowLeft,
  User,
  HeartHandshake,
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  Radio,
  Cpu,
  X,
  CheckCircle2,
} from 'lucide-react-native';

export const MitraChatScreen: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const {
    currentState,
    language,
    openJourney,
    performPayment,
    requestPaymentAuth,
    showToast,
    setActiveTab,
  } = useCustomerStore();
  const t = getTranslation(language);

  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputText, setInputText] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [showVoiceStudio, setShowVoiceStudio] = useState(false);
  const [speakingMsgId, setSpeakingMsgId] = useState<string | null>(null);
  const scrollRef = useRef<ScrollView>(null);
  const recognitionRef = useRef<any>(null);

  // Micro-interaction animations
  const micPulseAnim = useRef(new Animated.Value(1)).current;
  const waveAnim1 = useRef(new Animated.Value(24)).current;
  const waveAnim2 = useRef(new Animated.Value(42)).current;
  const waveAnim3 = useRef(new Animated.Value(58)).current;
  const waveAnim4 = useRef(new Animated.Value(38)).current;
  const waveAnim5 = useRef(new Animated.Value(48)).current;
  const waveAnim6 = useRef(new Animated.Value(24)).current;

  // Active listening mic pulse
  useEffect(() => {
    if (isListening) {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(micPulseAnim, {
            toValue: 1.14,
            duration: 550,
            useNativeDriver: true,
          }),
          Animated.timing(micPulseAnim, {
            toValue: 1.0,
            duration: 550,
            useNativeDriver: true,
          }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else {
      micPulseAnim.setValue(1);
    }
  }, [isListening, micPulseAnim]);

  // Voice studio soundwave bars dynamic rhythm
  useEffect(() => {
    if (!showVoiceStudio) return;
    const createWaveLoop = (anim: Animated.Value, minH: number, maxH: number, duration: number) => {
      return Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: maxH,
            duration,
            useNativeDriver: false,
          }),
          Animated.timing(anim, {
            toValue: minH,
            duration,
            useNativeDriver: false,
          }),
        ])
      );
    };

    const anims = [
      createWaveLoop(waveAnim1, 14, 38, 420),
      createWaveLoop(waveAnim2, 20, 52, 540),
      createWaveLoop(waveAnim3, 26, 62, 380),
      createWaveLoop(waveAnim4, 16, 44, 590),
      createWaveLoop(waveAnim5, 22, 54, 460),
      createWaveLoop(waveAnim6, 12, 34, 510),
    ];

    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [showVoiceStudio, waveAnim1, waveAnim2, waveAnim3, waveAnim4, waveAnim5, waveAnim6]);

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

  // Voice Input via Web Speech API or Interactive Edge Voice SLM Studio
  const toggleVoiceInput = () => {
    // If Web Speech API is present (e.g. desktop web/Chrome), use native recognition
    if (typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
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

            const current = finalTranscript || interimTranscript;
            setInputText(current);

            if (finalTranscript) {
              setIsListening(false);
              handleSendMessage(finalTranscript, true);
            }
          };

          recognition.onerror = () => {
            setIsListening(false);
          };

          recognition.onend = () => {
            setIsListening(false);
          };

          recognition.start();
          return;
        } catch {
          setIsListening(false);
        }
      }
    }

    // On mobile / React Native / Expo Go, launch interactive Voice SLM Studio
    setShowVoiceStudio(true);
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
          actionChips: [
            { label: 'Open Claim Desk', action: 'OPEN_JOURNEY', payload: { journeyId: 'medical_assistance' } },
            { label: 'View Passbook', action: 'OPEN_SCREEN', payload: { targetScreen: 'Activity' } },
          ],
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
          actionChips: [
            { label: 'Budget Shield Plan', action: 'OPEN_JOURNEY', payload: { journeyId: 'stress_intervention' } },
            { label: 'View Passbook', action: 'OPEN_SCREEN', payload: { targetScreen: 'Activity' } },
          ],
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
          actionChips: [
            { label: 'Freeze Card Instantly', action: 'OPEN_JOURNEY', payload: { journeyId: 'debit_card' } },
            { label: 'View Passbook', action: 'OPEN_SCREEN', payload: { targetScreen: 'Activity' } },
          ],
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
          actionChips: [
            { label: 'Explore Smart FD', action: 'OPEN_JOURNEY', payload: { journeyId: 'surplus' } },
            { label: 'View Passbook', action: 'OPEN_SCREEN', payload: { targetScreen: 'Activity' } },
          ],
        };
      }
      return {
        text:
          language === 'hi'
            ? 'नमस्ते राहुल! मैं मित्तर (Mittar) हूँ। आपकी सुबह 8:40 की ₹40 मेट्रो यात्रा तैयार है। मैं आपकी क्या सहायता करूँ?'
            : language === 'gu'
            ? 'નમસ્તે રાહુલ! હું મિત્તર (Mittar) છું. તમારી સવારે 8:40 ની ₹40 મેટ્રો યાત્રા તૈયાર છે. હું શી મદદ કરી શકું?'
            : "Hello Rahul! I'm Mittar (Mitra AI). Your routine 8:40 AM Metro recharge of ₹40 is ready. How can I assist you with your banking today?",
        prompts: ['Check Balance', 'Pay my morning Metro ₹40', 'Pay Electricity Bill', 'Freeze Debit Card'],
        actionChips: [
          { label: 'Pay ₹40 Metro Now', action: 'INSTANT_PAY', payload: { amount: 40, merchant: 'Delhi Metro Smart Card', category: 'transport' } },
          { label: 'View Passbook', action: 'OPEN_SCREEN', payload: { targetScreen: 'Activity' } },
        ],
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
        actionChips: ctx.actionChips,
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
      // Offline on-device SLM execution: Language understanding, intent classification & entity parsing
      const localIntent = BankingApi.classifyOnDevice(text, language);
      let offlineText = '';

      if (localIntent.intent === 'CHECK_BALANCE') {
        offlineText = language === 'hi'
          ? 'बैंक सर्वर से कनेक्शन उपलब्ध नहीं है। अपना वास्तविक बैलेंस देखने के लिए कृपया इंटरनेट से पुनः कनेक्ट करें।'
          : language === 'gu'
          ? 'બેંક સર્વર કનેક્શન ઉપલબ્ધ નથી. તમારું વાસ્તવિક બેલેન્સ જોવા માટે કૃપા કરીને ઇન્ટરનેટ ફરીથી કનેક્ટ કરો.'
          : 'Bank connection unavailable. Please reconnect to retrieve your authoritative account balance.';
      } else if (localIntent.intent === 'CHECK_EMI') {
        offlineText = language === 'hi'
          ? 'बैंक सर्वर से कनेक्शन उपलब्ध नहीं है। अपने आगामी ईएमआई की सही तारीख और राशि देखने के लिए कृपया पुनः कनेक्ट करें।'
          : language === 'gu'
          ? 'બેંક સર્વર કનેક્શન ઉપલબ્ધ નથી. તમારી આગામી EMI ની વિગતો મેળવવા કૃપા કરીને ફરી કનેક્ટ કરો.'
          : 'Bank connection unavailable. Please reconnect to inspect your active mandate and EMI schedule.';
      } else if (localIntent.intent === 'LOCK_CARD') {
        offlineText = language === 'hi'
          ? 'ऑफलाइन सुरक्षा निर्देश दर्ज किया गया। डेबिट कार्ड ब्लॉक अनुरोध को बैंक के केंद्रीय स्विच पर तुरंत भेजने के लिए नेटवर्क की आवश्यकता है।'
          : language === 'gu'
          ? 'ઑફલાઇન સુરક્ષા સૂચના નોંધાઈ. ડેબિટ કાર્ડ બ્લોક વિનંતી પૂર્ણ કરવા માટે નેટવર્ક કનેક્શન જરૂરી છે.'
          : 'Offline security command registered. Live network connectivity is required to complete debit card freeze on the institutional core.';
      } else if (localIntent.intent === 'PAY_METRO' || localIntent.intent === 'PAY_BILL') {
        offlineText = language === 'hi'
          ? 'भुगतान आदेश समझ लिया गया। यूपीआई ट्रांजैक्शन पूरा करने के लिए बैंक नेटवर्क से पुनः कनेक्ट करें।'
          : language === 'gu'
          ? 'ચુકવણી વિનંતી સમજી લેવામાં આવી. UPI વ્યવહાર પૂર્ણ કરવા માટે કૃપા કરીને ફરી કનેક્ટ કરો.'
          : 'Payment intent parsed locally. Live banking connectivity is required to clear UPI settlement.';
      } else {
        offlineText = language === 'hi'
          ? `मैंने आपका अनुरोध समझ लिया: "${text}" [इरादा: ${localIntent.intent}]। प्रामाणिक बैंकिंग विवरण लोड करने के लिए नेटवर्क कनेक्टिविटी आवश्यक है।`
          : language === 'gu'
          ? `મેં તમારી વિનંતી સમજી: "${text}" [ઇરાદો: ${localIntent.intent}]. ચોક્કસ બેંકિંગ વિગતો માટે નેટવર્ક જોડાણ આવશ્યક છે.`
          : `Understood: "${text}" [Intent: ${localIntent.intent}]. Authoritative bank data requires live network connectivity.`;
      }

      const offlineMsg: AssistantMessage = {
        id: `asst_offline_${Date.now()}`,
        sender: 'assistant',
        text: offlineText,
        timestamp: new Date().toISOString(),
        actionChips: [
          {
            label: 'Retry Connection',
            action: 'RETRY',
            payload: { query: text }
          }
        ]
      };
      setMessages((prev) => [...prev, offlineMsg]);
      if (wasSpoken) {
        toggleSpeech(offlineMsg.id, offlineText);
      }
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  const handleChipAction = (action: string, payload?: any) => {
    if (action === 'INSTANT_PAY' && payload) {
      requestPaymentAuth(
        {
          amount: payload.amount,
          merchant: payload.merchant,
          category: payload.category || 'transport',
          description: payload.description || `Mitra fast pay for ${payload.merchant}`,
        },
        () => {
          showToast(
            language === 'hi'
              ? `${payload.merchant} का ₹${payload.amount} भुगतान सफल रहा`
              : language === 'gu'
              ? `${payload.merchant} ની ₹${payload.amount} ચુકવણી સફળ થઈ`
              : `Payment of ₹${payload.amount} to ${payload.merchant} completed`
          );
        }
      );
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
      style={[styles.container, { backgroundColor: themeColors.bg }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* Header */}
      <View style={[styles.header, { backgroundColor: themeColors.cardBg, borderBottomColor: themeColors.border }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => setActiveTab('home')}
            activeOpacity={0.7}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <ArrowLeft size={20} color={themeColors.textPrimary} />
          </TouchableOpacity>
          <View style={[styles.avatarBox, { backgroundColor: themeColors.cardBgSecondary }]}>
            <Bot size={20} color={themeColors.primary} />
          </View>
          <View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Text style={[styles.title, { color: themeColors.textPrimary }]}>
                {language === 'hi' ? 'मित्तर (Mittar) AI' : language === 'gu' ? 'મિત્તર (Mittar) AI' : 'Mittar (Mitra) AI'}
              </Text>
              <View style={[styles.miniCpmPill, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                <Cpu size={10} color={themeColors.primary} />
                <Text style={[styles.miniCpmPillText, { color: themeColors.textSecondary }]}>Edge SLM Active</Text>
              </View>
            </View>
            <View style={styles.statusRow}>
              <View style={styles.statusDot} />
              <Text style={[styles.statusText, { color: themeColors.textSecondary }]}>Private On-Device • Bank-Grade NPU</Text>
            </View>
          </View>
        </View>

        <View style={[styles.ethicsBadge, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
          <ShieldCheck size={12} color={themeColors.primary} />
          <Text style={[styles.ethicsText, { color: themeColors.primary }]}>RBI Encrypted</Text>
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
          <View style={[styles.contextPill, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border, borderWidth: 1 }]}>
            <ShieldCheck size={12} color={themeColors.primary} />
            <Text style={[styles.contextPillText, { color: themeColors.textSecondary }]}>
              Verified Context: {currentState.toUpperCase().replace('_', ' ')}
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
                <View style={[styles.mitraBubbleAvatar, { backgroundColor: themeColors.cardBgSecondary }]}>
                  <Bot size={14} color={themeColors.primary} />
                </View>
              )}

              <View
                style={[
                  styles.messageBubble,
                  isUser
                    ? [styles.userBubble, { backgroundColor: themeColors.primary }]
                    : [styles.assistantBubble, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }],
                ]}
              >
                <Text
                  style={[
                    styles.messageText,
                    isUser
                      ? styles.userText
                      : [styles.assistantText, { color: themeColors.textPrimary }],
                  ]}
                >
                  {msg.text}
                </Text>

                {/* Voice Read-Aloud for Assistant Messages */}
                {!isUser && (
                  <View style={styles.bubbleVoiceBar}>
                    <TouchableOpacity
                      style={[
                        styles.voiceListenBtn,
                        { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
                        speakingMsgId === msg.id && styles.voiceListenBtnActive,
                      ]}
                      onPress={() => toggleSpeech(msg.id, msg.text)}
                      activeOpacity={0.7}
                      accessibilityLabel="Listen to message"
                    >
                      {speakingMsgId === msg.id ? (
                        <VolumeX size={12} color={themeColors.danger} />
                      ) : (
                        <Volume2 size={12} color={themeColors.iconNeutral} />
                      )}
                      <Text
                        style={[
                          styles.voiceListenText,
                          { color: themeColors.textSecondary },
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
                        style={[styles.actionChip, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
                        onPress={() => handleChipAction(chip.action, chip.payload)}
                        activeOpacity={0.8}
                      >
                        <Text style={[styles.actionChipText, { color: themeColors.primary }]}>{chip.label}</Text>
                        <ArrowRight size={12} color={themeColors.primary} />
                      </TouchableOpacity>
                    ))}
                  </View>
                )}

                {/* Suggested Prompts */}
                {msg.suggestedPrompts && msg.suggestedPrompts.length > 0 && (
                  <View style={[styles.suggestedWrap, { borderTopColor: themeColors.borderLight }]}>
                    <Text style={[styles.suggestedLabel, { color: themeColors.textMuted }]}>{t.assistant.suggestedTopics}:</Text>
                    {msg.suggestedPrompts.map((p, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={[styles.promptBtn, { backgroundColor: themeColors.cardBgSecondary }]}
                        onPress={() => handleSendMessage(p)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.promptBtnText, { color: themeColors.textSecondary }]}>“{p}”</Text>
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
            <View style={[styles.mitraBubbleAvatar, { backgroundColor: themeColors.cardBgSecondary }]}>
              <Bot size={14} color={themeColors.primary} />
            </View>
            <View style={[styles.messageBubble, styles.assistantBubble, { backgroundColor: themeColors.cardBg, borderColor: themeColors.border }]}>
              <ActivityIndicator size="small" color={themeColors.primary} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Quick Action Suggestion Chips for MiniCPM Pipeline */}
      <View style={[styles.quickChipsBar, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }]}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickChipsContent}>
          {[
            { label: language === 'hi' ? 'बैलेंस जांचें' : language === 'gu' ? 'બેલેન્સ તપાસો' : 'Check Balance', query: 'Mera khata balance kitna hai?' },
            { label: language === 'hi' ? 'मेट्रो ₹40' : language === 'gu' ? 'મેટ્રો ₹40' : 'Pay Metro ₹40', query: 'Subah ki metro ka kitna lagega?' },
            { label: language === 'hi' ? 'बिजली बिल' : language === 'gu' ? 'વીજળી बિલ' : 'Electricity Bill', query: 'Bijli ka bill bhar do' },
            { label: language === 'hi' ? 'कार्ड लॉक करें' : language === 'gu' ? 'કાર્ડ બ્લોક કરો' : 'Lock My Card', query: 'Lock my card immediately' },
            { label: language === 'hi' ? 'आगामी ईएमआई' : language === 'gu' ? 'આગામી EMI' : 'EMI Due Date', query: 'Mara EMI nu payment kyare che?' },
          ].map((chip, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.quickChip, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
              onPress={() => handleSendMessage(chip.query)}
              disabled={isSending}
              activeOpacity={0.75}
            >
              <Bot size={11} color={themeColors.primary} />
              <Text style={[styles.quickChipText, { color: themeColors.textPrimary }]}>{chip.label}</Text>
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
      <View style={[styles.composer, { backgroundColor: themeColors.cardBg, borderTopColor: themeColors.border }]}>
        <TextInput
          style={[styles.composerInput, { backgroundColor: themeColors.cardBgSecondary, color: themeColors.textPrimary, borderColor: themeColors.border }]}
          placeholder={isListening ? 'Listening...' : t.assistant.placeholder}
          placeholderTextColor={themeColors.textMuted}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={() => handleSendMessage()}
          returnKeyType="send"
        />

        {/* Voice Option Mic Button */}
        <Animated.View style={{ transform: [{ scale: micPulseAnim }] }}>
          <TouchableOpacity
            style={[
              styles.voiceButton,
              { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border },
              isListening && styles.voiceButtonActive,
            ]}
            onPress={toggleVoiceInput}
            activeOpacity={0.8}
            accessibilityLabel="Voice input"
          >
            {isListening ? (
              <MicOff size={18} color="#FFFFFF" />
            ) : (
              <Mic size={18} color={themeColors.primary} />
            )}
          </TouchableOpacity>
        </Animated.View>

        {/* Send Button */}
        <TouchableOpacity
          style={[
            styles.sendButton,
            { backgroundColor: themeColors.primary },
            !inputText.trim() && styles.sendDisabled,
          ]}
          onPress={() => handleSendMessage()}
          disabled={!inputText.trim() || isSending}
          activeOpacity={0.85}
        >
          <Send size={18} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* MiniCPM-5 Voice SLM Studio Modal (Native Expo & Mobile Speech Ingestion) */}
      <Modal
        visible={showVoiceStudio}
        transparent
        animationType="slide"
        onRequestClose={() => setShowVoiceStudio(false)}
      >
        <View style={styles.voiceModalOverlay}>
          <View style={[styles.voiceStudioSheet, { backgroundColor: themeColors.cardBg }]}>
            {/* Top Bar */}
            <View style={styles.voiceStudioTopRow}>
              <View style={[styles.voiceStudioTag, { backgroundColor: themeColors.cardBgSecondary }]}>
                <Radio size={13} color={themeColors.primary} />
                <Text style={[styles.voiceStudioTagText, { color: themeColors.primary }]}>
                  MINICPM-5 VERNACULAR VOICE SLM
                </Text>
              </View>
              <TouchableOpacity
                style={[styles.voiceStudioClose, { backgroundColor: themeColors.cardBgSecondary }]}
                onPress={() => setShowVoiceStudio(false)}
                hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
              >
                <X size={18} color={themeColors.iconNeutral} />
              </TouchableOpacity>
            </View>

            {/* Visualizer & Mic Pulse */}
            <View style={[styles.soundwaveBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <View style={styles.soundwaveBarsRow}>
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim1, backgroundColor: themeColors.primary }]} />
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim2, backgroundColor: themeColors.primary }]} />
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim3, backgroundColor: themeColors.primary }]} />
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim4, backgroundColor: themeColors.primary }]} />
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim5, backgroundColor: themeColors.primary }]} />
                <Animated.View style={[styles.soundwaveBar, { height: waveAnim6, backgroundColor: themeColors.primary }]} />
              </View>
              <Text style={[styles.voiceStudioHeading, { color: themeColors.textPrimary }]}>
                {language === 'hi'
                  ? 'मित्रा वॉइस एसएलएम सुन रहा है'
                  : language === 'gu'
                  ? 'મિત્રા વૉઇસ SLM સાંભળી રહ્યો છે'
                  : 'Mitra Voice SLM is Listening'}
              </Text>
              <Text style={[styles.voiceStudioSub, { color: themeColors.textSecondary }]}>
                {language === 'hi'
                  ? 'अपनी भाषा में बोलें या तुरंत आज़माने के लिए नीचे दिए गए वाक्य पर टैप करें'
                  : language === 'gu'
                  ? 'તમારી ભાષામાં બોલો અથવા તુરંત ચકાસવા નીચેના વાક્ય પર ટેપ કરો'
                  : 'Speak naturally in English, Hindi, or Gujarati, or tap a shortcut below'}
              </Text>
            </View>

            {/* Spoken Prompt Simulation Chips */}
            <View style={styles.voicePromptsSection}>
              <Text style={[styles.voicePromptsLabel, { color: themeColors.textMuted }]}>
                {language === 'hi'
                  ? 'त्वरित वॉयस कमांड (1-टैप से बोलें)'
                  : language === 'gu'
                  ? 'ઝડપી વૉઇસ કમાન્ડ (1-ટેપથી બોલો)'
                  : 'SPOKEN VOICE COMMAND SHORTCUTS'}
              </Text>
              <View style={styles.voicePromptsGrid}>
                {(language === 'hi'
                  ? [
                      'मेरी सुबह की मेट्रो भरें ₹40',
                      'मेरा बैंक बैलेंस कितना है?',
                      'टाटा पावर बिजली बिल ₹1,450 भरें',
                      'डेबिट कार्ड तुरंत ब्लॉक करें',
                    ]
                  : language === 'gu'
                  ? [
                      'મારી સવારની મેટ્રો ₹40 ચૂકવો',
                      'મારું ખાતાનું બેલેન્સ કેટલું છે?',
                      'વીજળી બિલ ₹1,450 ભરો',
                      'મારું ડેબિટ કાર્ડ લૉક કરો',
                    ]
                  : [
                      'Pay morning Metro ₹40',
                      'What is my account balance?',
                      'Pay Tata Power electricity ₹1,450',
                      'Lock my debit card immediately',
                    ]
                ).map((spokenPhrase, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={[styles.voicePromptCard, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}
                    onPress={() => {
                      setShowVoiceStudio(false);
                      handleSendMessage(spokenPhrase, true);
                    }}
                    activeOpacity={0.75}
                  >
                    <Mic size={14} color={themeColors.iconNeutral} />
                    <Text style={[styles.voicePromptCardText, { color: themeColors.textPrimary }]} numberOfLines={1}>
                      "{spokenPhrase}"
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Direct Dictation Submit */}
            <View style={[styles.voiceDictationRow, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
              <TextInput
                style={[styles.voiceDictationInput, { color: themeColors.textPrimary }]}
                placeholder={
                  language === 'hi'
                    ? 'या यहाँ बोलकर / टाइप करके पूछें...'
                    : language === 'gu'
                    ? 'અથવા અહીં બોલીને / ટાઈપ કરીને પૂછો...'
                    : 'Or speak / type any banking command here...'
                }
                placeholderTextColor={themeColors.textMuted}
                value={inputText}
                onChangeText={setInputText}
                onSubmitEditing={() => {
                  if (inputText.trim()) {
                    setShowVoiceStudio(false);
                    handleSendMessage(inputText.trim(), true);
                  }
                }}
              />
              <TouchableOpacity
                style={[styles.voiceDictationSend, { backgroundColor: themeColors.primary }, !inputText.trim() && { opacity: 0.5 }]}
                onPress={() => {
                  if (inputText.trim()) {
                    setShowVoiceStudio(false);
                    handleSendMessage(inputText.trim(), true);
                  }
                }}
                disabled={!inputText.trim()}
              >
                <Send size={16} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    backgroundColor: '#FDF6ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  miniCpmPillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
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
    backgroundColor: colors.cardBgSecondary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  voiceButtonActive: {
    backgroundColor: '#C92A2A',
    borderColor: '#B91C1C',
  },
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FDF2F2',
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: '#F8D7DA',
    paddingHorizontal: spacing.md,
    paddingVertical: 6,
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#C92A2A',
  },
  listeningBannerText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#C92A2A',
  },
  stopListeningBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: '#F8D7DA',
  },
  stopListeningText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#C92A2A',
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
    backgroundColor: '#FDF2F2',
    borderColor: '#F8D7DA',
  },
  voiceListenText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  voiceListenTextActive: {
    color: '#C92A2A',
  },
  voiceModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(20, 20, 20, 0.65)',
    justifyContent: 'flex-end',
  },
  voiceStudioSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingTop: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: Platform.OS === 'ios' ? 34 : spacing.lg,
    ...shadows.lg,
  },
  voiceStudioTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  voiceStudioTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#EDF7F1',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.sm,
  },
  voiceStudioTagText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1B7A43',
    letterSpacing: 0.5,
  },
  voiceStudioClose: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F3EFEA',
    alignItems: 'center',
    justifyContent: 'center',
  },
  soundwaveBox: {
    alignItems: 'center',
    backgroundColor: '#FAF8F5',
    borderRadius: radii.lg,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.sm,
    borderWidth: 1,
    borderColor: '#EAE6DF',
    marginBottom: spacing.md,
  },
  soundwaveBarsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 64,
    marginBottom: spacing.xs,
  },
  soundwaveBar: {
    width: 5,
    backgroundColor: '#141414',
    borderRadius: 3,
  },
  voiceStudioHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#141414',
    marginBottom: 4,
  },
  voiceStudioSub: {
    fontSize: 12,
    fontWeight: '500',
    color: '#68645E',
    textAlign: 'center',
    paddingHorizontal: spacing.sm,
  },
  voicePromptsSection: {
    marginBottom: spacing.md,
  },
  voicePromptsLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#9C968E',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  voicePromptsGrid: {
    gap: 6,
  },
  voicePromptCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3EFEA',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  voicePromptCardText: {
    flex: 1,
    fontSize: 13,
    fontWeight: '600',
    color: '#141414',
  },
  voiceDictationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F3EFEA',
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderWidth: 1,
    borderColor: '#EAE6DF',
  },
  voiceDictationInput: {
    flex: 1,
    fontSize: 13,
    color: '#141414',
    paddingVertical: 6,
  },
  voiceDictationSend: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#141414',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
