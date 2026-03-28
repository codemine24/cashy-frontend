import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const StatisticsIconSvg = ({
  color,
  width,
  height,
  size,
  style,
  ...props
}: SvgProps & {
  size?: number;
  style?: { color?: string; width?: number; height?: number };
}) => (
  <Svg
    width={size || width || style?.width || 24}
    height={size || height || style?.height || 24}
    viewBox="0 0 24 24"
    {...props}
  >
    <Path
      fill={style?.color || color || "currentColor"}
      d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2m0 16H5V5h14zM9 17H7v-5h2zm4 0h-2V7h2zm4 0h-2v-7h2z"
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
