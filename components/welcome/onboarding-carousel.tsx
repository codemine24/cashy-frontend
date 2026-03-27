import { H2, Muted } from "@/components/ui/typography";
import { onboardingSlides, type OnboardingSlide } from "@/constants/onboarding";
import { ChevronRight } from "@/lib/icons";
import { useCallback, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  TouchableOpacity,
  View,
  ViewToken,
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

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goToNext = () => {
    if (activeIndex < onboardingSlides.length - 1) {
      flatListRef.current?.scrollToIndex({
        index: activeIndex + 1,
        animated: true,
      });
    } else {
      flatListRef.current?.scrollToIndex({ index: 0, animated: true });
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => (
    <View
      style={{ width: SLIDE_WIDTH }}
      className="flex-1 items-center justify-center"
    >
      <View
        className="overflow-hidden rounded-xl"
        style={{ width: SLIDE_WIDTH * 0.7, height: SLIDE_WIDTH * 1 }}
      >
        <Image
          source={item.image}
          style={{ width: "100%", height: "100%" }}
          resizeMode="cover"
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
        className="flex-1"
      />

      {/* Text content */}
      <View className="mt-20 pb-4">
        <H2>{onboardingSlides[activeIndex].title}</H2>
        <Muted className="mt-2">{onboardingSlides[activeIndex].subtitle}</Muted>
      </View>

      {/* Pagination dots + next arrow */}
      <View className="flex-row items-center justify-between pb-6">
        {/* Dots */}
        <View className="flex-row items-center gap-2">
          {onboardingSlides.map((_, index) => (
            <View
              key={index}
              className={`rounded-full ${
                index === activeIndex
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
          className="h-12 w-12 items-center justify-center rounded-full bg-primary/10"
        >
          <ChevronRight size={22} className="text-muted-foreground" />
        </TouchableOpacity>
      </View>
    </View>
  );
}
