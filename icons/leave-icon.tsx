import { cssInterop } from "nativewind";
import { G, Path, Svg, SvgProps } from "react-native-svg";

const LeaveIconSvg = ({ color, width, height, style, ...props }: SvgProps & { style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={width || style?.width || 24} height={height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <G fill="none" stroke={style?.color || color || "currentColor"} strokeLinecap="round" strokeWidth="1.5">
      <Path d="M20 7c-.077-1.418-.288-2.336-.864-3.038a4 4 0 0 0-.554-.554c-1.107-.908-2.75-.908-6.038-.908H12c-3.771 0-5.657 0-6.828 1.171S4 6.73 4 10.5v3c0 3.771 0 5.657 1.172 6.828S8.229 21.5 12 21.5h.544c3.288 0 4.932 0 6.038-.908q.304-.25.554-.555c.576-.702.787-1.62.864-3.037"/>
      <Path strokeLinejoin="round" d="M16 8s4 2.946 4 4s-4 4-4 4m3.5-4H9"/>
    </G>
  </Svg>
);
cssInterop(LeaveIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { LeaveIconSvg as LeaveIcon };
