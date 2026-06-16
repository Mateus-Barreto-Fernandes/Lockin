import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { assignments, subjectBg } from '../lib/api';

interface Assignment { id: number; name: string; subject: string; due_date: string; completed: number; }

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [assignmentList, setAssignmentList] = useState<Assignment[]>([]);

  useEffect(() => {
    assignments.list().then(setAssignmentList).catch(() => {});
  }, []);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startDow = firstDay.getDay();
  const daysInMonth = lastDay.getDate();
  const today = new Date();

  const monthName = currentDate.toLocaleDateString('en-NZ', { month: 'long', year: 'numeric' });

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToday = () => setCurrentDate(new Date());

  const cells: { date: Date; inMonth: boolean }[] = [];
  const prevMonthDays = new Date(year, month, 0).getDate();
  for (let i = startDow - 1; i >= 0; i--) cells.push({ date: new Date(year, month - 1, prevMonthDays - i), inMonth: false });
  for (let d = 1; d <= daysInMonth; d++) cells.push({ date: new Date(year, month, d), inMonth: true });
  const remaining = 7 - (cells.length % 7);
  if (remaining < 7) for (let d = 1; d <= remaining; d++) cells.push({ date: new Date(year, month + 1, d), inMonth: false });

  function getAssignmentsForDate(d: Date) {
    const ds = d.toISOString().split('T')[0];
    return assignmentList.filter(a => a.due_date === ds);
  }

  function isToday(d: Date) {
    return d.getFullYear() === today.getFullYear() && d.getMonth() === today.getMonth() && d.getDate() === today.getDate();
  }

  return (
    <div className="panel" key="calendar">
      <h1 className="panel-title">Calendar</h1>
      <p className="panel-subtitle">Your month at a glance</p>
      <div className="calendar-nav">
        <button className="btn-secondary" onClick={prevMonth}><ChevronLeft size={16} /></button>
        <div className="calendar-month">{monthName}</div>
        <button className="btn-secondary" onClick={nextMonth}><ChevronRight size={16} /></button>
        <button className="btn-secondary" onClick={goToday} style={{ marginLeft: 8 }}>Today</button>
      </div>
      <div className="calendar-grid">
        <div className="calendar-header">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="calendar-header-cell">{d}</div>
          ))}
        </div>
        <div className="calendar-body">
          {cells.map((cell, i) => {
            const dayAssignments = getAssignmentsForDate(cell.date);
            return (
              <div key={i} className={`calendar-cell${!cell.inMonth ? ' other-month' : ''}${isToday(cell.date) ? ' today' : ''}`}>
                <div className="day-num">{cell.date.getDate()}</div>
                {dayAssignments.map(a => {
                  const s = subjectBg(a.subject);
                  return <div key={a.id} className="event-chip" style={s}>{a.name}</div>;
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
