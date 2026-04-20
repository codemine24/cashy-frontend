import { H2, Muted } from "@/components/ui/typography";
import { onboardingSlides, type OnboardingSlide } from "@/constants/onboarding";
import { ChevronLeft, ChevronRight } from "@/lib/icons";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Dimensions,
  FlatList,
  TouchableOpacity,
  View,
  ViewToken,
} from "react-native";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const SLIDE_WIDTH = SCREEN_WIDTH;

const SVG_WIDTH = SCREEN_WIDTH * 0.96;
const SVG_HEIGHT = SVG_WIDTH * 1.45;

const AUTO_SLIDE_INTERVAL = 4500;

export function OnboardingCarousel() {
  const flatListRef = useRef<FlatList<OnboardingSlide>>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const activeIndexRef = useRef(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const scrollToIndex = useCallback((index: number) => {
    flatListRef.current?.scrollToIndex({ index, animated: true });
  }, []);

  const resetTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      const next = (activeIndexRef.current + 1) % onboardingSlides.length;
      scrollToIndex(next);
    }, AUTO_SLIDE_INTERVAL);
  }, [scrollToIndex]);

  useEffect(() => {
    resetTimer();
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [resetTimer]);

  const onViewableItemsChanged = useCallback(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0 && viewableItems[0].index != null) {
        activeIndexRef.current = viewableItems[0].index;
        setActiveIndex(viewableItems[0].index);
      }
    },
    [],
  );

  const viewabilityConfig = useRef({
    viewAreaCoveragePercentThreshold: 50,
  }).current;

  const goToNext = () => {
    const next = (activeIndexRef.current + 1) % onboardingSlides.length;
    scrollToIndex(next);
    resetTimer();
  };

  const goToPrev = () => {
    const prev = activeIndexRef.current - 1;
    if (prev >= 0) {
      scrollToIndex(prev);
      resetTimer();
    }
  };

  const renderSlide = ({ item }: { item: OnboardingSlide }) => {
    const SvgImage = item.image;

    return (
      <View style={{ width: SLIDE_WIDTH }} className="flex-1 items-center justify-center">
        <View
          className="overflow-hidden rounded-xl"
          style={{ width: SVG_WIDTH, height: SVG_HEIGHT }}
        >
          <SvgImage width={SVG_WIDTH} height={SVG_HEIGHT} />
        </View>
      </View>
    );
  };

  return (
    <View className="flex-1">
      {/* Carousel — swipe disabled */}
      <FlatList
        ref={flatListRef}
        data={onboardingSlides}
        renderItem={renderSlide}
        keyExtractor={(item) => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        bounces={false}
        scrollEnabled={false}
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
      <View className="mt-4 pb-4">
        <H2>{onboardingSlides[activeIndex].title}</H2>
        <Muted className="mt-2">{onboardingSlides[activeIndex].subtitle}</Muted>
      </View>

      {/* Pagination dots + prev/next arrows */}
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

        {/* Arrow buttons */}
        <View className="flex-row items-center gap-2">
          {activeIndex > 0 && (
            <TouchableOpacity
              onPress={goToPrev}
              activeOpacity={0.7}
              className="h-12 w-12 items-center justify-center rounded-full bg-primary/10"
            >
              <ChevronLeft size={22} className="text-muted-foreground" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            onPress={goToNext}
            activeOpacity={0.7}
            className="h-12 w-12 items-center justify-center rounded-full bg-primary/10"
          >
            <ChevronRight size={22} className="text-muted-foreground" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
