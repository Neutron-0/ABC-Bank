import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback, Platform } from 'react-native';
import { colors, typography, spacing, radii, useAppTheme } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { Check, X, ShieldCheck } from 'lucide-react-native';

export const WhyThisCard: React.FC = () => {
  const { colors: themeColors } = useAppTheme();
  const { selectedWhyCard, setWhyCard, language } = useCustomerStore();
  const t = getTranslation(language);

  if (!selectedWhyCard) return null;

  return (
    <Modal
      visible={Boolean(selectedWhyCard)}
      transparent
      animationType="slide"
      onRequestClose={() => setWhyCard(null)}
    >
      <TouchableWithoutFeedback onPress={() => setWhyCard(null)}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback onPress={(e) => e.stopPropagation()}>
            <View style={[styles.sheet, { backgroundColor: themeColors.cardBg }]}>
              {/* Drag Handle Indicator */}
              <View style={styles.handleWrap}>
                <View style={[styles.dragHandle, { backgroundColor: themeColors.border }]} />
              </View>

              {/* Header */}
              <View style={[styles.header, { borderBottomColor: themeColors.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.title, { color: themeColors.textPrimary }]}>{t.whyModal.title}</Text>
                  <Text style={[styles.subtitle, { color: themeColors.textSecondary }]}>{t.whyModal.subtitle}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => setWhyCard(null)}
                  style={[styles.closeCircle, { backgroundColor: themeColors.cardBgSecondary }]}
                  delayPressIn={0}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                >
                  <X size={16} color={themeColors.textSecondary} />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Surfaced Action Preview */}
                <View style={[styles.previewBox, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <Text style={[styles.previewEyebrow, { color: themeColors.textMuted }]}>{t.whyModal.currentContext}</Text>
                  <Text style={[styles.previewTitle, { color: themeColors.textPrimary }]}>{selectedWhyCard.title}</Text>
                  <Text style={[styles.previewDesc, { color: themeColors.textSecondary }]}>{selectedWhyCard.description}</Text>
                </View>

                {/* Editorial Context Narrative (Replaces mechanical rule checklist) */}
                <View style={[styles.editorialNarrativeWrap, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <Text style={[styles.editorialEyebrow, { color: themeColors.textMuted }]}>
                    {language === 'hi' ? 'प्रासंगिक समझ' : language === 'gu' ? 'વિશ્લેષણ' : 'CONTEXTUAL INTELLIGENCE'}
                  </Text>
                  <Text style={[styles.editorialNarrativeText, { color: themeColors.textPrimary }]}>
                    {selectedWhyCard.reason || selectedWhyCard.description}
                  </Text>
                </View>

                {/* Ethical Guardrails Note */}
                <View style={[styles.ethicalNote, { backgroundColor: themeColors.cardBgSecondary, borderColor: themeColors.border }]}>
                  <ShieldCheck size={16} color={themeColors.primary} />
                  <Text style={[styles.ethicalText, { color: themeColors.textSecondary }]}>
                    {language === 'hi'
                      ? 'प्रमोशन से पहले सुरक्षा: यदि कैश फ्लो तनाव या चिकित्सा आपातकाल पाया जाता है, तो लोन और उत्पाद ऑफ़र पूरी तरह दबा दिए जाते हैं।'
                      : language === 'gu'
                      ? 'પ્રમોશન પહેલાં સુરક્ષા: જો રોકડ પ્રવાહની કટોકટી અથવા તબીબી આંચકો જણાય, તો લોન ઑફર્સ આપમેળે અટકાવી દેવાય છે.'
                      : 'Protection Before Promotion: If cash flow stress or medical shocks are detected, product nudges are automatically suppressed.'}
                  </Text>
                </View>
              </ScrollView>

              {/* Bottom Done Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={[styles.doneBtn, { backgroundColor: themeColors.primary }]}
                  onPress={() => setWhyCard(null)}
                  delayPressIn={0}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneBtnText}>{t.common.done}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(17, 19, 24, 0.45)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    maxHeight: '82%',
    paddingBottom: 28,
  },
  handleWrap: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  dragHandle: {
    width: 38,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 22,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ECEEF2',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    marginTop: 3,
    lineHeight: 18,
  },
  closeCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F4F5F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 12,
  },
  content: {
    paddingHorizontal: 22,
    paddingTop: 16,
  },
  previewBox: {
    backgroundColor: '#F7F8F9',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 20,
  },
  previewEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    color: '#8C95A6',
    letterSpacing: 1.0,
    marginBottom: 4,
  },
  previewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#111318',
    letterSpacing: -0.2,
  },
  previewDesc: {
    fontSize: 13,
    fontWeight: '400',
    color: '#525866',
    marginTop: 2,
    lineHeight: 18,
  },
  editorialNarrativeWrap: {
    backgroundColor: '#F9FAFB',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#ECEEF2',
    marginBottom: 20,
  },
  editorialEyebrow: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    marginBottom: 8,
  },
  editorialNarrativeText: {
    fontSize: 15,
    fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif',
    lineHeight: 23,
    color: '#141414',
    letterSpacing: -0.2,
  },
  ethicalNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    backgroundColor: '#F0FDFA',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#CCFBF1',
    marginBottom: 10,
  },
  ethicalText: {
    fontSize: 12,
    fontWeight: '400',
    color: '#0F766E',
    lineHeight: 17,
    flex: 1,
  },
  footer: {
    paddingHorizontal: 22,
    paddingTop: 14,
  },
  doneBtn: {
    backgroundColor: '#111318',
    paddingVertical: 14,
    borderRadius: 99,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneBtnText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
});
