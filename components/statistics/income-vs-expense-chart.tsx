import { View } from "react-native";
import Svg, { Defs, LinearGradient, Rect, Stop } from "react-native-svg";

export function IncomeVsExpenseChart({
  income,
  expense,
}: {
  income: number;
  expense: number;
}) {
  const chartHeight = 90;
  const barWidth = 24;
  const gap = 20;
  const maxVal = Math.max(income, expense, 1);
  const incomeHeight = (income / maxVal) * chartHeight;
  const expenseHeight = (expense / maxVal) * chartHeight;

  return (
    <View className="items-center justify-center ml-12">
      <Svg height={chartHeight + 10} width={barWidth * 2 + gap}>
        <Defs>
          <LinearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#02929A" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#02929A" stopOpacity="0.3" />
          </LinearGradient>
          <LinearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor="#FF6B6B" stopOpacity="0.8" />
            <Stop offset="1" stopColor="#FF6B6B" stopOpacity="0.3" />
          </LinearGradient>
        </Defs>

        {/* Income Bar */}
        <Rect
          x={0}
          y={chartHeight - incomeHeight}
          width={barWidth}
          height={incomeHeight}
          fill="url(#incomeGrad)"
          rx="4"
        />

        {/* Expense Bar */}
        <Rect
          x={barWidth + gap}
          y={chartHeight - expenseHeight}
          width={barWidth}
          height={expenseHeight}
          fill="url(#expenseGrad)"
          rx="4"
        />
      </Svg>
    </View>
  );
}
