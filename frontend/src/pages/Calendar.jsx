import React, { useMemo, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight, Plus } from "lucide-react";
import CreateTaskModal from "@/components/tasks/CreateTaskModal";
import TaskDetailsModal from "@/components/tasks/TaskDetailsModal";
import Modal from "@/components/ui/Modal";
import { useApp } from "@/context/AppContext";
import { isOverdue, isSameDay, parseISODate } from "@/lib/dates";
import { TASK_STATUS } from "@/constants";

const Calendar = () => {
  const { tasks, members, projects, updateTask, deleteTask } = useApp();
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [showCreate, setShowCreate] = useState(false);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const monthName = currentDate.toLocaleString("default", { month: "long" });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const days = Array.from({ length: firstDay + daysInMonth }, (_, index) =>
    index < firstDay ? null : index - firstDay + 1,
  );
  const today = new Date();

  const dayTaskMap = useMemo(() => {
    const map = new Map();
    for (let day = 1; day <= daysInMonth; day++) {
      const cell = new Date(year, month, day);
      const matches = tasks.filter((task) => {
        const due = parseISODate(task.dueDate);
        return due && isSameDay(due, cell);
      });
      map.set(day, matches);
    }
    return map;
  }, [tasks, year, month, daysInMonth]);

  const getTasksForDay = (day) => {
    if (!day) return [];
    return dayTaskMap.get(day) || [];
  };

  const selectedEvents = useMemo(() => {
    if (!selectedDate) return [];
    return dayTaskMap.get(selectedDate) || [];
  }, [selectedDate, dayTaskMap]);

  const upcoming = useMemo(() => {
    return tasks
      .filter((task) => task.dueDate && task.status !== TASK_STATUS.DONE)
      .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
      .slice(0, 3);
  }, [tasks]);

  const selected = tasks.find((task) => task.id === selectedTask?.id) || null;

  return (
    <div>
      <section className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold">Calendar</h1>
          <p className="mt-2 text-[var(--on-surface-variant)]">
            Task deadlines from workspace data.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-5 py-2.5 font-medium text-white hover:bg-[#4338CA]"
        >
          <Plus size={19} />
          Add task
        </button>
      </section>

      <section className="mt-8 overflow-hidden rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[var(--outline-variant)] p-5">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
              className="rounded-lg p-2 hover:bg-[var(--surface-container-high)]"
              aria-label="Previous month"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => setCurrentDate(new Date(year, month + 1, 1))}
              className="rounded-lg p-2 hover:bg-[var(--surface-container-high)]"
              aria-label="Next month"
            >
              <ChevronRight size={20} />
            </button>
            <h2 className="ml-2 text-xl font-semibold">
              {monthName} {year}
            </h2>
          </div>
          <button
            type="button"
            onClick={() => {
              const now = new Date();
              setCurrentDate(now);
              setSelectedDate(now.getDate());
            }}
            className="rounded-lg border border-[var(--outline-variant)] px-4 py-2 text-sm font-medium"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 border-b border-[var(--outline-variant)]">
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
            <div key={day} className="p-3 text-center text-xs font-semibold uppercase tracking-wide text-[var(--outline)]">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((day, index) => {
            const events = getTasksForDay(day);
            const isToday =
              day &&
              isSameDay(new Date(year, month, day), today);
            return (
              <button
                type="button"
                key={index}
                disabled={!day}
                onClick={() => day && setSelectedDate(day)}
                className={`min-h-24 border-b border-r border-[var(--outline-variant)] p-2 text-left sm:min-h-32 ${
                  day ? "hover:bg-[var(--surface-container-high)]" : "bg-[var(--surface-container-lowest)]"
                }`}
              >
                {day ? (
                  <>
                    <div className="flex justify-between">
                      <span
                        className={`flex h-7 w-7 items-center justify-center rounded-full text-sm ${
                          isToday ? "bg-[var(--primary)] text-white" : ""
                        }`}
                      >
                        {day}
                      </span>
                      {events.length > 0 ? (
                        <span className="text-xs font-medium text-[var(--primary)]">{events.length}</span>
                      ) : null}
                    </div>
                    <div className="mt-2 hidden space-y-1 sm:block">
                      {events.slice(0, 2).map((event) => {
                        const isDone = event.status === TASK_STATUS.DONE || event.status === "DONE";
                        const overdue = isOverdue(event.dueDate, event.status);
                        return (
                          <div
                            key={event.id}
                            className={`truncate rounded-md px-2 py-1 text-xs ${
                              isDone
                                ? "bg-emerald-500/15 text-emerald-700"
                                : overdue
                                  ? "bg-red-500/15 text-red-700"
                                  : "bg-[var(--primary)]/15 text-[var(--primary)]"
                            }`}
                          >
                            {event.title}
                          </div>
                        );
                      })}
                      {events.length > 2 ? (
                        <span className="text-[10px] text-[var(--outline)]">
                          +{events.length - 2} more
                        </span>
                      ) : null}
                    </div>
                  </>
                ) : null}
              </button>
            );
          })}
        </div>
      </section>

      <section className="mt-8">
        <h2 className="text-xl font-semibold">Upcoming deadlines</h2>
        <div className="mt-4 grid grid-cols-1 gap-5 md:grid-cols-3">
          {upcoming.map((event) => (
            <button
              type="button"
              key={event.id}
              onClick={() => setSelectedTask(event)}
              className="rounded-xl border border-[var(--outline-variant)] bg-[var(--surface-container)] p-5 text-left transition hover:border-[var(--primary)]"
            >
              <CalendarDays className="text-[var(--primary)]" size={18} />
              <h3 className="mt-4 font-semibold">{event.title}</h3>
              <p className="mt-2 text-sm text-[var(--outline)]">{event.projectName}</p>
              <p className="mt-4 text-xs font-medium text-[var(--primary)]">{event.dueDate}</p>
            </button>
          ))}
        </div>
      </section>

      {selectedDate ? (
        <Modal
          title={`${monthName} ${selectedDate}, ${year}`}
          description="Task deadlines scheduled for this day."
          onClose={() => setSelectedDate(null)}
        >
          {selectedEvents.length > 0 ? (
            <div className="space-y-3">
              {selectedEvents.map((event) => (
                <button
                  type="button"
                  key={event.id}
                  onClick={() => setSelectedTask(event)}
                  className="w-full rounded-xl border border-[var(--outline-variant)] p-4 text-left transition hover:bg-[var(--surface-container-high)]"
                >
                  <h3 className="font-semibold">{event.title}</h3>
                  <p className="mt-1 text-sm text-[var(--outline)]">{event.projectName}</p>
                  <p className="mt-2 text-xs">
                    {event.status} · {event.priority}
                    {isOverdue(event.dueDate, event.status) ? " · Overdue" : ""}
                  </p>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[var(--outline)]">No deadlines on this day.</p>
          )}
        </Modal>
      ) : null}

      {selected ? (
        <TaskDetailsModal
          task={selected}
          members={members}
          projects={projects}
          onClose={() => setSelectedTask(null)}
          onSave={updateTask}
          onDelete={deleteTask}
        />
      ) : null}
      {showCreate ? <CreateTaskModal onClose={() => setShowCreate(false)} /> : null}
    </div>
  );
};

export default Calendar;
