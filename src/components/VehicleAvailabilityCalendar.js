"use client";

import { useEffect, useMemo, useState } from 'react';
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isBefore,
  isSameDay,
  isSameMonth,
  parseISO,
  startOfMonth,
  startOfToday,
  startOfWeek,
  subMonths,
} from 'date-fns';
import { CalendarDays, Check, ChevronLeft, ChevronRight, Clock3 } from 'lucide-react';

const WEEK_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatWindowLabel(start, end) {
  return `${format(start, 'dd MMM, hh:mm a')} - ${format(end, 'hh:mm a')}`;
}

export default function VehicleAvailabilityCalendar({
  availability,
  pickupDateTime,
  selectedEndDateTime,
  onSelectDate,
}) {
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(new Date()));

  useEffect(() => {
    if (!availability?.windowStart) return;
    setCurrentMonth(startOfMonth(parseISO(availability.windowStart)));
  }, [availability?.windowStart]);

  const minMonth = availability?.windowStart
    ? startOfMonth(parseISO(availability.windowStart))
    : startOfMonth(new Date());
  const maxMonth = availability?.windowEnd
    ? startOfMonth(parseISO(availability.windowEnd))
    : startOfMonth(new Date());
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const gridStart = startOfWeek(monthStart);
  const gridEnd = endOfWeek(monthEnd);
  const selectedDate = pickupDateTime ? new Date(pickupDateTime) : null;
  const dropoffDate = selectedEndDateTime ? new Date(selectedEndDateTime) : null;
  const today = startOfToday();

  const dayMap = useMemo(
    () => new Map((availability?.daySummaries || []).map((summary) => [summary.date, summary])),
    [availability]
  );

  const selectedSummary = selectedDate
    ? dayMap.get(format(selectedDate, 'yyyy-MM-dd'))
    : null;

  const monthDays = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="rounded-3xl border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.05),rgba(255,255,255,0.02))] p-4 sm:p-5">
      <div className="border-b border-white/10 pb-4">
        <div className="flex flex-col gap-4">
          <div className="text-center sm:text-left">
            <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-[#FFB300]">
              Live Availability
            </p>
            <h3 className="mt-2 flex items-center justify-center gap-2 text-xl font-black text-white sm:justify-start sm:text-2xl">
              <CalendarDays className="h-5 w-5 text-[#FFB300]" />
              Pick an open day
            </h3>
            <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-gray-400 sm:mx-0">
              Tap an available date to lock your pickup day. Amber dates have some busy windows and red dates are fully blocked.
            </p>
          </div>

          <div className="flex items-center justify-between gap-2 sm:justify-center">
            <button
              type="button"
              onClick={() => setCurrentMonth((value) => subMonths(value, 1))}
              disabled={currentMonth <= minMonth}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <div className="min-w-[170px] flex-1 rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-center text-xl font-bold text-white sm:max-w-[280px] sm:flex-none">
              {format(currentMonth, 'MMMM yyyy')}
            </div>
            <button
              type="button"
              onClick={() => setCurrentMonth((value) => addMonths(value, 1))}
              disabled={currentMonth >= maxMonth}
              className="rounded-2xl border border-white/10 bg-white/5 p-3 text-gray-300 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-35"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-2 text-xs text-gray-400 sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-white/55" />
              Available
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-[#FFB300]" />
              Partially busy
            </span>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5">
              <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
              Fully blocked
            </span>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-7 gap-2 sm:gap-3">
        {WEEK_LABELS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[10px] font-semibold uppercase tracking-[0.18em] text-gray-500 sm:text-[11px]"
          >
            {label}
          </div>
        ))}

        {monthDays.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd');
          const summary = dayMap.get(dateKey);
          const isCurrentMonth = isSameMonth(day, currentMonth);
          const isSelected = selectedDate ? isSameDay(day, selectedDate) : false;
          const isPast = isBefore(day, today);
          const isBlocked = summary?.status === 'blocked';
          const isPartial = summary?.status === 'partial';
          const isDisabled = !isCurrentMonth || isPast || isBlocked;

          let tone = 'border-white/8 bg-white/[0.03] text-white hover:border-white/20 hover:bg-white/[0.08]';
          if (!isCurrentMonth) tone = 'border-transparent bg-transparent text-gray-700';
          if (isPartial) tone = 'border-[#FFB300]/35 bg-[#FFB300]/10 text-[#FFE1A0] hover:border-[#FFB300]/60';
          if (isBlocked) tone = 'border-red-500/35 bg-red-500/12 text-red-200';
          if (isSelected) tone = 'border-[#FFB300] bg-gradient-to-br from-[#FFB300]/25 to-[#FF6A00]/10 text-white shadow-[0_0_24px_rgba(255,179,0,0.2)]';

          return (
            <button
              key={dateKey}
              type="button"
              disabled={isDisabled}
              onClick={() => onSelectDate?.(dateKey)}
              className={`min-h-[78px] rounded-2xl border p-2 text-left transition duration-150 sm:min-h-[84px] sm:p-2.5 ${tone} ${isDisabled ? 'cursor-not-allowed opacity-60' : 'cursor-pointer active:scale-[0.98]'}`}
            >
              <div className="flex items-start justify-between">
                <span className="text-base font-black sm:text-lg">{format(day, 'd')}</span>
                {isSelected && (
                  <span className="hidden sm:flex h-5 w-5 items-center justify-center rounded-full bg-[#FFB300] text-black">
                    <Check className="h-3 w-3" />
                  </span>
                )}
              </div>
              <div className="mt-3 text-[10px] font-semibold leading-4 sm:mt-4 sm:text-[11px]">
                {!isCurrentMonth ? '' : isBlocked ? 'Blocked' : isPartial ? 'Partial' : 'Open'}
              </div>
            </button>
          );
        })}
      </div>

      <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.32em] text-gray-500">
          Selected Day
        </p>

        {selectedSummary ? (
          <div className="mt-3">
            <div className="flex flex-col gap-2">
              <p className="text-lg font-bold text-white">
                {format(parseISO(selectedSummary.date), 'EEEE, dd MMM yyyy')}
              </p>
              {dropoffDate && (
                <span className="w-fit rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs text-gray-300">
                  Trip ends {format(dropoffDate, 'dd MMM, hh:mm a')}
                </span>
              )}
            </div>

            {selectedSummary.status === 'available' ? (
              <p className="mt-3 text-sm leading-6 text-emerald-300">
                This day is fully open. You can choose your pickup time and package below.
              </p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {selectedSummary.windows.map((window) => (
                  <div
                    key={`${window.start}-${window.end}`}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3"
                  >
                    <p className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#FFB300]">
                      <Clock3 className="h-3.5 w-3.5" />
                      Busy Window
                    </p>
                    <p className="mt-2 text-sm text-white">
                      {formatWindowLabel(parseISO(window.start), parseISO(window.end))}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <p className="mt-3 text-sm leading-6 text-gray-400">
            Select any open date from the calendar above and it will auto-fill your pickup day.
          </p>
        )}
      </div>
    </div>
  );
}
