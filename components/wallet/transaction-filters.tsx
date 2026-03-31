import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FlatList,
  Platform,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppModal } from "@/components/app-modal";
import { Calendar, Check, ChevronDown, Search, X } from "@/lib/icons";
import DateTimePicker from "@react-native-community/datetimepicker";

// ─── Types ────────────────────────────────────────────────────────────────────

export type EntryTypeFilter = "ALL" | "IN" | "OUT";

export type DatePreset =
  | "all_time"
  | "today"
  | "yesterday"
  | "this_month"
  | "last_month"
  | "last_day"
  | "last_week"
  | "last_year"
  | "date"
  | "date_range";

export interface MemberOption {
  id: string;
  name: string;
  email: string;
}

export interface CategoryOption {
  id: string;
  title: string;
}

export interface TransactionFilterValues {
  entryType: EntryTypeFilter;
  datePreset: DatePreset;
  singleDate: Date | null;
  dateRangeStart: Date | null;
  dateRangeEnd: Date | null;
  selectedMemberId: string | null;
  selectedCategoryIds: string[];
}

export const DEFAULT_FILTERS: TransactionFilterValues = {
  entryType: "ALL",
  datePreset: "all_time",
  singleDate: null,
  dateRangeStart: null,
  dateRangeEnd: null,
  selectedMemberId: null,
  selectedCategoryIds: [],
};

/**
 * Build query params from filter values — ready to plug into your API hook.
 * Returns only non-empty values.
 */
export function buildFilterParams(filters: TransactionFilterValues) {
  const params: Record<string, string | string[] | undefined> = {};

  if (filters.entryType !== "ALL") {
    params.type = filters.entryType;
  }

  const fmt = (d: Date) =>
    `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;

  switch (filters.datePreset) {
    case "today":
      params.period = "today";
      // params.start_date = fmt(today);
      // params.end_date = fmt(today);
      break;
    case "date":
      params.date = fmt(filters.singleDate!);
      break;
    case "yesterday": {
      params.period = "yesterday";
      // const y = new Date(today);
      // y.setDate(y.getDate() - 1);
      // params.start_date = fmt(y);
      // params.end_date = fmt(y);
      break;
    }
    case "this_month":
      params.period = "this_month";
      // params.start_date = fmt(new Date(today.getFullYear(), today.getMonth(), 1));
      // params.end_date = fmt(today);
      break;
    case "last_month": {
      params.period = "last_month";
      // const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      // const end = new Date(today.getFullYear(), today.getMonth(), 0);
      // params.start_date = fmt(start);
      // params.end_date = fmt(end);
      break;
    }
    case "last_day": {
      params.period = "last_day";
      // const y = new Date(today);
      // y.setDate(y.getDate() - 1);
      // params.start_date = fmt(y);
      // params.end_date = fmt(y);
      break;
    }
    case "last_week": {
      params.period = "last_week";
      // const start = new Date(today.getFullYear(), today.getMonth(), today.getDate() - 7);
      // const end = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      // params.start_date = fmt(start);
      // params.end_date = fmt(end);
      break;
    }
    case "last_year": {
      params.period = "last_year";
      // const start = new Date(today.getFullYear() - 1, today.getMonth(), 1);
      // const end = new Date(today.getFullYear() - 1, today.getMonth(), 0);
      // params.start_date = fmt(start);
      // params.end_date = fmt(end);
      break;
    }
    case "date_range":
      if (filters.dateRangeStart) params.from_date = fmt(filters.dateRangeStart);
      if (filters.dateRangeEnd) params.to_date = fmt(filters.dateRangeEnd);
      break;
  }

  if (filters.selectedMemberId) {
    params.member_id = filters.selectedMemberId;
  }

  if (filters.selectedCategoryIds.length > 0) {
    params.category_ids = filters.selectedCategoryIds;
  }

  return params;
}

// ─── Props ────────────────────────────────────────────────────────────────────

interface TransactionFiltersProps {
  filters: TransactionFilterValues;
  onApplyFilters: (filters: TransactionFilterValues) => void;
  /** Pass book.data.others_member or similar */
  members: MemberOption[];
  /** Pass category list from useGetCategories */
  categories: CategoryOption[];
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TransactionFilters({
  filters,
  onApplyFilters,
  members,
  categories,
}: TransactionFiltersProps) {
  const [activeModal, setActiveModal] = useState<
    "entry_type" | "date" | "members" | "category" | null
  >(null);

  const closeModal = () => setActiveModal(null);

  // ── Active flags ──
  const isEntryTypeActive = filters.entryType !== "ALL";
  const isDateActive = filters.datePreset !== "all_time";
  const isMemberActive = !!filters.selectedMemberId;
  const isCategoryActive = filters.selectedCategoryIds.length > 0;

  // ── Labels: generic default → selected value when active ──
  const entryTypeLabel = isEntryTypeActive
    ? (filters.entryType === "IN" ? "Cash In" : "Cash Out")
    : "Entry Type";

  const dateLabel = useMemo(() => {
    if (!isDateActive) return "Select Date";
    switch (filters.datePreset) {
      case "today":
        return "Today";
      case "yesterday":
        return "Yesterday";
      case "this_month":
        return "This Month";
      case "last_month":
        return "Last Month";
      case "last_day":
        return "Last Day";
      case "last_week":
        return "Last Week";
      case "last_year":
        return "Last Year";
      case "date":
        return filters.singleDate
          ? filters.singleDate.toLocaleDateString("en-GB", {
            day: "2-digit",
            month: "short",
          })
          : "Select Date";
      case "date_range": {
        const s = filters.dateRangeStart;
        const e = filters.dateRangeEnd;
        if (s && e) {
          const fmt = (d: Date) =>
            d.toLocaleDateString("en-GB", { day: "2-digit", month: "short" });
          return `${fmt(s)} - ${fmt(e)}`;
        }
        return "Date Range";
      }
      default:
        return "Select Date";
    }
  }, [isDateActive, filters.datePreset, filters.singleDate, filters.dateRangeStart, filters.dateRangeEnd]);

  const memberLabel = useMemo(() => {
    if (!isMemberActive) return "Members";
    const found = members.find((m) => m.id === filters.selectedMemberId);
    return found ? found.name || found.email : "Members";
  }, [isMemberActive, filters.selectedMemberId, members]);

  const categoryLabel = useMemo(() => {
    if (!isCategoryActive) return "Category";
    if (filters.selectedCategoryIds.length === 1) {
      const c = categories.find((c) => c.id === filters.selectedCategoryIds[0]);
      return c?.title || "1 selected";
    }
    return `${filters.selectedCategoryIds.length} selected`;
  }, [isCategoryActive, filters.selectedCategoryIds, categories]);

  return (
    <>
      {/* ── Filter Chips Bar ── */}
      <View className="bg-background">
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingHorizontal: 16, paddingVertical: 16 }}
        >
          <View className="flex-row items-center gap-2">
            <FilterChip
              label={entryTypeLabel}
              active={isEntryTypeActive}
              onPress={() => setActiveModal("entry_type")}
            />
            <FilterChip
              label={dateLabel}
              active={isDateActive}
              onPress={() => setActiveModal("date")}
            />
            <FilterChip
              label={memberLabel}
              active={isMemberActive}
              onPress={() => setActiveModal("members")}
            />
            <FilterChip
              label={categoryLabel}
              active={isCategoryActive}
              onPress={() => setActiveModal("category")}
            />
          </View>
        </ScrollView>
      </View>

      {/* ── Entry Type Modal ── */}
      <EntryTypeModal
        visible={activeModal === "entry_type"}
        current={filters.entryType}
        onClose={closeModal}
        onApply={(val) => {
          onApplyFilters({ ...filters, entryType: val });
          closeModal();
        }}
      />

      {/* ── Date Modal ── */}
      <DateFilterModal
        visible={activeModal === "date"}
        currentPreset={filters.datePreset}
        currentSingleDate={filters.singleDate}
        currentRangeStart={filters.dateRangeStart}
        currentRangeEnd={filters.dateRangeEnd}
        onClose={closeModal}
        onApply={(preset, singleDate, rangeStart, rangeEnd) => {
          onApplyFilters({
            ...filters,
            datePreset: preset,
            singleDate,
            dateRangeStart: rangeStart,
            dateRangeEnd: rangeEnd,
          });
          closeModal();
        }}
      />

      {/* ── Members Modal ── */}
      <MembersFilterModal
        visible={activeModal === "members"}
        members={members}
        currentMemberId={filters.selectedMemberId}
        onClose={closeModal}
        onApply={(memberId) => {
          onApplyFilters({ ...filters, selectedMemberId: memberId });
          closeModal();
        }}
      />

      {/* ── Category Modal ── */}
      <CategoryFilterModal
        visible={activeModal === "category"}
        categories={categories}
        currentIds={filters.selectedCategoryIds}
        onClose={closeModal}
        onApply={(ids) => {
          onApplyFilters({ ...filters, selectedCategoryIds: ids });
          closeModal();
        }}
      />
    </>
  );
}

// ─── Filter Chip ──────────────────────────────────────────────────────────────

function FilterChip({
  label,
  active,
  onPress,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className={`flex-row items-center gap-1.5 px-3.5 py-2 rounded-full border ${active
        ? "bg-primary/10 border-primary"
        : "bg-card border-border"
        }`}
    >
      <Text
        className={`text-[13px] font-semibold ${active ? "text-primary" : "text-foreground"
          }`}
        numberOfLines={1}
      >
        {label}
      </Text>
      <ChevronDown
        size={14}
        className={active ? "text-primary" : "text-muted-foreground"}
      />
    </TouchableOpacity>
  );
}

// ─── Shared Modal Shell ───────────────────────────────────────────────────────

function BottomSheetModal({
  visible,
  title,
  onClose,
  children,
  footer,
}: {
  visible: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
  footer: React.ReactNode;
}) {
  return (
    <AppModal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <TouchableOpacity
          activeOpacity={1}
          onPress={onClose}
          className="flex-1"
        />
        <View className="bg-card rounded-t-3xl max-h-[80%]">
          {/* Header */}
          <View className="flex-row items-center justify-between px-5 pt-5 pb-3">
            <Text className="text-lg font-bold text-foreground">{title}</Text>
            <TouchableOpacity
              onPress={onClose}
              className="w-8 h-8 bg-muted rounded-full items-center justify-center"
            >
              <X size={16} className="text-muted-foreground" />
            </TouchableOpacity>
          </View>
          <View className="w-full h-[1px] bg-border" />

          {/* Content */}
          {children}

          {/* Footer */}
          <View className="w-full h-[1px] bg-border" />
          {footer}
        </View>
      </View>
    </AppModal>
  );
}

// ─── Radio Row ────────────────────────────────────────────────────────────────

function RadioRow({
  label,
  selected,
  onPress,
}: {
  label: string;
  selected: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-5 py-3.5 gap-3"
    >
      <View
        className={`w-5 h-5 rounded-full border-2 items-center justify-center ${selected ? "border-primary bg-primary" : "border-muted-foreground"
          }`}
      >
        {selected && <Check size={12} color="#ffffff" />}
      </View>
      <Text className="text-[15px] text-foreground flex-1">{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Checkbox Row ─────────────────────────────────────────────────────────────

function CheckboxRow({
  label,
  checked,
  onPress,
}: {
  label: string;
  checked: boolean;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      className="flex-row items-center px-5 py-3.5 gap-3"
    >
      <View
        className={`w-5 h-5 rounded-md border-2 items-center justify-center ${checked ? "border-primary bg-primary" : "border-muted-foreground"
          }`}
      >
        {checked && <Check size={12} color="#ffffff" />}
      </View>
      <Text className="text-[15px] text-foreground flex-1">{label}</Text>
    </TouchableOpacity>
  );
}

// ─── Footer Buttons ───────────────────────────────────────────────────────────

function ModalFooter({
  onClear,
  onApply,
  applyDisabled,
}: {
  onClear: () => void;
  onApply: () => void;
  applyDisabled: boolean;
}) {
  return (
    <View className="flex-row gap-3 px-5 pt-3 pb-6">
      <TouchableOpacity
        onPress={onClear}
        activeOpacity={0.7}
        className="flex-1 py-3 rounded-xl bg-muted items-center"
      >
        <Text className="text-foreground font-bold text-[14px]">Clear</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={onApply}
        disabled={applyDisabled}
        activeOpacity={0.7}
        className={`flex-1 py-3 rounded-xl items-center ${applyDisabled ? "bg-primary/30" : "bg-primary"
          }`}
      >
        <Text
          className={`font-bold text-[14px] ${applyDisabled ? "text-white/50" : "text-white"
            }`}
        >
          Apply
        </Text>
      </TouchableOpacity>
    </View>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 1. ENTRY TYPE MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function EntryTypeModal({
  visible,
  current,
  onClose,
  onApply,
}: {
  visible: boolean;
  current: EntryTypeFilter;
  onApply: (val: EntryTypeFilter) => void;
  onClose: () => void;
}) {
  const [draft, setDraft] = useState<EntryTypeFilter>(current);

  useEffect(() => {
    if (visible) setDraft(current);
  }, [visible, current]);

  const hasChanged = draft !== current;

  return (
    <BottomSheetModal
      visible={visible}
      title="Entry Type"
      onClose={onClose}
      footer={
        <ModalFooter
          onClear={() => {
            onApply("ALL");
          }}
          onApply={() => onApply(draft)}
          applyDisabled={!hasChanged}
        />
      }
    >
      <View className="py-2">
        <RadioRow label="All" selected={draft === "ALL"} onPress={() => setDraft("ALL")} />
        <RadioRow label="Cash In" selected={draft === "IN"} onPress={() => setDraft("IN")} />
        <RadioRow label="Cash Out" selected={draft === "OUT"} onPress={() => setDraft("OUT")} />
      </View>
    </BottomSheetModal>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 2. DATE FILTER MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: "all_time", label: "All Time" },
  { key: "today", label: "Today" },
  { key: "yesterday", label: "Yesterday" },
  { key: "last_day", label: "Last Day" },
  { key: "last_week", label: "Last Week" },
  { key: "this_month", label: "This Month" },
  { key: "last_month", label: "Last Month" },
  { key: "last_year", label: "Last Year" },
  { key: "date", label: "Specific Date" },
  { key: "date_range", label: "Date Range" },
];

function DateFilterModal({
  visible,
  currentPreset,
  currentSingleDate,
  currentRangeStart,
  currentRangeEnd,
  onClose,
  onApply,
}: {
  visible: boolean;
  currentPreset: DatePreset;
  currentSingleDate: Date | null;
  currentRangeStart: Date | null;
  currentRangeEnd: Date | null;
  onClose: () => void;
  onApply: (
    preset: DatePreset,
    singleDate: Date | null,
    rangeStart: Date | null,
    rangeEnd: Date | null,
  ) => void;
}) {
  const [draftPreset, setDraftPreset] = useState<DatePreset>(currentPreset);
  const [draftSingleDate, setDraftSingleDate] = useState<Date | null>(currentSingleDate);
  const [draftRangeStart, setDraftRangeStart] = useState<Date | null>(currentRangeStart);
  const [draftRangeEnd, setDraftRangeEnd] = useState<Date | null>(currentRangeEnd);

  // For native pickers
  const [showSinglePicker, setShowSinglePicker] = useState(false);
  const [showRangeStartPicker, setShowRangeStartPicker] = useState(false);
  const [showRangeEndPicker, setShowRangeEndPicker] = useState(false);

  useEffect(() => {
    if (visible) {
      setDraftPreset(currentPreset);
      setDraftSingleDate(currentSingleDate);
      setDraftRangeStart(currentRangeStart);
      setDraftRangeEnd(currentRangeEnd);
    }
  }, [visible, currentPreset, currentSingleDate, currentRangeStart, currentRangeEnd]);

  const hasChanged =
    draftPreset !== currentPreset ||
    draftSingleDate?.getTime() !== currentSingleDate?.getTime() ||
    draftRangeStart?.getTime() !== currentRangeStart?.getTime() ||
    draftRangeEnd?.getTime() !== currentRangeEnd?.getTime();

  const formatBtn = (d: Date | null, fallback: string) =>
    d
      ? d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" })
      : fallback;

  return (
    <BottomSheetModal
      visible={visible}
      title="Select Date"
      onClose={onClose}
      footer={
        <ModalFooter
          onClear={() => onApply("all_time", null, null, null)}
          onApply={() => onApply(draftPreset, draftSingleDate, draftRangeStart, draftRangeEnd)}
          applyDisabled={!hasChanged}
        />
      }
    >
      <ScrollView className="py-2" style={{ maxHeight: 400 }}>
        {DATE_PRESETS.map((p) => (
          <RadioRow
            key={p.key}
            label={p.label}
            selected={draftPreset === p.key}
            onPress={() => {
              setDraftPreset(p.key);
              if (p.key === "date") {
                setShowSinglePicker(true);
              }
            }}
          />
        ))}

        {/* Single Day picker */}
        {draftPreset === "date" && (
          <View className="px-5 pb-3 pt-1">
            <TouchableOpacity
              onPress={() => setShowSinglePicker(true)}
              className="flex-row items-center gap-2 bg-muted rounded-xl px-4 py-3"
            >
              <Calendar size={16} className="text-muted-foreground" />
              <Text className="text-foreground text-[14px] font-medium">
                {formatBtn(draftSingleDate, "Pick a date")}
              </Text>
            </TouchableOpacity>
            {showSinglePicker && (
              <DateTimePicker
                value={draftSingleDate || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => {
                  setShowSinglePicker(Platform.OS === "ios");
                  if (d) setDraftSingleDate(d);
                }}
              />
            )}
          </View>
        )}

        {/* Date Range pickers */}
        {draftPreset === "date_range" && (
          <View className="px-5 pb-3 pt-1 gap-2">
            <TouchableOpacity
              onPress={() => setShowRangeStartPicker(true)}
              className="flex-row items-center gap-2 bg-muted rounded-xl px-4 py-3"
            >
              <Calendar size={16} className="text-muted-foreground" />
              <Text className="text-foreground text-[14px] font-medium">
                {formatBtn(draftRangeStart, "Start date")}
              </Text>
            </TouchableOpacity>
            {showRangeStartPicker && (
              <DateTimePicker
                value={draftRangeStart || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => {
                  setShowRangeStartPicker(Platform.OS === "ios");
                  if (d) setDraftRangeStart(d);
                }}
              />
            )}

            <TouchableOpacity
              onPress={() => setShowRangeEndPicker(true)}
              className="flex-row items-center gap-2 bg-muted rounded-xl px-4 py-3"
            >
              <Calendar size={16} className="text-muted-foreground" />
              <Text className="text-foreground text-[14px] font-medium">
                {formatBtn(draftRangeEnd, "End date")}
              </Text>
            </TouchableOpacity>
            {showRangeEndPicker && (
              <DateTimePicker
                value={draftRangeEnd || new Date()}
                mode="date"
                display={Platform.OS === "ios" ? "spinner" : "default"}
                onChange={(_, d) => {
                  setShowRangeEndPicker(Platform.OS === "ios");
                  if (d) setDraftRangeEnd(d);
                }}
              />
            )}
          </View>
        )}
      </ScrollView>
    </BottomSheetModal>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 3. MEMBERS FILTER MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function MembersFilterModal({
  visible,
  members,
  currentMemberId,
  onClose,
  onApply,
}: {
  visible: boolean;
  members: MemberOption[];
  currentMemberId: string | null;
  onClose: () => void;
  onApply: (memberId: string | null) => void;
}) {
  const [draft, setDraft] = useState<string | null>(currentMemberId);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setDraft(currentMemberId);
      setSearch("");
    }
  }, [visible, currentMemberId]);

  const filtered = useMemo(() => {
    if (!search.trim()) return members;
    const q = search.toLowerCase();
    return members.filter(
      (m) =>
        m.name?.toLowerCase().includes(q) || m.email?.toLowerCase().includes(q),
    );
  }, [members, search]);

  const hasChanged = draft !== currentMemberId;

  return (
    <BottomSheetModal
      visible={visible}
      title="Members"
      onClose={onClose}
      footer={
        <ModalFooter
          onClear={() => onApply(null)}
          onApply={() => onApply(draft)}
          applyDisabled={!hasChanged}
        />
      }
    >
      <View>
        {/* Search */}
        <View className="px-5 pt-3 pb-1">
          <View className="flex-row items-center bg-muted rounded-xl px-3 py-2 gap-2">
            <Search size={16} className="text-muted-foreground" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search members..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-foreground"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <X size={14} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 300 }}
          contentContainerStyle={{ paddingVertical: 4 }}
          renderItem={({ item }) => (
            <RadioRow
              label={item.name || item.email}
              selected={draft === item.id}
              onPress={() => setDraft(draft === item.id ? null : item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="py-8 items-center">
              <Text className="text-muted-foreground text-sm">No members found</Text>
            </View>
          }
        />
      </View>
    </BottomSheetModal>
  );
}

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// 4. CATEGORY FILTER MODAL
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

function CategoryFilterModal({
  visible,
  categories,
  currentIds,
  onClose,
  onApply,
}: {
  visible: boolean;
  categories: CategoryOption[];
  currentIds: string[];
  onClose: () => void;
  onApply: (ids: string[]) => void;
}) {
  const [draft, setDraft] = useState<string[]>(currentIds);
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (visible) {
      setDraft(currentIds);
      setSearch("");
    }
  }, [visible, currentIds]);

  const filtered = useMemo(() => {
    if (!search.trim()) return categories;
    const q = search.toLowerCase();
    return categories.filter((c) => c.title.toLowerCase().includes(q));
  }, [categories, search]);

  const toggleId = useCallback(
    (id: string) => {
      setDraft((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
      );
    },
    [],
  );

  // Compare arrays for "has changed"
  const hasChanged = useMemo(() => {
    if (draft.length !== currentIds.length) return true;
    const sortedA = [...draft].sort();
    const sortedB = [...currentIds].sort();
    return sortedA.some((v, i) => v !== sortedB[i]);
  }, [draft, currentIds]);

  return (
    <BottomSheetModal
      visible={visible}
      title="Category"
      onClose={onClose}
      footer={
        <ModalFooter
          onClear={() => onApply([])}
          onApply={() => onApply(draft)}
          applyDisabled={!hasChanged}
        />
      }
    >
      <View>
        {/* Search */}
        <View className="px-5 pt-3 pb-1">
          <View className="flex-row items-center bg-muted rounded-xl px-3 py-2 gap-2">
            <Search size={16} className="text-muted-foreground" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Search categories..."
              placeholderTextColor="#9CA3AF"
              className="flex-1 text-[14px] text-foreground"
            />
            {search.length > 0 && (
              <TouchableOpacity onPress={() => setSearch("")}>
                <X size={14} className="text-muted-foreground" />
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* List */}
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          style={{ maxHeight: 300 }}
          contentContainerStyle={{ paddingVertical: 4 }}
          renderItem={({ item }) => (
            <CheckboxRow
              label={item.title}
              checked={draft.includes(item.id)}
              onPress={() => toggleId(item.id)}
            />
          )}
          ListEmptyComponent={
            <View className="py-8 items-center">
              <Text className="text-muted-foreground text-sm">No categories found</Text>
            </View>
          }
        />
      </View>
    </BottomSheetModal>
  );
}
