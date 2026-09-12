import React, { useState, useMemo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions } from 'react-native';
import Svg, {
  Path,
  Defs,
  LinearGradient,
  Stop,
  Circle,
  Line,
  Text as SvgText,
} from 'react-native-svg';
import { useAppTheme } from '../../theme';
import { typography, spacing, radii } from '../../theme';
import { TrendingDown, TrendingUp, Calendar, ArrowUpRight, ArrowDownLeft } from 'lucide-react-native';

const SCREEN_WIDTH = Dimensions.get('window').width;
const GRAPH_WIDTH = Math.max(300, SCREEN_WIDTH - 48);
const GRAPH_HEIGHT = 160;
const PADDING_TOP = 20;
const PADDING_BOTTOM = 30;
const PADDING_HORIZONTAL = 24;

type Timeframe = '1W' | '1M' | '3M';

interface DataPoint {
  label: string;
  amount: number;
  date: string;
  category: string;
  note: string;
}

const TIMEFRAME_DATA: Record<Timeframe, { points: DataPoint[]; inflow: number; outflow: number; avgBurn: number }> = {
  '1W': {
    points: [
      { label: 'Mon', amount: 840, date: 'Sep 08', category: 'Commute', note: 'Metro & Fuel' },
      { label: 'Tue', amount: 1450, date: 'Sep 09', category: 'Utilities', note: 'Electricity Bill' },
      { label: 'Wed', amount: 520, date: 'Sep 10', category: 'Food', note: 'Grocery & Snacks' },
      { label: 'Thu', amount: 2100, date: 'Sep 11', category: 'Shopping', note: 'Pharmacy Supplies' },
      { label: 'Fri', amount: 980, date: 'Sep 12', category: 'Commute', note: 'Metro & Fastag' },
      { label: 'Sat', amount: 1650, date: 'Sep 13', category: 'Dining', note: 'Family Lunch' },
      { label: 'Sun', amount: 420, date: 'Sep 14', category: 'Routine', note: 'Weekly Milk & Daily' },
    ],
    inflow: 18500,
    outflow: 7960,
    avgBurn: 1137,
  },
  '1M': {
    points: [
      { label: 'W1', amount: 6400, date: 'Aug 16 - 22', category: 'Rent / Home', note: 'Maintenance & Dues' },
      { label: 'W2', amount: 8900, date: 'Aug 23 - 29', category: 'Utilities', note: 'Bescom & Broadband' },
      { label: 'W3', amount: 5200, date: 'Aug 30 - Sep 05', category: 'Commute & Food', note: 'Metro pass & Dining' },
      { label: 'W4', amount: 7800, date: 'Sep 06 - 12', category: 'Insurance', note: 'Term Life Premium' },
      { label: 'W5', amount: 3500, date: 'Sep 13 - 14', category: 'Discretionary', note: 'Weekend Outflow' },
    ],
    inflow: 75000,
    outflow: 31800,
    avgBurn: 7950,
  },
  '3M': {
    points: [
      { label: 'Jun', amount: 28400, date: 'June 2026', category: 'Baseline Spend', note: 'Stable household run rate' },
      { label: 'Jul', amount: 34200, date: 'July 2026', category: 'Annual Dues', note: 'School & Vehicle Taxes' },
      { label: 'Aug', amount: 31100, date: 'August 2026', category: 'Standard Burn', note: 'Festive preparations' },
      { label: 'Sep', amount: 24320, date: 'September MTD', category: 'Current Month', note: '12% lower spending pace' },
    ],
    inflow: 225000,
    outflow: 118020,
    avgBurn: 29505,
  },
};

// Generates smooth cubic bezier curve SVG path
function generateSmoothCurve(points: { x: number; y: number }[]): string {
  if (points.length === 0) return '';
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`;

  let path = `M ${points[0].x} ${points[0].y}`;
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i > 0 ? points[i - 1] : points[i];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i != points.length - 2 ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    path += ` C ${cp1x.toFixed(1)} ${cp1y.toFixed(1)}, ${cp2x.toFixed(1)} ${cp2y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
  }
  return path;
}

export const BespokeFinancialGraph: React.FC = () => {
  const { colors, isDark } = useAppTheme();
  const [timeframe, setTimeframe] = useState<Timeframe>('1W');
  const [selectedIndex, setSelectedIndex] = useState<number>(4); // Default select Fri (Sep 12)

  const currentDataset = TIMEFRAME_DATA[timeframe];
  const points = currentDataset.points;
  const activePoint = points[selectedIndex] || points[points.length - 1];

  // Calculate coordinates
  const graphCoords = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.amount)) * 1.15;
    const minVal = 0;
    const usableWidth = GRAPH_WIDTH - PADDING_HORIZONTAL * 2;
    const usableHeight = GRAPH_HEIGHT - PADDING_TOP - PADDING_BOTTOM;

    return points.map((p, idx) => {
      const x = PADDING_HORIZONTAL + (idx / Math.max(1, points.length - 1)) * usableWidth;
      const normalizedY = (p.amount - minVal) / (maxVal - minVal);
      const y = PADDING_TOP + (1 - normalizedY) * usableHeight;
      return { x, y, ...p };
    });
  }, [points]);

  const curvePath = useMemo(() => generateSmoothCurve(graphCoords), [graphCoords]);

  const areaPath = useMemo(() => {
    if (graphCoords.length === 0) return '';
    const first = graphCoords[0];
    const last = graphCoords[graphCoords.length - 1];
    const bottom = GRAPH_HEIGHT - PADDING_BOTTOM + 6;
    return `${curvePath} L ${last.x} ${bottom} L ${first.x} ${bottom} Z`;
  }, [curvePath, graphCoords]);

  // Average line calculation
  const avgY = useMemo(() => {
    const maxVal = Math.max(...points.map((p) => p.amount)) * 1.15;
    const usableHeight = GRAPH_HEIGHT - PADDING_TOP - PADDING_BOTTOM;
    const normalizedAvg = currentDataset.avgBurn / maxVal;
    return PADDING_TOP + (1 - normalizedAvg) * usableHeight;
  }, [points, currentDataset.avgBurn]);

  const savingsRate = Math.round(
    ((currentDataset.inflow - currentDataset.outflow) / currentDataset.inflow) * 100
  );

  return (
    <View style={[styles.card, { backgroundColor: colors.cardBg, borderColor: colors.border }]}>
      {/* Header Row: Title & Timeframe Selector */}
      <View style={styles.headerRow}>
        <View>
          <Text style={[styles.headerSub, { color: colors.textSecondary }]}>CASH FLOW VELOCITY</Text>
          <Text style={[styles.headerTitle, { color: colors.textPrimary }]}>Spending Trajectory</Text>
        </View>

        {/* 3-Way Timeframe Segment */}
        <View style={[styles.timeframeSegment, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}>
          {(['1W', '1M', '3M'] as Timeframe[]).map((tf) => {
            const active = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                style={[
                  styles.timeframeBtn,
                  active && [styles.timeframeBtnActive, { backgroundColor: isDark ? colors.surfaceElevated : '#FFFFFF' }],
                ]}
                onPress={() => {
                  setTimeframe(tf);
                  setSelectedIndex(0);
                }}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.timeframeText,
                    { color: colors.textSecondary },
                    active && { color: colors.primaryRoyal, fontWeight: '700' },
                  ]}
                >
                  {tf}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Interactive Active Point Inspection Box */}
      <View style={[styles.inspectBox, { backgroundColor: isDark ? colors.cardBgSecondary : '#F0F4FA', borderColor: colors.border }]}>
        <View style={styles.inspectLeft}>
          <View style={styles.inspectDotWrap}>
            <View style={[styles.inspectDot, { backgroundColor: isDark ? colors.accent : '#002970' }]} />
            <Text style={[styles.inspectDate, { color: colors.textSecondary }]}>{activePoint.date}</Text>
          </View>
          <Text style={[styles.inspectNote, { color: colors.textPrimary }]}>
            {activePoint.category} • {activePoint.note}
          </Text>
        </View>

        <View style={styles.inspectRight}>
          <Text style={[styles.inspectAmount, { color: colors.textPrimary }]}>
            ₹{activePoint.amount.toLocaleString('en-IN')}
          </Text>
          <View style={styles.inspectTag}>
            <Text style={[styles.inspectTagText, { color: activePoint.amount > currentDataset.avgBurn ? colors.warning : colors.success }]}>
              {activePoint.amount > currentDataset.avgBurn ? 'Above Avg' : 'Optimal'}
            </Text>
          </View>
        </View>
      </View>

      {/* SVG Canvas */}
      <View style={styles.chartContainer}>
        <Svg width={GRAPH_WIDTH} height={GRAPH_HEIGHT}>
          <Defs>
            <LinearGradient id="gradientFill" x1="0" y1="0" x2="0" y2="1">
              <Stop
                offset="0%"
                stopColor={isDark ? '#38BDF8' : '#002970'}
                stopOpacity={isDark ? 0.35 : 0.22}
              />
              <Stop
                offset="100%"
                stopColor={isDark ? '#38BDF8' : '#002970'}
                stopOpacity={0.0}
              />
            </LinearGradient>
          </Defs>

          {/* Average Burn Benchmark Dashed Line */}
          <Line
            x1={PADDING_HORIZONTAL}
            y1={avgY}
            x2={GRAPH_WIDTH - PADDING_HORIZONTAL}
            y2={avgY}
            stroke={isDark ? '#334155' : '#CBD5E1'}
            strokeWidth={1}
            strokeDasharray="4, 4"
          />

          <SvgText
            x={GRAPH_WIDTH - PADDING_HORIZONTAL - 4}
            y={avgY - 6}
            fontSize="10"
            fontWeight="600"
            fill={isDark ? '#64748B' : '#94A3B8'}
            textAnchor="end"
          >
            Avg: ₹{Math.round(currentDataset.avgBurn).toLocaleString('en-IN')}
          </SvgText>

          {/* Area Gradient Fill */}
          <Path d={areaPath} fill="url(#gradientFill)" />

          {/* Smooth Bezier Spline Stroke */}
          <Path
            d={curvePath}
            fill="none"
            stroke={isDark ? '#38BDF8' : '#002970'}
            strokeWidth={3}
            strokeLinecap="round"
          />

          {/* Data Points & Touch Targets */}
          {graphCoords.map((coord, idx) => {
            const isSelected = selectedIndex === idx;
            return (
              <React.Fragment key={idx}>
                {/* Vertical subtle guideline on selected */}
                {isSelected && (
                  <Line
                    x1={coord.x}
                    y1={coord.y}
                    x2={coord.x}
                    y2={GRAPH_HEIGHT - PADDING_BOTTOM + 6}
                    stroke={isDark ? '#38BDF8' : '#002970'}
                    strokeWidth={1.5}
                    strokeDasharray="2, 2"
                    opacity={0.6}
                  />
                )}

                {/* Outer halo ring for selected point */}
                {isSelected && (
                  <Circle
                    cx={coord.x}
                    cy={coord.y}
                    r={9}
                    fill={isDark ? '#38BDF8' : '#002970'}
                    opacity={0.2}
                  />
                )}

                {/* Core Point Dot */}
                <Circle
                  cx={coord.x}
                  cy={coord.y}
                  r={isSelected ? 5 : 3.5}
                  fill={isSelected ? (isDark ? '#38BDF8' : '#002970') : colors.cardBg}
                  stroke={isDark ? '#38BDF8' : '#002970'}
                  strokeWidth={2}
                />

                {/* X-Axis Label */}
                <SvgText
                  x={coord.x}
                  y={GRAPH_HEIGHT - 8}
                  fontSize="10"
                  fontWeight={isSelected ? '700' : '500'}
                  fill={isSelected ? (isDark ? '#F8FAFC' : '#002970') : (isDark ? '#64748B' : '#94A3B8')}
                  textAnchor="middle"
                >
                  {coord.label}
                </SvgText>
              </React.Fragment>
            );
          })}
        </Svg>

        {/* Touch overlay row for exact tapping */}
        <View style={styles.touchOverlayRow}>
          {graphCoords.map((coord, idx) => (
            <TouchableOpacity
              key={idx}
              style={[styles.touchTarget, { left: coord.x - 20 }]}
              onPress={() => setSelectedIndex(idx)}
              activeOpacity={0.6}
            />
          ))}
        </View>
      </View>

      {/* Net Cash Flow Breakdown Ribbon */}
      <View style={[styles.flowRibbon, { backgroundColor: colors.cardBgSecondary, borderColor: colors.border }]}>
        <View style={styles.flowItem}>
          <View style={styles.flowIconWrapGreen}>
            <ArrowDownLeft size={13} color="#059669" />
          </View>
          <View>
            <Text style={[styles.flowLabel, { color: colors.textSecondary }]}>Total Inflow</Text>
            <Text style={[styles.flowValue, { color: '#059669' }]}>
              +₹{currentDataset.inflow.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={[styles.flowDivider, { backgroundColor: colors.border }]} />

        <View style={styles.flowItem}>
          <View style={styles.flowIconWrapRed}>
            <ArrowUpRight size={13} color="#DC2626" />
          </View>
          <View>
            <Text style={[styles.flowLabel, { color: colors.textSecondary }]}>Total Outflow</Text>
            <Text style={[styles.flowValue, { color: colors.textPrimary }]}>
              -₹{currentDataset.outflow.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        <View style={[styles.flowDivider, { backgroundColor: colors.border }]} />

        <View style={styles.flowItem}>
          <View style={styles.savingsPill}>
            <Text style={styles.savingsRateText}>{savingsRate}% Saved</Text>
          </View>
        </View>
      </View>

      {/* Proportional Category Allocation Bar */}
      <View style={styles.categoryBarWrap}>
        <View style={styles.categorySegments}>
          <View style={[styles.catSegment, { flex: 35, backgroundColor: '#002970' }]} />
          <View style={[styles.catSegment, { flex: 25, backgroundColor: '#059669' }]} />
          <View style={[styles.catSegment, { flex: 22, backgroundColor: '#D97706' }]} />
          <View style={[styles.catSegment, { flex: 18, backgroundColor: '#8B5CF6' }]} />
        </View>

        <View style={styles.categoryLegend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#002970' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Bills 35%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#059669' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Food 25%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#D97706' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Commute 22%</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendDot, { backgroundColor: '#8B5CF6' }]} />
            <Text style={[styles.legendText, { color: colors.textSecondary }]}>Others 18%</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: radii.xl,
    padding: spacing.md,
    borderWidth: 1,
    marginBottom: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  headerSub: {
    ...typography.tiny,
    fontWeight: '700',
    letterSpacing: 0.6,
  },
  headerTitle: {
    ...typography.h3,
    marginTop: 2,
  },
  timeframeSegment: {
    flexDirection: 'row',
    borderRadius: radii.full,
    padding: 3,
    borderWidth: 1,
  },
  timeframeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  timeframeBtnActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  timeframeText: {
    ...typography.tiny,
    fontWeight: '600',
  },
  inspectBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.lg,
    borderWidth: 1,
    marginBottom: spacing.xs,
  },
  inspectLeft: {
    flex: 1,
  },
  inspectDotWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  inspectDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  inspectDate: {
    ...typography.tiny,
    fontWeight: '600',
  },
  inspectNote: {
    ...typography.captionMedium,
  },
  inspectRight: {
    alignItems: 'flex-end',
  },
  inspectAmount: {
    ...typography.bodyBold,
    fontVariant: ['tabular-nums'],
  },
  inspectTag: {
    marginTop: 2,
  },
  inspectTagText: {
    ...typography.tiny,
    fontWeight: '700',
  },
  chartContainer: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 4,
  },
  touchOverlayRow: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  touchTarget: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 40,
  },
  flowRibbon: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radii.md,
    borderWidth: 1,
    marginTop: spacing.xs,
  },
  flowItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  flowIconWrapGreen: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowIconWrapRed: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  flowLabel: {
    ...typography.tiny,
  },
  flowValue: {
    ...typography.captionMedium,
    fontWeight: '700',
    fontVariant: ['tabular-nums'],
  },
  flowDivider: {
    width: 1,
    height: 24,
  },
  savingsPill: {
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: radii.full,
  },
  savingsRateText: {
    ...typography.tiny,
    fontWeight: '800',
    color: '#166534',
  },
  categoryBarWrap: {
    marginTop: spacing.sm,
  },
  categorySegments: {
    flexDirection: 'row',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    gap: 2,
  },
  catSegment: {
    height: '100%',
    borderRadius: 1,
  },
  categoryLegend: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.xs,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  legendDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  legendText: {
    ...typography.tiny,
  },
});
