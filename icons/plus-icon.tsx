import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const PlusIconSvg = ({ color, width, height, style, ...props }: SvgProps & { style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={width || style?.width || 24} height={height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <Path
      fill={style?.color || color || "currentColor"}
      d="M18 12.998h-5v5a1 1 0 0 1-2 0v-5H6a1 1 0 0 1 0-2h5v-5a1 1 0 0 1 2 0v5h5a1 1 0 0 1 0 2"
    />
  </Svg>
);
cssInterop(PlusIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { PlusIconSvg as PlusIcon };
