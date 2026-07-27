"use client";

import React, { useState } from 'react';
import { X, Calendar as CalendarIcon, Clock, Home, ChevronLeft, ChevronRight, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

interface MemberCalendarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
}

export default function MemberCalendarModal({ isOpen, onClose, user }: MemberCalendarModalProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDayNumber, setSelectedDayNumber] = useState<number | null>(new Date().getDate());
  const [activeTab, setActiveTab] = useState<'all' | 'personal' | 'building'>('all');

  if (!isOpen) return null;

  const room = user?.memberProfile?.room;
  const roomNumber = room?.room_number || "General Unit";
  const complaints = user?.memberProfile?.complaints || [];

  // Generate personalized events from user complaints/requests
  const personalEvents: any[] = complaints.map((c: any, idx: number) => {
    // We don't have created_at in the db, so default to today
    const d = new Date().getDate(); 
    return {
      id: `req-${c.id || idx}`,
      title: `${c.category || 'Maintenance Request'} (${c.status.replace('_', ' ')})`,
      day: d,
      time: 'Scheduled by Technician',
      room: `Room ${roomNumber}`,
      type: 'personal',
      status: c.status === 'resolved' ? 'Completed' : 'Pending',
      details: c.description || 'Service inspection requested by resident.'
    };
  });

  // General building common area maintenance (empty since no db table)
  const buildingEvents: any[] = [];

  const allEvents = [...personalEvents, ...buildingEvents];

  const filteredEvents = activeTab === 'all' 
    ? allEvents 
    : activeTab === 'personal' 
    ? personalEvents 
    : buildingEvents;

  // Calendar weeks generator for traditional grid view
  const getCalendarWeeks = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startingDay = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const prevLastDay = new Date(year, month, 0).getDate();
    
    let days: { d: number | null, prev?: boolean, next?: boolean }[] = [];
    
    // Previous month padding
    for (let i = startingDay - 1; i >= 0; i--) {
      days.push({ d: prevLastDay - i, prev: true });
    }
    
    // Current month days
    for (let i = 1; i <= totalDays; i++) {
      days.push({ d: i });
    }
    
    // Next month padding
    let nextDays = 1;
    while (days.length % 7 !== 0 || days.length < 35) {
      days.push({ d: nextDays++, next: true });
    }
    
    const weeks = [];
    for (let i = 0; i < days.length; i += 7) {
      weeks.push(days.slice(i, i + 7));
    }
    return weeks;
  };

  const calendarWeeks = getCalendarWeeks(currentDate);

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    setSelectedDayNumber(null);
  };
  
  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    setSelectedDayNumber(null);
  };

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  // Events specifically falling on the currently clicked/selected day box
  const eventsOnSelectedDay = selectedDayNumber !== null
    ? filteredEvents.filter((ev) => ev.day === selectedDayNumber)
    : [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div 
        className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden border border-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="p-5 sm:p-7 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 text-white flex items-center justify-between shrink-0">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-[11px] font-bold tracking-wide uppercase text-blue-200 mb-1.5 border border-white/15">
              <Home className="w-3.5 h-3.5 text-blue-300" />
              Maintenance Calendar • {room ? `Room ${room.room_number}` : 'Guest View'}
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight">
              Calendar &amp; Maintenance Schedule
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
          >
            <X className="w-5 h-5 stroke-[2.5]" />
          </button>
        </div>

        {/* Month Navigation & Tabs */}
        <div className="p-3 sm:px-6 border-b border-slate-100 bg-slate-50/70 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200/80 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer ${
                activeTab === 'all' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({allEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('personal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'personal' ? 'bg-amber-600 text-white shadow-xs' : 'text-slate-600 hover:text-amber-700'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'personal' ? 'bg-white' : 'bg-amber-500'}`} />
              My Room ({personalEvents.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('building')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'building' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600 hover:text-blue-900'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${activeTab === 'building' ? 'bg-white' : 'bg-blue-500'}`} />
              Building ({buildingEvents.length})
            </button>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={prevMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer font-bold"
            >
              <ChevronLeft className="w-4.5 h-4.5" />
            </button>
            <span className="text-sm font-black text-slate-800 min-w-[130px] text-center">
              {monthName}
            </span>
            <button
              type="button"
              onClick={nextMonth}
              className="w-8 h-8 rounded-lg border border-slate-200 bg-white hover:bg-slate-100 flex items-center justify-center text-slate-700 transition-colors cursor-pointer font-bold"
            >
              <ChevronRight className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>

        {/* Main Body: Traditional Calendar Grid + Selected Day Details */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-grow space-y-6">
          
          {/* TRADITIONAL CALENDAR GRID */}
          <div className="overflow-hidden rounded-2xl border border-slate-200 shadow-sm bg-white">
            {/* 7 Columns Day Headers */}
            <div className="grid grid-cols-7 bg-slate-50 border-b border-slate-200">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2.5 text-center text-[11px] font-black text-slate-400 uppercase tracking-wider">
                  {day}
                </div>
              ))}
            </div>

            {/* Weeks & Date Cells */}
            {calendarWeeks.map((week, wi) => (
              <div key={wi} className="grid grid-cols-7 border-b border-slate-100 last:border-b-0">
                {week.map((cell, ci) => {
                  const isCurrentMonthCell = !cell.prev && !cell.next && cell.d !== null;
                  const isSelected = isCurrentMonthCell && cell.d === selectedDayNumber;
                  const cellEvents = isCurrentMonthCell
                    ? filteredEvents.filter((ev) => ev.day === cell.d)
                    : [];

                  return (
                    <div
                      key={ci}
                      onClick={() => {
                        if (isCurrentMonthCell && cell.d !== null) {
                          setSelectedDayNumber(cell.d);
                        }
                      }}
                      className={`min-h-[76px] sm:min-h-[86px] p-1.5 border-r border-slate-100 last:border-r-0 relative transition-all flex flex-col justify-between ${
                        !isCurrentMonthCell
                          ? 'bg-slate-50/50 opacity-40 cursor-not-allowed'
                          : isSelected
                          ? 'bg-blue-50/70 ring-2 ring-inset ring-blue-600 cursor-pointer'
                          : 'bg-white hover:bg-slate-50 cursor-pointer'
                      }`}
                    >
                      {/* Date Number Badge */}
                      <div className="flex items-center justify-between">
                        <span
                          className={`text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-blue-900 text-white font-black shadow-xs scale-110'
                              : isCurrentMonthCell
                              ? 'text-slate-700 font-extrabold'
                              : 'text-slate-300'
                          }`}
                        >
                          {cell.d}
                        </span>
                        {cellEvents.length > 0 && (
                          <span className="text-[10px] font-bold text-slate-400">
                            {cellEvents.length} •
                          </span>
                        )}
                      </div>

                      {/* Event Badges inside Cell */}
                      <div className="space-y-1 mt-1 overflow-hidden">
                        {cellEvents.map((ev, ei) => (
                          <div
                            key={ei}
                            title={`${ev.title} (${ev.time})`}
                            className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md truncate transition-transform ${
                              ev.type === 'personal'
                                ? 'bg-amber-500 text-white shadow-xs'
                                : 'bg-blue-900 text-white shadow-xs'
                            }`}
                          >
                            {ev.type === 'personal' ? `★ ${ev.title}` : ev.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
          </div>

          {/* SELECTED DAY DETAILS / LIST VIEW */}
          <div className="bg-slate-50/80 rounded-2xl p-5 border border-slate-200/80">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200">
              <h3 className="text-sm font-black text-slate-800 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                {selectedDayNumber !== null
                  ? `Schedule for ${monthName.split(' ')[0]} ${selectedDayNumber}`
                  : 'Select a Date on the Calendar Above'}
              </h3>
              {selectedDayNumber !== null && (
                <span className="text-xs font-bold text-slate-500 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                  {eventsOnSelectedDay.length} Events Found
                </span>
              )}
            </div>

            {selectedDayNumber !== null && eventsOnSelectedDay.length > 0 ? (
              <div className="space-y-3">
                {eventsOnSelectedDay.map((evt) => (
                  <div
                    key={evt.id}
                    className={`p-4 rounded-xl border flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white shadow-xs ${
                      evt.type === 'personal'
                        ? 'border-amber-300 ring-1 ring-amber-300/40'
                        : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div
                        className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-extrabold ${
                          evt.type === 'personal'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-blue-50 text-blue-900'
                        }`}
                      >
                        {evt.type === 'personal' ? '🏠' : '🏢'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                            evt.type === 'personal' ? 'bg-amber-100 text-amber-900' : 'bg-slate-100 text-slate-700'
                          }`}>
                            {evt.room}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            • {evt.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-extrabold text-slate-900 mt-1">
                          {evt.title}
                        </h4>
                        <p className="text-xs text-slate-500 mt-0.5 font-medium">
                          {evt.details}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      {evt.time}
                    </div>
                  </div>
                ))}
              </div>
            ) : selectedDayNumber !== null ? (
              <div className="py-6 text-center text-slate-500">
                <p className="text-xs font-bold text-slate-600">No maintenance or inspection scheduled for {monthName.split(' ')[0]} {selectedDayNumber}.</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Click on a date with a yellow/blue label in the calendar above to view details.</p>
              </div>
            ) : (
              <div className="py-6 text-center text-slate-500 text-xs">
                Please click on a date box in the calendar above to view maintenance details.
              </div>
            )}
          </div>

        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-4 text-xs font-bold text-slate-600">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-amber-500 inline-block" />
              Personal Unit Only ({personalEvents.length})
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-md bg-blue-900 inline-block" />
              Building Facilities ({buildingEvents.length})
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold py-2 px-5 rounded-xl transition-colors cursor-pointer"
          >
            Close Calendar
          </button>
        </div>
      </div>
    </div>
  );
}
