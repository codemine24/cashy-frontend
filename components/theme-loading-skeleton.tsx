import { View } from "react-native";

export const ThemeLoadingSkeleton = () => {
  return (
    <View
           className="flex-1 items-center justify-center bg-background"
           style={{ backgroundColor: "#f8fafc" }}
         >
           <View className="w-full max-w-sm gap-4 px-6">
             <View className="h-8 bg-muted rounded-lg w-3/4 animate-pulse" />
             <View className="h-6 bg-muted rounded-lg w-1/2 animate-pulse" />
             <View className="h-4 bg-muted rounded-lg w-full animate-pulse" />
             <View className="h-4 bg-muted rounded-lg w-2/3 animate-pulse" />
             <View className="mt-8 space-y-3">
               <View className="h-12 bg-muted rounded-lg w-full animate-pulse" />
               <View className="h-12 bg-muted rounded-lg w-full animate-pulse" />
               <View className="h-12 bg-muted rounded-lg w-3/4 animate-pulse" />
             </View>
           </View>
         </View>
  );
};