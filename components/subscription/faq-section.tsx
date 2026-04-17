import { ChevronDown } from "@/lib/icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";

export function FAQSection() {
  const router = useRouter();

  return (
    <View className="mb-8">
      <Text className="text-xl font-bold text-foreground mb-3 px-1">FAQs</Text>
      <View className="bg-card rounded-3xl border border-border px-5">
        <FAQItem
          question="Is the lifetime deal really a one-time payment?"
          answer="Yes! You pay once and get access to all current and future Pro features forever. No subscriptions, no hidden fees ever."
        />
        <FAQItem
          question="How do I restore my purchase on a new device?"
          answer="Your subscription is linked to your Store account (Apple or Google). Simply use the 'Restore Purchase' option in settings or log in with the same account to automatically sync your Pro status."
        />
        <FAQItem
          question="Can I share my subscription with my family?"
          answer="Yes, our Pro plan supports Family Sharing where applicable through the App Store or Play Store. You can also share specific wallets with other users directly."
        />
        <FAQItem
          isLast
          question="Is my financial data secure?"
          answer="Security is our top priority. We use end-to-end encryption for your data and never share your financial information with third-party services. Your data remains private and secure."
        />
      </View>

      <View className="mt-6 p-4 flex-row items-center justify-between bg-card rounded-3xl border border-border">
        <View className="flex-1 pr-4">
          <Text className="text-base font-bold text-foreground">
            Still have questions?
          </Text>
          <Text className="text-sm text-muted-foreground mt-1">
            Can&apos;t find the answer you&apos;re looking for? Please chat to
            our friendly team.
          </Text>
        </View>
        <TouchableOpacity
          onPress={() => router.navigate("/settings/contact-us")}
          className="bg-foreground px-5 py-2.5 rounded-full"
        >
          <Text className="text-sm font-bold text-background">Contact</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

export function FAQItem({
  question,
  answer,
  isLast,
}: {
  question: string;
  answer: string;
  isLast?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <View className={`${isLast ? "" : "border-b border-border/50"}`}>
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setIsOpen(!isOpen)}
        className="py-4 flex-row items-center justify-between"
      >
        <Text className="flex-1 text-base font-medium text-foreground pr-4 leading-relaxed">
          {question}
        </Text>
        <ChevronDown
          size={18}
          className={isOpen ? "text-foreground" : "text-muted-foreground"}
        />
      </TouchableOpacity>
      {isOpen && (
        <View className="pb-4">
          <Text className="text-sm text-muted-foreground leading-relaxed">
            {answer}
          </Text>
        </View>
      )}
    </View>
  );
}
