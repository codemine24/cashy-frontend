import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const CloseIconSvg = ({ color, width, height, style, ...props }: SvgProps & { style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={width || style?.width || 24} height={height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <Path
      fill="none"
      stroke={style?.color || color || "currentColor"}
      strokeLinecap="round"
      strokeWidth={2}
      d="M20 20L4 4m16 0L4 20"
    />
  </Svg>
);
cssInterop(CloseIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { CloseIconSvg as CrossIcon };
