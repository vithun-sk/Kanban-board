import React, { useMemo, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  CalendarDays,
} from "lucide-react";
import Sidebar from "@/components/layouts/Sidebar";
import Topbar from "@/components/layouts/Topbar";
import { calendarEvents } from "@/Data/calenderData";

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(
    new Date(2026, 7, 1)
  );

  const [selectedDate, setSelectedDate] = useState(null);

  const monthName = currentDate.toLocaleString("default", {
    month: "long",
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = Array.from(
    { length: firstDay + daysInMonth },
    (_, index) => {
      if (index < firstDay) return null;
      return index - firstDay + 1;
    }
  );

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const getEventsForDate = (day) => {
    if (!day) return [];

    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      day
    ).padStart(2, "0")}`;

    return calendarEvents.filter((event) => event.date === date);
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];

    const date = `${year}-${String(month + 1).padStart(2, "0")}-${String(
      selectedDate
    ).padStart(2, "0")}`;

    return calendarEvents.filter((event) => event.date === date);
  }, [selectedDate, month, year]);

  return (
    <div className="min-h-screen bg-[var(--surface)] text-[var(--on-surface)] flex">
      <Sidebar />

      <main className="min-h-screen min-w-0 flex-1">
        <Topbar />

        <div className="p-8">
          <section className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold">Calendar</h1>

              <p className="mt-2 text-[var(--on-surface-variant)]">
                Track your tasks, deadlines, meetings, and project events.
              </p>
            </div>

            <button className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white transition hover:-translate-y-0.5 hover:bg-[#4338CA] cursor-pointer">
              <Plus size={19} />
              Add Event
            </button>
          </section>

          <section className="mt-8 rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] overflow-hidden">
            <div className="flex items-center justify-between border-b border-[var(--outline-variant)] p-5">
              <div className="flex items-center gap-3">
                <button
                  onClick={goToPreviousMonth}
                  className="rounded-lg p-2 hover:bg-[var(--surface-container-high)] cursor-pointer"
                >
                  <ChevronLeft size={20} />
                </button>

                <button
                  onClick={goToNextMonth}
                  className="rounded-lg p-2 hover:bg-[var(--surface-container-high)] cursor-pointer"
                >
                  <ChevronRight size={20} />
                </button>

                <h2 className="ml-2 text-xl font-semibold">
                  {monthName} {year}
                </h2>
              </div>

              <button
                onClick={goToToday}
                className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium hover:bg-[var(--surface-container-high)] cursor-pointer"
              >
                Today
              </button>
            </div>

            <div className="grid grid-cols-7 border-b border-[var(--outline-variant)]">
              {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map(
                (day) => (
                  <div
                    key={day}
                    className="p-4 text-center text-xs font-semibold uppercase tracking-wide text-[var(--outline)]"
                  >
                    {day}
                  </div>
                )
              )}
            </div>

            <div className="grid grid-cols-7">
              {days.map((day, index) => {
                const events = getEventsForDate(day);

                return (
                  <div
                    key={index}
                    onClick={() => day && setSelectedDate(day)}
                    className={`min-h-32 border-b border-r border-[var(--outline-variant)] p-3 transition ${
                      day
                        ? "cursor-pointer hover:bg-[var(--surface-container-high)]"
                        : "bg-[var(--surface-container-lowest)]"
                    }`}
                  >
                    {day && (
                      <>
                        <div className="flex justify-between">
                          <span className="text-sm font-medium">
                            {day}
                          </span>

                          {events.length > 0 && (
                            <span className="text-xs text-[var(--primary)]">
                              {events.length}
                            </span>
                          )}
                        </div>

                        <div className="mt-3 space-y-2">
                          {events.map((event) => (
                            <div
                              key={event.id}
                              className="rounded-md bg-[var(--primary)]/15 px-2 py-1.5"
                            >
                              <p className="truncate text-xs font-medium text-[var(--primary)]">
                                {event.title}
                              </p>

                              <p className="mt-0.5 truncate text-[10px] text-[var(--outline)]">
                                {event.project}
                              </p>
                            </div>
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          <section className="mt-8">
            <div className="mb-4">
              <h2 className="text-xl font-semibold">Upcoming Events</h2>
              <p className="mt-1 text-sm text-[var(--outline)]">
                Your upcoming tasks and important dates.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-5">
              {calendarEvents.slice(0, 3).map((event) => (
                <div
                  key={event.id}
                  className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5"
                >
                  <div className="flex items-start justify-between">
                    <div className="rounded-lg bg-[var(--primary)]/15 p-2 text-[var(--primary)]">
                      <CalendarDays size={18} />
                    </div>

                    <span className="rounded-full bg-[var(--surface-container-high)] px-3 py-1 text-xs">
                      {event.type}
                    </span>
                  </div>

                  <h3 className="mt-4 font-semibold">
                    {event.title}
                  </h3>

                  <p className="mt-2 text-sm text-[var(--outline)]">
                    {event.description}
                  </p>

                  <div className="mt-4 flex justify-between text-xs">
                    <span className="text-[var(--primary)]">
                      {event.date}
                    </span>

                    <span className="text-[var(--outline)]">
                      {event.project}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>

        {selectedDate && (
          <div
            className="fixed inset-0 z-1000 flex items-center justify-center bg-black/60 p-5"
            onClick={() => setSelectedDate(null)}
          >
            <div
              className="w-full max-w-lg rounded-2xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-6 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-[var(--outline)]">
                    Selected Date
                  </p>

                  <h2 className="mt-1 text-2xl font-bold">
                    {monthName} {selectedDate}, {year}
                  </h2>
                </div>

                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-[var(--outline)] hover:text-[var(--on-surface)] cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {selectedEvents.length > 0 ? (
                <div className="mt-6 space-y-3">
                  {selectedEvents.map((event) => (
                    <div
                      key={event.id}
                      className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container-high)] p-4"
                    >
                      <h3 className="font-semibold">{event.title}</h3>

                      <p className="mt-1 text-sm text-[var(--outline)]">
                        {event.description}
                      </p>

                      <div className="mt-3 flex gap-3 text-xs">
                        <span>{event.project}</span>
                        <span>{event.status}</span>
                        <span>{event.priority}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="mt-6 rounded-xl border border-dashed border-[var(--outline-variant)] p-8 text-center">
                  <CalendarDays
                    size={28}
                    className="mx-auto text-[var(--outline)]"
                  />

                  <p className="mt-3 text-sm text-[var(--outline)]">
                    No events scheduled for this day.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Calendar;