import { onboardingSlides, type OnboardingSlide } from "@/constants/onboarding";

import { ChevronRight } from "@/lib/icons";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Text,
  TouchableOpacity,
  View,
  ViewToken
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;

export function OnboardingCarousel() {
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const goToNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({ index: activeIndex + 1, animated: true });
    } else {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View style={{ width: SLIDE_WIDTH }} className="items-center px-6">
      {/* Phone mockup image */}
      <View
        className="items-center justify-center overflow-hidden rounded-3xl"
        style={{ width: SLIDE_WIDTH * 0.7, height: SLIDE_WIDTH * 0.95 }}
      >
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%" }}
          resizeMode="contain"
        />
      </View>
    </View>
  );

  return (
    <View className="flex-1">
      {/* Carousel */}
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        onViewableItemsChanged={onViewableItemsChanged}
        viewabilityConfig={viewabilityConfig}
        getItemLayout={(_, index) => ({
          length: SLIDE_WIDTH,
          offset: SLIDE_WIDTH * index,
          index,
        })}
      />

      {/* Text content */}
      <View className="mt-20 px-4 pb-4">
        <Text className="text-2xl font-bold text-foreground">
          {onboardingSlides[activeIndex].title}
        </Text>
        <Text className="mt-2 text-base text-muted-foreground leading-6">
          {onboardingSlides[activeIndex].subtitle}
        </Text>
      </View>

      {/* Pagination dots + next arrow */}
      <View className="flex-row items-center justify-between px-8 pb-6">
        {/* Dots */}
        <View className="flex-row items-center gap-2">
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${index === activeIndex
                ? "h-2.5 w-2.5 bg-primary"
                : "h-2 w-2 bg-border"
                }`}
            />
          ))}
        </View>

        {/* Next button */}
        <TouchableOpacity
          onPress={goToNext}
          activeOpacity={0.7}
          className="h-12 w-12 items-center justify-center rounded-full bg-muted"
        >
          <ChevronRight size={22} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
