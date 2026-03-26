import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const FilterIconSvg = ({
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
      fill="none"
      stroke={style?.color || color || "currentColor"}
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M3 6h18M3 12h12M3 18h6"
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
