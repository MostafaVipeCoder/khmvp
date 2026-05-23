import * as React from "react";
import { View, Text, Pressable } from "../../tw";
import { ChevronLeft, ChevronRight } from "lucide-react-native";
import { cn } from "./utils";

// Days of week labels
const DAYS_AR = ['أح', 'إث', 'ثل', 'أر', 'خم', 'جم', 'سب'];
const DAYS_EN = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

const MONTHS_AR = [
  'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
  'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

type CalendarMode = 'single' | 'multiple' | 'range';

interface CalendarProps {
  mode?: CalendarMode;
  selected?: any;
  onSelect?: any;
  disabled?: (date: Date) => boolean;
  className?: string;
  showOutsideDays?: boolean;
  locale?: string;
  fromDate?: Date;
  toDate?: Date;
  defaultMonth?: Date;
  modifiers?: any;
  modifiersStyles?: any;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate();
}

function getFirstDayOfMonth(year: number, month: number): number {
  return new Date(year, month, 1).getDay();
}

function isSameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function isDateDisabled(
  date: Date,
  disabled?: (d: Date) => boolean,
  fromDate?: Date,
  toDate?: Date
): boolean {
  if (disabled && disabled(date)) return true;
  if (fromDate && date < fromDate) return true;
  if (toDate && date > toDate) return true;
  return false;
}

function isSelected(date: Date, selected: CalendarProps['selected']): boolean {
  if (!selected) return false;
  if (selected instanceof Date) return isSameDay(date, selected);
  if (Array.isArray(selected)) return selected.some((d) => isSameDay(date, d));
  const { from, to } = selected as { from?: Date; to?: Date };
  if (from && to) return date >= from && date <= to;
  if (from) return isSameDay(date, from);
  return false;
}

function Calendar({
  mode = 'single',
  selected,
  onSelect,
  disabled,
  className,

  locale,
  fromDate,
  toDate,
  defaultMonth,
}: CalendarProps) {
  const isAr = locale === 'ar';
  const days = isAr ? DAYS_AR : DAYS_EN;
  const months = isAr ? MONTHS_AR : MONTHS_EN;

  const today = new Date();
  const initial = defaultMonth || (selected instanceof Date ? selected : today);

  const [viewYear, setViewYear] = React.useState(initial.getFullYear());
  const [viewMonth, setViewMonth] = React.useState(initial.getMonth());

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDayOfMonth = getFirstDayOfMonth(viewYear, viewMonth);

  const prevMonth = () => {
    if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); }
    else setViewMonth(m => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); }
    else setViewMonth(m => m + 1);
  };

  const handleDayPress = (day: number) => {
    if (!onSelect) return;
    const date = new Date(viewYear, viewMonth, day);
    if (isDateDisabled(date, disabled, fromDate, toDate)) return;
    
    if (mode === 'multiple') {
      const currentSelected = Array.isArray(selected) ? selected : [];
      const alreadySelected = currentSelected.some(d => isSameDay(d, date));
      if (alreadySelected) {
        onSelect(currentSelected.filter(d => !isSameDay(d, date)));
      } else {
        onSelect([...currentSelected, date]);
      }
    } else {
      onSelect(date);
    }
  };

  // Build grid rows
  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let i = 1; i <= daysInMonth; i++) cells.push(i);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: (number | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) rows.push(cells.slice(i, i + 7));

  return (
    <View className={cn("p-3", className)}>
      {/* Header */}
      <View className="flex-row items-center justify-between mb-3">
        <Pressable onPress={prevMonth} className="p-1 rounded-md border border-neutral-300 dark:border-neutral-700">
          <ChevronLeft className="size-4 text-neutral-700 dark:text-neutral-300" />
        </Pressable>

        <Text className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
          {months[viewMonth]} {viewYear}
        </Text>

        <Pressable onPress={nextMonth} className="p-1 rounded-md border border-neutral-300 dark:border-neutral-700">
          <ChevronRight className="size-4 text-neutral-700 dark:text-neutral-300" />
        </Pressable>
      </View>

      {/* Day headers */}
      <View className="flex-row mb-1">
        {days.map((d) => (
          <View key={d} className="flex-1 items-center py-1">
            <Text className="text-xs text-neutral-500 dark:text-neutral-400 font-normal">{d}</Text>
          </View>
        ))}
      </View>

      {/* Day grid */}
      {rows.map((row, rowIdx) => (
        <View key={rowIdx} className="flex-row">
          {row.map((day, colIdx) => {
            if (!day) {
              return (
                <View key={`empty-${colIdx}`} className="flex-1 items-center py-1" />
              );
            }

            const date = new Date(viewYear, viewMonth, day);
            const sel = isSelected(date, selected);
            const isToday = isSameDay(date, today);
            const dis = isDateDisabled(date, disabled, fromDate, toDate);

            return (
              <Pressable
                key={day}
                onPress={() => handleDayPress(day)}
                disabled={dis}
                className={cn(
                  "flex-1 items-center justify-center rounded-md py-1 mx-0.5",
                  sel && "bg-[#FB5E7A]",
                  !sel && isToday && "bg-neutral-100 dark:bg-neutral-800",
                  dis && "opacity-30"
                )}
              >
                <Text
                  className={cn(
                    "text-sm",
                    sel && "text-white font-semibold",
                    !sel && isToday && "text-[#FB5E7A] font-semibold",
                    !sel && !isToday && "text-neutral-900 dark:text-neutral-100"
                  )}
                >
                  {day}
                </Text>
              </Pressable>
            );
          })}
        </View>
      ))}
    </View>
  );
}

export { Calendar };
