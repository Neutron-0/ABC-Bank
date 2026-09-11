import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { colors, typography, spacing, radii, shadows } from '../../theme';
import { useCustomerStore } from '../../state/customerStore';
import { Cpu, X, Database, ArrowDown, ShieldCheck, Layers, Bot } from 'lucide-react-native';

export const ArchitectureFlowModal: React.FC = () => {
  const { activeJourney, closeJourney } = useCustomerStore();

  if (activeJourney !== 'architecture_flow') return null;

  const pipelineSteps = [
    {
      step: '1. Multi-Source Financial Ingestion',
      desc: 'UPI Transactions, Core Banking Mandates, Account Aggregator (AA), Recurring Billing Cycles, Geolocation telemetry.',
      tech: 'Fastify / Express Synthetic Event Bus',
    },
    {
      step: '2. Feature Extraction & Temporal Modeling',
      desc: 'Extracts time windows (e.g. 8:40 AM morning commute), monthly baseline burn rates, anomaly scores.',
      tech: 'BehaviorAnalysisService',
    },
    {
      step: '3. Life-Stage & Health Detectors',
      desc: 'Flags major medical events (₹48.2k hospital bill), bonus salary credits (₹100k), and debt-to-income spikes.',
      tech: 'LifeStageService & FinancialHealthService',
    },
    {
      step: '4. Priority Decision & Ethical Guardrails Engine',
      desc: 'Computes Attention Score = Intent + Recency + Frequency + Relevance + Urgency - Penalties. STRICT: Loans suppressed during stress.',
      tech: 'RecommendationEngine (Zero-latency Deterministic / ML)',
    },
    {
      step: '5. Dynamic Attention Stack (DO / KNOW / PLAN / CONSIDER)',
      desc: 'Re-orders home screen ContextCards in real time. Never a static homepage.',
      tech: 'Adaptive Attention Stack UI',
    },
    {
      step: '6. Vernacular Conversational Layer (Mitra)',
      desc: 'Context-aware AI companion with memory in English, Hindi, and Gujarati.',
      tech: 'AssistantService',
    },
  ];

  return (
    <Modal visible={true} transparent animationType="slide" onRequestClose={closeJourney}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <View style={styles.headerLeft}>
              <View style={styles.iconWrap}>
                <Cpu size={20} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.title}>System Architecture</Text>
                <Text style={styles.subtitle}>End-to-End Decision Pipeline for Bharat</Text>
              </View>
            </View>
            <TouchableOpacity onPress={closeJourney} style={styles.closeBtn}>
              <X size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
            {pipelineSteps.map((step, idx) => (
              <View key={idx} style={styles.pipelineWrap}>
                <View style={styles.stepCard}>
                  <View style={styles.stepHeader}>
                    <Text style={styles.stepTitle}>{step.step}</Text>
                    <View style={styles.techBadge}>
                      <Text style={styles.techText}>{step.tech}</Text>
                    </View>
                  </View>
                  <Text style={styles.stepDesc}>{step.desc}</Text>
                </View>
                {idx < pipelineSteps.length - 1 && (
                  <View style={styles.arrowWrap}>
                    <ArrowDown size={18} color={colors.primary} />
                  </View>
                )}
              </View>
            ))}

            <View style={styles.ethicalPledge}>
              <ShieldCheck size={18} color={colors.success} />
              <Text style={styles.pledgeText}>
                Engine Guardrail: Ethical AI policy guarantees that financial vulnerability is met with assistance, never predatory lending.
              </Text>
            </View>
          </ScrollView>

          <TouchableOpacity style={styles.doneBtn} onPress={closeJourney}>
            <Text style={styles.doneBtnText}>Close Visualizer</Text>
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
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.cardBg,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    padding: spacing.lg,
    maxHeight: '90%',
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
  },
  iconWrap: {
    width: 38,
    height: 38,
    borderRadius: radii.full,
    backgroundColor: colors.primarySubtle,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    ...typography.h3,
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
  pipelineWrap: {
    alignItems: 'center',
  },
  stepCard: {
    width: '100%',
    backgroundColor: colors.cardBgSecondary,
    borderRadius: radii.lg,
    padding: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 4,
    gap: spacing.xs,
  },
  stepTitle: {
    ...typography.bodyBold,
    color: colors.textPrimary,
    flex: 1,
  },
  techBadge: {
    backgroundColor: colors.primarySubtle,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: radii.full,
  },
  techText: {
    ...typography.tiny,
    color: colors.primary,
    fontWeight: '700',
  },
  stepDesc: {
    ...typography.caption,
    color: colors.textSecondary,
    marginTop: 2,
  },
  arrowWrap: {
    paddingVertical: 4,
  },
  ethicalPledge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: colors.successLight,
    padding: spacing.md,
    borderRadius: radii.lg,
    marginTop: spacing.md,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  pledgeText: {
    ...typography.caption,
    color: '#065F46',
    flex: 1,
  },
  doneBtn: {
    backgroundColor: colors.primary,
    borderRadius: radii.md,
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  doneBtnText: {
    ...typography.bodyBold,
    color: colors.textWhite,
  },
});
