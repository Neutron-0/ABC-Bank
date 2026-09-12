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
  Animated,
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
  Mic,
  MicOff,
  Volume2,
  Compass,
  CreditCard,
  Award,
  CheckCircle2,
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
  const [pendingClarification, setPendingClarification] = useState<string | null>(null);
  const [isListening, setIsListening] = useState(false);
  const [navigatingBanner, setNavigatingBanner] = useState<string | null>(null);

  const scrollRef = useRef<ScrollView>(null);
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const recognitionRef = useRef<any>(null);

  // Microphone pulse animation
  useEffect(() => {
    let loopAnimation: Animated.CompositeAnimation | null = null;
    if (isListening) {
      loopAnimation = Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, {
            toValue: 1.25,
            duration: 650,
            useNativeDriver: true,
          }),
          Animated.timing(pulseAnim, {
            toValue: 1,
            duration: 650,
            useNativeDriver: true,
          }),
        ])
      );
      loopAnimation.start();
    } else {
      pulseAnim.setValue(1);
    }

    return () => {
      if (loopAnimation) {
        loopAnimation.stop();
      }
    };
  }, [isListening]);

  // Load initial contextual greeting
  useEffect(() => {
    loadInitialGreeting();
  }, [currentState, language]);

  const loadInitialGreeting = () => {
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
              ? 'નમસ્તે રાહુલ, આ મહિને તમારો રોકડ પ્રવાહ સામાન્ય કરતાં ચુસ્ત દેખાય છે. આગામી EMI સંભાળવામાં હું मदद કરી શકું છું.'
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
    setPendingClarification(null);
  };

  // Client-side fallback dialogue turn logic for offline/demo resilience
  const processClientFallbackTurn = (
    text: string,
    lang: string,
    pending: string | null
  ): AssistantMessage => {
    const q = text.toLowerCase().trim();
    const id = `asst_${Date.now()}`;
    const timestamp = new Date().toISOString();

    // 1. Pending clarification resolution
    if (pending === 'CONFIRM_CREDIT_SCORE') {
      const isAffirmative = /^(yes|yeah|yep|sure|ok|okay|haan|ha|sahi|dikhao|kholo|check|हाँ|हा|बिल्कुल|ज़रूर|હા|ચોક્કસ|હા બતાવો)/i.test(q);
      const isNegative = /^(no|nah|nope|nahi|na|cancel|mat|rehne|nathi|नहीं|ना|ના|નહીં)/i.test(q);

      if (isAffirmative) {
        const respText =
          lang === 'hi'
            ? 'आपके क्रेडिट स्कोर (CIBIL) पेज पर ले जाया जा रहा है...'
            : lang === 'gu'
            ? 'તમારા ક્રેડિટ સ્કોર પેજ પર લઈ જઈ રહ્યા છીએ...'
            : 'Opening your Credit Score report...';

        return {
          id,
          sender: 'assistant',
          text: respText,
          timestamp,
          pendingClarification: null,
          navigation: {
            type: 'JOURNEY',
            target: 'credit_score',
            auto_navigate: true,
            action_label: lang === 'hi' ? 'क्रेडिट स्कोर देखें' : lang === 'gu' ? 'ક્રેડિટ સ્કોર જુઓ' : 'View Credit Score',
          },
          actionChips: [
            {
              label: lang === 'hi' ? 'क्रेडिट स्कोर देखें' : lang === 'gu' ? 'ક્રેડિટ સ્કોર જુઓ' : 'View Credit Score',
              action: 'OPEN_JOURNEY',
              payload: { journeyId: 'credit_score' },
            },
          ],
          suggestedPrompts: ['Score Factors', 'Refresh CIBIL', 'Debit Card'],
        };
      }

      if (isNegative) {
        const respText =
          lang === 'hi'
            ? 'समझ गया। मैं आपकी बैंकिंग में और क्या सहायता करूँ?'
            : lang === 'gu'
            ? 'સમજાયું. હું તમારી બેંકિંગમાં બીજી શું મદદ કરી શકું?'
            : 'Understood. How else can I assist you with your banking?';

        return {
          id,
          sender: 'assistant',
          text: respText,
          timestamp,
          pendingClarification: null,
          suggestedPrompts: ['Debit Card', 'Metro Recharge', 'Account Balance'],
        };
      }
    }

    // 2. Direct Credit Score (zero follow-up needed)
    if (/(credit\s*score|cibil\s*score|experian|credit\s*report|क्रेडिट स्कोर|सिबिल स्कोर|ક્રેડિટ સ્કોર|સિબિલ સ્કોર)/i.test(q)) {
      const respText =
        lang === 'hi'
          ? 'आपके क्रेडिट स्कोर (CIBIL) पेज पर ले जाया जा रहा है...'
          : lang === 'gu'
          ? 'તમારા ક્રેડિટ સ્કોર પેજ પર લઈ જઈ રહ્યા છીએ...'
          : 'Opening your Credit Score report...';

      return {
        id,
        sender: 'assistant',
        text: respText,
        timestamp,
        pendingClarification: null,
        navigation: {
          type: 'JOURNEY',
          target: 'credit_score',
          auto_navigate: true,
          action_label: lang === 'hi' ? 'क्रेडिट स्कोर देखें' : lang === 'gu' ? 'ક્રેડિટ સ્કોર જુઓ' : 'View Credit Score',
        },
        actionChips: [
          {
            label: lang === 'hi' ? 'क्रेडिट स्कोर देखें' : lang === 'gu' ? 'ક્રેડિટ સ્કોર જુઓ' : 'View Credit Score',
            action: 'OPEN_JOURNEY',
            payload: { journeyId: 'credit_score' },
          },
        ],
        suggestedPrompts: ['Score Factors', 'Refresh CIBIL', 'Debit Card'],
      };
    }

    // 3. Ambiguous Score (requires minimal follow-up)
    if (/\b(score|cibil|rating|स्कोर|सिबिल|રેટિંગ|સ્કોર)\b/i.test(q)) {
      const clarificationText =
        lang === 'hi'
          ? 'क्या आप अपना क्रेडिट स्कोर (CIBIL) देखना चाहते हैं?'
          : lang === 'gu'
          ? 'શું તમે તમારો ક્રેડિટ સ્કોર (CIBIL) જોવા માંગો છો?'
          : 'Do you mean your Credit Score (CIBIL)?';

      const yesLabel = lang === 'hi' ? 'हाँ, क्रेडिट स्कोर' : lang === 'gu' ? 'હા, ક્રેડિટ સ્કોર' : 'Yes, Credit Score';
      const noLabel = lang === 'hi' ? 'नहीं' : lang === 'gu' ? 'ના' : 'No';

      return {
        id,
        sender: 'assistant',
        text: clarificationText,
        timestamp,
        pendingClarification: 'CONFIRM_CREDIT_SCORE',
        actionChips: [
          { label: yesLabel, action: 'CONFIRM_YES', payload: { journeyId: 'credit_score' } },
          { label: noLabel, action: 'CONFIRM_NO', payload: {} },
        ],
        suggestedPrompts: [yesLabel, noLabel],
      };
    }

    // 4. Direct Debit Card (zero follow-up needed)
    if (/(debit\s*card|atm\s*card|my\s*card|card\s*settings|lock\s*card|freeze\s*card|card\s*limit|डेबिट कार्ड|एटीएम कार्ड|कार्ड ब्लॉक|कार्ड लॉक|ડેબિટ કાર્ડ|એટીએમ કાર્ડ|કાર્ડ બ્લોક)/i.test(q)) {
      const respText =
        lang === 'hi'
          ? 'आपका डेबिट कार्ड प्रबंधन खोला जा रहा है...'
          : lang === 'gu'
          ? 'તમારું ડેબિટ કાર્ડ પેજ ખોલી રહ્યા છીએ...'
          : 'Opening your Debit Card controls...';

      const chipLabel = lang === 'hi' ? 'डेबिट कार्ड खोलें' : lang === 'gu' ? 'ડેબિટ કાર્ડ ખોલો' : 'Open Debit Card';

      return {
        id,
        sender: 'assistant',
        text: respText,
        timestamp,
        pendingClarification: null,
        navigation: {
          type: 'JOURNEY',
          target: 'debit_card',
          auto_navigate: true,
          action_label: chipLabel,
        },
        actionChips: [
          {
            label: chipLabel,
            action: 'OPEN_JOURNEY',
            payload: { journeyId: 'debit_card' },
          },
        ],
        suggestedPrompts: ['Lock Card', 'Change ATM Limit', 'Credit Score'],
      };
    }

    // 5. Metro
    if (/(metro|delhi\s*metro|metro\s*card|स्मार्ट कार्ड|मेट्रो|મેટ્રો)/i.test(q)) {
      return {
        id,
        sender: 'assistant',
        text:
          lang === 'hi'
            ? 'आपकी नियमित सुबह 8:40 की ₹40 मेट्रो यात्रा तैयार है।'
            : lang === 'gu'
            ? 'તમારી નિયમિત સવારે 8:40 ની ₹40 મેટ્રો યાત્રા तैयार છે.'
            : 'Your routine morning 8:40 AM Metro recharge of ₹40 is ready.',
        timestamp,
        pendingClarification: null,
        actionChips: [
          {
            label: '1-Tap Pay ₹40',
            action: 'INSTANT_PAY',
            payload: { amount: 40, merchant: 'Delhi Metro DMRC' },
          },
        ],
        suggestedPrompts: ['Passbook', 'Debit Card', 'Credit Score'],
      };
    }

    // Default conversational reply
    return {
      id,
      sender: 'assistant',
      text:
        lang === 'hi'
          ? `मैंने आपका संदेश प्राप्त किया: "${text}"। क्या आप डेबिट कार्ड या क्रेडिट स्कोर देखना चाहते हैं?`
          : lang === 'gu'
          ? `મેં તમારો સંદેશ વાંચ્યો: "${text}". શું તમે ડેબિટ કાર્ડ કે ક્રેડિટ સ્કોર જોવા માંગો છો?`
          : `I received your inquiry: "${text}". Would you like to check your Debit Card or Credit Score?`,
      timestamp,
      pendingClarification: null,
      suggestedPrompts: ['Debit Card', 'Credit Score', 'Metro Recharge'],
    };
  };

  // Process auto-navigation with feedback
  const triggerNavigation = (nav: { type: string; target: string; auto_navigate: boolean; action_label?: string }) => {
    const label = nav.action_label || (nav.target === 'credit_score' ? 'Credit Score' : 'Debit Card');
    setNavigatingBanner(label);

    setTimeout(() => {
      setNavigatingBanner(null);
      if (nav.type === 'JOURNEY') {
        openJourney(nav.target);
      } else if (nav.type === 'TAB') {
        setActiveTab(nav.target as any);
      }
    }, 550);
  };

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend !== undefined ? textToSend : inputText).trim();
    if (!text) return;

    const userMsg: AssistantMessage = {
      id: `user_${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setIsSending(true);

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const res = await BankingApi.sendAssistantMessage(text, language, pendingClarification);
      setIsSending(false);

      if (res && res.reply) {
        setMessages((prev) => [...prev, res.reply]);
        setPendingClarification(res.reply.pendingClarification || null);

        if (res.reply.navigation && res.reply.navigation.auto_navigate) {
          triggerNavigation(res.reply.navigation);
        }

        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 100);
        return;
      }
    } catch {
      // Backend not available; fallback executes smoothly below
    }

    // Client-side fallback if backend API is unreachable
    const fallbackReply = processClientFallbackTurn(text, language, pendingClarification);
    setIsSending(false);
    setMessages((prev) => [...prev, fallbackReply]);
    setPendingClarification(fallbackReply.pendingClarification || null);

    if (fallbackReply.navigation && fallbackReply.navigation.auto_navigate) {
      triggerNavigation(fallbackReply.navigation);
    }

    setTimeout(() => {
      scrollRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  // Toggle voice recognition
  const toggleVoiceListening = () => {
    if (isListening) {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
      setIsListening(false);
      return;
    }

    setIsListening(true);

    // If Web Speech Recognition is available in web runtime
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      const SpeechRecognition =
        (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

      if (SpeechRecognition) {
        try {
          const recognition = new SpeechRecognition();
          recognitionRef.current = recognition;
          recognition.continuous = false;
          recognition.interimResults = false;
          recognition.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-IN';

          recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            setIsListening(false);
            if (transcript) {
              handleSendMessage(transcript);
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
          // Browser permission or support issue; fallback remains active
        }
      }
    }
  };

  const handleChipAction = (action: string, payload?: any, chipLabel?: string) => {
    if (action === 'CONFIRM_YES') {
      handleSendMessage(chipLabel || (language === 'hi' ? 'हाँ' : language === 'gu' ? 'હા' : 'Yes'));
      return;
    }

    if (action === 'CONFIRM_NO') {
      handleSendMessage(chipLabel || (language === 'hi' ? 'नहीं' : language === 'gu' ? 'ના' : 'No'));
      return;
    }

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

  // Quick vernacular voice shortcut chips
  const voiceShortcuts = [
    { label: language === 'hi' ? 'स्कोर' : language === 'gu' ? 'સ્કોર' : 'score', desc: 'Minimal follow-up' },
    { label: language === 'hi' ? 'डेबिट कार्ड' : language === 'gu' ? 'ડેબિટ કાર્ડ' : 'debit card', desc: 'Direct navigation' },
    { label: language === 'hi' ? 'क्रेडिट स्कोर' : language === 'gu' ? 'ક્રેડિટ સ્કોર' : 'credit score', desc: 'Direct CIBIL' },
    { label: language === 'hi' ? 'कार्ड लॉक करो' : language === 'gu' ? 'કાર્ડ બ્લોક' : 'lock card', desc: 'Security' },
    { label: language === 'hi' ? 'मेट्रो' : language === 'gu' ? 'મેટ્રો' : 'metro recharge', desc: 'Transit' },
  ];

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

        <View style={styles.headerRight}>
          <View style={styles.ethicsBadge}>
            <ShieldCheck size={12} color={colors.success} />
            <Text style={styles.ethicsText}>Ethical AI</Text>
          </View>
        </View>
      </View>

      {/* Navigation Banner Alert */}
      {navigatingBanner && (
        <View style={styles.navBanner}>
          <Compass size={14} color="#047857" />
          <Text style={styles.navBannerText}>
            {t.assistant.navigatingTo} {navigatingBanner}...
          </Text>
        </View>
      )}

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
                        style={[
                          styles.actionChip,
                          chip.action === 'CONFIRM_YES' && styles.actionChipYes,
                          chip.action === 'CONFIRM_NO' && styles.actionChipNo,
                        ]}
                        onPress={() => handleChipAction(chip.action, chip.payload, chip.label)}
                        activeOpacity={0.8}
                      >
                        {chip.action === 'CONFIRM_YES' ? (
                          <CheckCircle2 size={13} color="#047857" />
                        ) : chip.payload?.journeyId === 'credit_score' ? (
                          <Award size={13} color={colors.primary} />
                        ) : chip.payload?.journeyId === 'debit_card' ? (
                          <CreditCard size={13} color={colors.primary} />
                        ) : (
                          <ArrowRight size={13} color={colors.primary} />
                        )}
                        <Text
                          style={[
                            styles.actionChipText,
                            chip.action === 'CONFIRM_YES' && styles.actionChipTextYes,
                            chip.action === 'CONFIRM_NO' && styles.actionChipTextNo,
                          ]}
                        >
                          {chip.label}
                        </Text>
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

      {/* Voice Listening Active Strip */}
      {isListening && (
        <View style={styles.listeningStrip}>
          <View style={styles.listeningStripLeft}>
            <Animated.View
              style={[
                styles.pulsingWaveCircle,
                {
                  transform: [{ scale: pulseAnim }],
                },
              ]}
            >
              <Mic size={18} color="#FFFFFF" />
            </Animated.View>
            <View>
              <Text style={styles.listeningHeading}>{t.assistant.voiceListening}</Text>
              <Text style={styles.listeningSubheading}>{t.assistant.voiceSpeakNow}</Text>
            </View>
          </View>
          <TouchableOpacity
            style={styles.stopVoiceBtn}
            onPress={toggleVoiceListening}
            activeOpacity={0.75}
          >
            <MicOff size={16} color="#DC2626" />
            <Text style={styles.stopVoiceText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Quick Voice & Vernacular Shortcut Bar */}
      <View style={styles.shortcutsBar}>
        <View style={styles.shortcutsHeaderRow}>
          <Volume2 size={12} color={colors.textSecondary} />
          <Text style={styles.shortcutsTitle}>{t.assistant.voicePillsLabel}:</Text>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.shortcutsList}
        >
          {voiceShortcuts.map((item, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.shortcutPill}
              onPress={() => handleSendMessage(item.label)}
              activeOpacity={0.75}
            >
              <Text style={styles.shortcutPillText}>“{item.label}”</Text>
              <Text style={styles.shortcutPillSub}>{item.desc}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input Composer */}
      <View style={styles.composer}>
        <TouchableOpacity
          style={[styles.micButton, isListening && styles.micButtonActive]}
          onPress={toggleVoiceListening}
          activeOpacity={0.8}
        >
          {isListening ? (
            <MicOff size={18} color="#FFFFFF" />
          ) : (
            <Mic size={18} color={colors.primary} />
          )}
        </TouchableOpacity>

        <TextInput
          style={styles.composerInput}
          placeholder={isListening ? t.assistant.voiceListening : t.assistant.placeholder}
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
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
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
  navBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#D1FAE5',
    paddingVertical: 6,
    paddingHorizontal: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: '#A7F3D0',
  },
  navBannerText: {
    ...typography.captionMedium,
    color: '#065F46',
    fontWeight: '700',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    padding: spacing.md,
    paddingBottom: spacing.lg,
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
    paddingVertical: 5,
    borderRadius: radii.full,
    gap: 5,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionChipYes: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  actionChipNo: {
    backgroundColor: colors.cardBgSecondary,
    borderColor: colors.border,
  },
  actionChipText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '700',
  },
  actionChipTextYes: {
    color: '#065F46',
  },
  actionChipTextNo: {
    color: colors.textSecondary,
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
  listeningStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  listeningStripLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  pulsingWaveCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  listeningHeading: {
    ...typography.captionMedium,
    color: '#991B1B',
    fontWeight: '700',
  },
  listeningSubheading: {
    ...typography.tiny,
    color: '#B91C1C',
  },
  stopVoiceBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.full,
    backgroundColor: '#FEE2E2',
  },
  stopVoiceText: {
    ...typography.captionMedium,
    color: '#DC2626',
    fontWeight: '600',
  },
  shortcutsBar: {
    backgroundColor: colors.cardBg,
    borderTopWidth: 1,
    borderTopColor: colors.borderLight,
    paddingVertical: 6,
  },
  shortcutsHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: spacing.md,
    marginBottom: 4,
  },
  shortcutsTitle: {
    ...typography.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  shortcutsList: {
    paddingHorizontal: spacing.md,
    gap: spacing.xs,
  },
  shortcutPill: {
    backgroundColor: colors.cardBgSecondary,
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  shortcutPillText: {
    ...typography.captionMedium,
    color: colors.primary,
    fontWeight: '600',
  },
  shortcutPillSub: {
    ...typography.tiny,
    color: colors.textMuted,
    fontSize: 9,
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
  micButton: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  micButtonActive: {
    backgroundColor: '#DC2626',
    borderColor: '#B91C1C',
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
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendDisabled: {
    opacity: 0.4,
  },
});
