import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { getTranslation } from '../../i18n';
import { HelpCircle, X, CheckCircle2, ShieldCheck, Cpu } from 'lucide-react-native';

export const WhyThisCard: React.FC = () => {
  const { selectedWhyCard, setWhyCard, language } = useCustomerStore();
  const t = getTranslation(language);

  if (!selectedWhyCard) return null;

  return (
    <Modal
      visible={Boolean(selectedWhyCard)}
      transparent
      animationType="fade"
      onRequestClose={() => setWhyCard(null)}
    >
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconCircle}>
                <Cpu size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>Explainable AI Insight</Text>
                <Text style={styles.subtitle}>Why this card appeared in your attention stack</Text>
              </View>
            </View>
            <TouchableOpacity onPress={() => setWhyCard(null)} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {/* Card Subject */}
            <View style={styles.cardPreviewBox}>
              <Text style={styles.previewLabel}>Surfaced Card</Text>
              <Text style={styles.previewTitle}>{selectedWhyCard.title}</Text>
              <Text style={styles.previewDesc}>{selectedWhyCard.description}</Text>
            </View>

            {/* Core Reason */}
            <View style={styles.section}>
              <Text style={styles.sectionHeading}>Primary Trigger Reason</Text>
              <View style={styles.reasonCard}>
                <Text style={styles.reasonText}>{selectedWhyCard.reason}</Text>
              </View>
            </View>

            {/* Signal Telemetry Checklist */}
            {selectedWhyCard.whyDetails && selectedWhyCard.whyDetails.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.sectionHeading}>Detected Real-Time Signals</Text>
                {selectedWhyCard.whyDetails.map((detail, idx) => (
                  <View key={idx} style={styles.signalRow}>
                    <CheckCircle2 size={16} color={colors.accent} style={styles.checkIcon} />
                    <Text style={styles.signalText}>{detail}</Text>
                  </View>
                ))}
              </View>
            )}

            {/* Priority Scoring Telemetry */}
            <View style={styles.telemetryCard}>
              <Text style={styles.telemetryTitle}>Decision Engine Metrics</Text>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Attention Layer:</Text>
                <Text style={styles.metricValue}>{selectedWhyCard.layer}</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Calculated Priority Score:</Text>
                <Text style={styles.metricValue}>{selectedWhyCard.priority} / 100</Text>
              </View>
              <View style={styles.metricRow}>
                <Text style={styles.metricLabel}>Confidence Coefficient:</Text>
                <Text style={styles.metricValue}>{Math.round(selectedWhyCard.confidence * 100)}%</Text>
              </View>
            </View>

            {/* Ethical Safeguard Note */}
            <View style={styles.ethicalNote}>
              <ShieldCheck size={16} color={colors.success} />
              <Text style={styles.ethicalText}>
                Guaranteed Ethical AI: We never use dark patterns, fake urgency, or predatory loan nudging.
              </Text>
            </View>
          </ScrollView>

          {/* Bottom Action */}
          <TouchableOpacity
            style={styles.doneButton}
            onPress={() => setWhyCard(null)}
            activeOpacity={0.8}
          >
            <Text style={styles.doneButtonText}>Understood</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.md,
  },
  sheet: {
    width: '100%',
    maxWidth: 520,
    maxHeight: '85%',
    backgroundColor: colors.cardBg,
    borderRadius: radii.xl,
    padding: spacing.lg,
    ...shadows.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flex: 1,
  },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h4,
    color: colors.textPrimary,
  },
  subtitle: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  closeBtn: {
    padding: spacing.xs,
  },
  content: {
    marginBottom: spacing.md,
  },
  cardPreviewBox: {
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    borderLeftWidth: 3,
    borderLeftColor: colors.primary,
  },
  previewLabel: {
    ...typography.tiny,
    color: colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  previewTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
  },
  previewDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  section: {
    marginBottom: spacing.md,
  },
  sectionHeading: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
  },
  reasonCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  reasonText: {
    ...typography.bodyMedium,
    color: '#1E40AF',
  },
  signalRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.xs,
    paddingRight: spacing.sm,
  },
  checkIcon: {
    marginTop: 2,
    marginRight: spacing.sm,
  },
  signalText: {
    ...typography.body,
    color: colors.textPrimary,
    flex: 1,
  },
  telemetryCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: radii.md,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: spacing.md,
  },
  telemetryTitle: {
    ...typography.captionMedium,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  metricRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  metricLabel: {
    ...typography.caption,
    color: colors.textSecondary,
  },
  metricValue: {
    ...typography.captionMedium,
    color: colors.textPrimary,
    fontWeight: '700',
  },
  ethicalNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  ethicalText: {
    ...typography.caption,
    color: '#065F46',
    flex: 1,
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  doneButtonText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
