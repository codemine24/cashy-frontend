import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const FilterIconSvg = ({ color, width, height, style, ...props }: SvgProps & { style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={width || style?.width || 24} height={height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <Path
      fill="none"
      stroke={style?.color || color || "currentColor"}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={1.5}
      d="M7 4v16m10-1V4m-7 3S7.79 4 7 4S4 7 4 7m16 10s-2.21 3-3 3s-3-3-3-3"
    />
  </Svg>
);
cssInterop(FilterIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { FilterIconSvg as FilterIcon };
