import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const CallIconSvg = ({
  color,
  size,
  width,
  height,
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
      stroke={color || "currentColor"}
      strokeLinejoin="round"
      strokeWidth="1.5"
      d="M7.829 16.171a20.9 20.9 0 0 1-4.846-7.614c-.573-1.564-.048-3.282 1.13-4.46l.729-.728a2.11 2.11 0 0 1 2.987 0l1.707 1.707a2.11 2.11 0 0 1 0 2.987l-.42.42a1.81 1.81 0 0 0 0 2.56l3.84 3.841a1.81 1.81 0 0 0 2.56 0l.421-.42a2.11 2.11 0 0 1 2.987 0l1.707 1.707a2.11 2.11 0 0 1 0 2.987l-.728.728c-1.178 1.179-2.896 1.704-4.46 1.131a20.9 20.9 0 0 1-7.614-4.846Z"
    />
  </Svg>
);

cssInterop(CallIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { CallIconSvg as CallIcon };
