import { cssInterop } from "nativewind";
import { Path, Svg, SvgProps } from "react-native-svg";

const SearchIconSvg = ({ color, width, height, style, ...props }: SvgProps & { style?: { color?: string; width?: number; height?: number } }) => (
  <Svg width={width || style?.width || 24} height={height || style?.height || 24} viewBox="0 0 24 24" {...props}>
    <Path
      fill={style?.color || color || "currentColor"}
      d="m18.031 16.617l4.283 4.282l-1.415 1.415l-4.282-4.283A8.96 8.96 0 0 1 11 20c-4.968 0-9-4.032-9-9s4.032-9 9-9s9 4.032 9 9a8.96 8.96 0 0 1-1.969 5.617m-2.006-.742A6.98 6.98 0 0 0 18 11c0-3.867-3.133-7-7-7s-7 3.133-7 7s3.133 7 7 7a6.98 6.98 0 0 0 4.875-1.975z"
    />
  </Svg>
);
cssInterop(SearchIconSvg, {
  className: {
    target: "style",
    nativeStyleToProp: {
      color: true,
      width: true,
      height: true,
    },
  },
});

export { SearchIconSvg as SearchIcon };
