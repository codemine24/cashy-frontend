import { P } from "@/components/ui/typography";
import { useTheme } from "@/context/theme-context";
import { View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

export const colors = [
  "#02929A", // Teal
  "#FF6B6B", // Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Blue
  "#FFA07A", // Light Salmon
  "#98D8C8", // Mint
  "#FFD93D", // Yellow
  "#6BCF7F", // Green
  "#C56CF0", // Purple
  "#FF8CC3", // Pink
];

export function ExpenseByCategoryChart({ data }: { data: any[] }) {
  const size = 90;
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size / 2 - 8;
  const strokeWidth = 12;
  const { isDark } = useTheme();

  if (!data?.length)
    return (
      <View className="h-16 items-center justify-center">
        <P className="text-[8px] text-muted-foreground">No data</P>
      </View>
    );

  let currentAngle = 0;

  return (
    <View className="items-center justify-center ml-10">
      <Svg height={size} width={size} viewBox={`0 0 ${size} ${size}`}>
        {data.map((cat, i) => {
          const sliceAngle = (cat.percentage / 100) * 360;
          const startAngle = currentAngle;
          currentAngle += sliceAngle;

          // Donut slice path logic
          const x1 =
            centerX + radius * Math.cos((Math.PI * (startAngle - 90)) / 180);
          const y1 =
            centerY + radius * Math.sin((Math.PI * (startAngle - 90)) / 180);
          const x2 =
            centerX + radius * Math.cos((Math.PI * (currentAngle - 90)) / 180);
          const y2 =
            centerY + radius * Math.sin((Math.PI * (currentAngle - 90)) / 180);

          const largeArcFlag = sliceAngle > 180 ? 1 : 0;
          const d = `M ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`;

          // Always use distinct colors from our palette, ignore API color
          const sliceColor = colors[i % colors.length];

          return (
            <Path
              key={i}
              d={d}
              fill="none"
              stroke={sliceColor}
              strokeWidth={strokeWidth}
            />
          );
        })}
        {/* Inner hole */}
        <Circle
          cx={centerX}
          cy={centerY}
          r={radius - strokeWidth / 2}
          fill={isDark ? "#0F172A" : "white"}
        />
      </Svg>
    </View>
  );
}
