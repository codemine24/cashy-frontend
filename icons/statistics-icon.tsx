import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const StatisticsIconSvg = ({ color, width, height, size, style, ...props }: SvgProps & { size?: number; style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={size || width || style?.width || 24} height={size || height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <Path
      fill={style?.color || color || "currentColor"}
      d="M12 20a1 1 0 0 1-1-1v-6a1 1 0 0 1 2 0v6a1 1 0 0 1-1 1M7 20a1 1 0 0 1-1-1v-3a1 1 0 0 1 2 0v3a1 1 0 0 1-1 1M17 20a1 1 0 0 1-1-1V9a1 1 0 0 1 2 0v10a1 1 0 0 1-1 1"
    />
  </Svg>
);

cssInterop(StatisticsIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { StatisticsIconSvg as StatisticsIcon };
