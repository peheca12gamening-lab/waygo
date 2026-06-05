import { useMemo } from 'react';
import { motion } from 'framer-motion';

interface StreakCalendarProps {
  checkinDates: string[];
  currentStreak: number;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const DAY_LABELS = ['Mon', '', 'Wed', '', 'Fri', '', ''];

export function StreakCalendar({ checkinDates, currentStreak }: StreakCalendarProps) {
  const today = new Date();
  const todayStr = today.toISOString().slice(0, 10);

  const { weeks, prevMonth } = useMemo(() => {
    const days: { dateStr: string; day: number; isToday: boolean; isChecked: boolean; month: number }[] = [];
    const start = new Date(today);
    start.setDate(start.getDate() - 55);
    const end = new Date(today);
    end.setDate(end.getDate() + 7);

    const checkedSet = new Set(checkinDates);

    const cursor = new Date(start);
    while (cursor <= end) {
      const dateStr = cursor.toISOString().slice(0, 10);
      days.push({
        dateStr,
        day: cursor.getDate(),
        isToday: dateStr === todayStr,
        isChecked: checkedSet.has(dateStr),
        month: cursor.getMonth(),
      });
      cursor.setDate(cursor.getDate() + 1);
    }

    const weeksArr: typeof days[] = [];
    for (let i = 0; i < days.length; i += 7) {
      weeksArr.push(days.slice(i, i + 7));
    }

    let lastMonth = -1;
    const monthLabels: (number | null)[] = weeksArr.map(week => {
      const wm = week[0]?.month ?? -1;
      if (wm !== lastMonth) {
        lastMonth = wm;
        return wm;
      }
      return null;
    });

    return { weeks: weeksArr, prevMonth: monthLabels };
  }, [checkinDates, todayStr]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between mb-1">
        <h4 className="text-xs font-semibold uppercase tracking-wider" style={{ color: 'var(--text-soft)' }}>Activity</h4>
        <span className="text-xs" style={{ color: 'var(--text-soft)' }}>
          {checkinDates.length} days
        </span>
      </div>
      <div className="overflow-x-auto scrollbar-hide -mx-1">
        <div className="flex gap-1 min-w-max px-1">
          {/* Day-of-week labels column */}
          <div className="flex flex-col gap-[3px] pt-[18px]">
            {DAY_LABELS.map((d, i) => (
              <span key={i} className="w-[14px] h-[14px] text-[7px] font-semibold flex items-center justify-center"
                style={{ color: 'var(--text-soft)' }}>{d}</span>
            ))}
          </div>
          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {prevMonth[wi] !== null && (
                <span className="text-[9px] font-semibold text-center pb-0.5" style={{ color: 'var(--text-soft)' }}>
                  {MONTHS[prevMonth[wi]!]}
                </span>
              )}
              {week.map(day => {
                const isFuture = day.dateStr > todayStr;
                let bg = '#E8E8F0';
                let borderClr = '#D0D0E0';
                if (day.isChecked) {
                  if (currentStreak >= 30) bg = '#6D28D9';
                  else if (currentStreak >= 14) bg = '#2563EB';
                  else if (currentStreak >= 7) bg = '#059669';
                  else bg = '#7C3AED';
                  borderClr = 'transparent';
                }
                if (day.isToday) {
                  bg = '#7C3AED';
                  borderClr = '#B090FF';
                }
                if (isFuture) {
                  bg = 'transparent';
                  borderClr = 'transparent';
                }
                return (
                  <motion.div
                    key={day.dateStr}
                    initial={day.isToday ? { scale: 0 } : false}
                    animate={day.isToday ? { scale: [0, 1.3, 1] } : {}}
                    transition={{ duration: 0.4 }}
                    className="w-[14px] h-[14px] rounded-[3px]"
                    title={`${day.dateStr}${day.isChecked ? ' ✅' : ''}`}
                    style={{
                      background: bg,
                      border: day.isToday ? '2px solid #B090FF' : `1px solid ${borderClr}`,
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
