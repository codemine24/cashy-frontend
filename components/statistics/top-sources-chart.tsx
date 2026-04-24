import { P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { formatCurrency } from "@/utils/index";
import { View } from "react-native";
import Svg, { G, Path } from "react-native-svg";

export const colors = [
  "#02929A", // Teal
  "#4ECDC4", // Turquoise
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
];

export function TopSourcesChart({ data }: { data: any[] }) {
  const { isDark } = useTheme();

  if (!data?.length) {
    return (
      <View className="h-20 items-center justify-center">
        <P className="text-muted-foreground text-xs">No data available</P>
      </View>
    );
  }

  const size = 120;
  const centerX = size / 2;
  const centerY = size / 2;
  const strokeWidth = 10;
  const gap = 6;

  // Only show top 3-4 sources for radial chart to keep it clean
  const chartData = data.slice(0, 4);
  const maxAmount = Math.max(...data.map((item) => item.amount), 1);

  // Calculate total for percentages in legend
  const totalAmount = data.reduce((acc, item) => acc + item.amount, 0);

  return (
    <View className="flex-row items-center gap-x-6">
      <View className="items-center justify-center">
        <Svg height={size} width={size}>
          {chartData.map((item, i) => {
            const radius = size / 2 - i * (strokeWidth + gap) - strokeWidth;
            const percentage = (item.amount / maxAmount) * 100;
            const angle = (percentage / 100) * 359.9; // 359.9 to avoid path closing issues
            const color = colors[i % colors.length];

            // Background path (track)
            const trackD = `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 1 1 ${centerX - 0.01} ${centerY - radius}`;

            // Progress arc path logic
            const rad = ((angle - 90) * Math.PI) / 180;
            const x2 = centerX + radius * Math.cos(rad);
            const y2 = centerY + radius * Math.sin(rad);
            const largeArcFlag = angle > 180 ? 1 : 0;
            const d = `M ${centerX} ${centerY - radius} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

            return (
              <G key={i}>
                <Path
                  d={trackD}
                  fill="none"
                  stroke={isDark ? "#1E293B" : "#F1F5F9"}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
                <Path
                  d={d}
                  fill="none"
                  stroke={color}
                  strokeWidth={strokeWidth}
                  strokeLinecap="round"
                />
              </G>
            );
          })}
        </Svg>
      </View>

      <View className="flex-1 gap-y-1.5">
        {chartData.map((item, i) => {
          const itemPercentage = (item.amount / totalAmount) * 100;
          return (
            <View key={i} className="flex-row items-center gap-x-1.5">
              <View
                className="w-2 h-2 rounded-full"
                style={{ backgroundColor: colors[i % colors.length] }}
              />
              <View className="flex-1">
                <P
                  className="text-[10px] text-muted-foreground font-semibold leading-tight"
                  numberOfLines={1}
                >
                  {item.source}
                </P>
              </View>
              <P className="text-[10px] text-muted-foreground font-bold">
                {formatCurrency(item.amount, { showSymbol: false })}
              </P>
              <P className="text-[10px] text-muted-foreground font-bold opacity-70">
                ({Math.round(itemPercentage)}%)
              </P>
            </View>
          );
        })}
      </View>
    </View>
  );
}
