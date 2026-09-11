import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TouchableWithoutFeedback } from 'react-native';
import { colors, typography, spacing, radii } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { Check, X, ShieldCheck } from 'lucide-react-native';

export const WhyThisCard: React.FC = () => {
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
            <View style={styles.sheet}>
              {/* Drag Handle Indicator */}
              <View style={styles.handleWrap}>
                <View style={styles.dragHandle} />
              </View>

              {/* Header */}
              <View style={styles.header}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.title}>Why this appeared</Text>
                  <Text style={styles.subtitle}>
                    Our system surfaces actions based on your real life, not fixed sales targets.
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setWhyCard(null)}
                  style={styles.closeCircle}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <X size={16} color="#525866" />
                </TouchableOpacity>
              </View>

              <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
                {/* Surfaced Action Preview */}
                <View style={styles.previewBox}>
                  <Text style={styles.previewEyebrow}>CURRENT CONTEXT</Text>
                  <Text style={styles.previewTitle}>{selectedWhyCard.title}</Text>
                  <Text style={styles.previewDesc}>{selectedWhyCard.description}</Text>
                </View>

                {/* Primary Trigger Statement */}
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>We noticed:</Text>
                  {selectedWhyCard.whyDetails && selectedWhyCard.whyDetails.length > 0 ? (
                    selectedWhyCard.whyDetails.map((detail, idx) => (
                      <View key={idx} style={styles.checkRow}>
                        <View style={styles.checkCircle}>
                          <Check size={12} color="#059669" strokeWidth={3} />
                        </View>
                        <Text style={styles.checkText}>{detail}</Text>
                      </View>
                    ))
                  ) : (
                    <View style={styles.checkRow}>
                      <View style={styles.checkCircle}>
                        <Check size={12} color="#059669" strokeWidth={3} />
                      </View>
                      <Text style={styles.checkText}>{selectedWhyCard.reason}</Text>
                    </View>
                  )}
                </View>

                {/* Ethical Guardrails Note */}
                <View style={styles.ethicalNote}>
                  <ShieldCheck size={16} color="#0D9488" />
                  <Text style={styles.ethicalText}>
                    Protection Before Promotion: If cash flow stress or medical shocks are detected, product nudges are automatically suppressed.
                  </Text>
                </View>
              </ScrollView>

              {/* Bottom Done Button */}
              <View style={styles.footer}>
                <TouchableOpacity
                  style={styles.doneBtn}
                  onPress={() => setWhyCard(null)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.doneBtnText}>Understood</Text>
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
  section: {
    marginBottom: 20,
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111318',
    marginBottom: 12,
  },
  checkRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 12,
  },
  checkCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  checkText: {
    fontSize: 13,
    fontWeight: '500',
    color: '#111318',
    lineHeight: 19,
    flex: 1,
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
