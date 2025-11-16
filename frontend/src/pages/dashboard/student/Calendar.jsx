import { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import api from '../../../utils/api';

const Calendar = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('calendar'); // 'calendar' or 'list'

  // Academic Calendar Data (2025-26 ODD Semester)
  const academicCalendarData = [
    { week: 1, month: 'June', startDate: '2025-06-23', endDate: '2025-06-29', activity: 'B Tech: 3rd/5th/7th Sem & M Tech: 3rd Sem starts (23/06/2025)', type: 'academic' },
    { week: 2, month: 'June/July', startDate: '2025-06-30', endDate: '2025-07-06', activity: '', type: 'regular' },
    { week: 3, month: 'July', startDate: '2025-07-07', endDate: '2025-07-13', activity: '', type: 'regular', holidays: ['2025-07-12'] },
    { week: 4, month: 'July', startDate: '2025-07-14', endDate: '2025-07-20', activity: '', type: 'regular' },
    { week: 5, month: 'July', startDate: '2025-07-21', endDate: '2025-07-27', activity: '', type: 'regular', holidays: ['2025-07-26'] },
    { week: 6, month: 'July/August', startDate: '2025-07-28', endDate: '2025-08-03', activity: 'Professional Society Chapter Activities/Student\'s Workshop/Enrichment Activities', type: 'event' },
    { week: 7, month: 'August', startDate: '2025-08-04', endDate: '2025-08-10', activity: '', type: 'regular', holidays: ['2025-08-09'] },
    { week: 8, month: 'August', startDate: '2025-08-11', endDate: '2025-08-17', activity: 'M Tech 3rd Sem Dissertation 1st Review', type: 'academic', holidays: ['2025-08-14', '2025-08-15'], holidayType: 'DH' },
    { week: 9, month: 'August', startDate: '2025-08-18', endDate: '2025-08-24', activity: '', type: 'regular', holidays: ['2025-08-23'] },
    { week: 10, month: 'August', startDate: '2025-08-25', endDate: '2025-08-31', activity: 'Expert Talks/Industry Visit/Project Exhibition', type: 'event', holidays: ['2025-08-27'], holidayType: 'DH' },
    { week: 11, month: 'September', startDate: '2025-09-01', endDate: '2025-09-07', activity: 'Notification of B Tech 3rd/5th/7th Sem Attendance Report', type: 'academic' },
    { week: 12, month: 'September', startDate: '2025-09-08', endDate: '2025-09-14', activity: 'B Tech 3rd/5th/7th Semester CCE (Continuous & Comprehensive Evaluation)', type: 'exam', holidays: ['2025-09-13'] },
    { week: 13, month: 'September', startDate: '2025-09-15', endDate: '2025-09-21', activity: '(Engineers Day) (15/09/2025)', type: 'event' },
    { week: 14, month: 'September', startDate: '2025-09-22', endDate: '2025-09-28', activity: '', type: 'regular', holidays: ['2025-09-27'] },
    { week: 15, month: 'September/October', startDate: '2025-09-29', endDate: '2025-10-05', activity: 'Parents-Teacher Meeting', type: 'event', holidays: ['2025-10-01'], holidayType: 'DH' },
    { week: 16, month: 'October', startDate: '2025-10-06', endDate: '2025-10-12', activity: 'M Tech 3rd Sem Dissertation 2nd Review', type: 'academic' },
    { week: 17, month: 'October', startDate: '2025-10-13', endDate: '2025-10-19', activity: 'Diwali Break (For Students) (13/10/2025 to 25/10/2025)', type: 'holiday' },
    { week: 18, month: 'October', startDate: '2025-10-20', endDate: '2025-10-26', activity: 'Diwali Break (For Staff) (18/10/2025 to 25/10/2025)', type: 'holiday', holidays: ['2025-10-25'] },
    { week: 19, month: 'October/November', startDate: '2025-10-27', endDate: '2025-11-02', activity: 'University Exam B Tech 3rd/5th/7th Semester (Regular/Backlog) (27/10/2025)', type: 'exam' },
    { week: 20, month: 'November', startDate: '2025-11-03', endDate: '2025-11-09', activity: 'University Exam B Tech 3rd/5th/7th Semester (Regular/Backlog), M Tech 3rd Sem (Regular/Backlog)', type: 'exam', holidays: ['2025-11-05', '2025-11-08'], holidayType: 'DH' },
    { week: 21, month: 'November', startDate: '2025-11-10', endDate: '2025-11-16', activity: 'University Exam B Tech 3rd/5th/7th Semester (Regular/Backlog)', type: 'exam' },
    { week: 22, month: 'November', startDate: '2025-11-17', endDate: '2025-11-23', activity: 'University Exam B Tech 3rd/5th/7th Semester (Regular/Backlog)', type: 'exam', holidays: ['2025-11-22'] },
    { week: 23, month: 'November', startDate: '2025-11-24', endDate: '2025-11-30', activity: 'Break only for Students', type: 'holiday' },
    { week: 24, month: 'December', startDate: '2025-12-01', endDate: '2025-12-07', activity: 'Break only for Students', type: 'holiday' },
    { week: 25, month: 'December', startDate: '2025-12-08', endDate: '2025-12-14', activity: 'CHARUSAT Supplementary Examinations (08/12/2025), Break only for Students', type: 'exam', holidays: ['2025-12-13'] },
    { week: 26, month: 'December', startDate: '2025-12-15', endDate: '2025-12-21', activity: 'B Tech 4th/6th/8th Sem Start (15/12/2025)', type: 'academic' },
  ];

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const res = await api.get('/calendar');
      setEvents(res.data.events);
    } catch (error) {
      toast.error('Failed to fetch calendar events');
    } finally {
      setLoading(false);
    }
  };

  // Get all dates with events from academic calendar
  const getCalendarDates = () => {
    const datesMap = {};
    
    academicCalendarData.forEach(week => {
      const start = new Date(week.startDate);
      const end = new Date(week.endDate);
      
      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        if (!datesMap[dateStr]) {
          datesMap[dateStr] = {
            date: new Date(d),
            events: [],
            isHoliday: false,
            holidayType: null,
            week: week.week,
            month: week.month
          };
        }
        
        if (week.activity) {
          datesMap[dateStr].events.push({
            activity: week.activity,
            type: week.type,
            week: week.week
          });
        }
      }
      
      // Mark holidays
      if (week.holidays) {
        week.holidays.forEach(holidayDate => {
          if (datesMap[holidayDate]) {
            datesMap[holidayDate].isHoliday = true;
            datesMap[holidayDate].holidayType = week.holidayType || 'H';
          }
        });
      }
    });
    
    return datesMap;
  };

  const calendarDates = getCalendarDates();

  // Render calendar grid
  const renderCalendarGrid = () => {
    const months = ['June', 'July', 'August', 'September', 'October', 'November', 'December'];
    const monthData = {};
    
    months.forEach(month => {
      monthData[month] = academicCalendarData.filter(w => w.month.includes(month));
    });

    return (
      <div className="space-y-8">
        {months.map(month => {
          const weeks = monthData[month];
          if (weeks.length === 0) return null;
          
          return (
            <div key={month} className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4">
                <h2 className="text-2xl font-bold text-white">{month} 2025</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {weeks.map(week => (
                    <div
                      key={week.week}
                      className={`border-2 rounded-lg p-4 transition-all hover:shadow-md ${
                        week.type === 'holiday' ? 'border-red-300 bg-red-50' :
                        week.type === 'exam' ? 'border-yellow-300 bg-yellow-50' :
                        week.type === 'event' ? 'border-green-300 bg-green-50' :
                        week.type === 'academic' ? 'border-blue-300 bg-blue-50' :
                        'border-gray-200 bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-semibold text-gray-600">Week {week.week}</span>
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          week.type === 'holiday' ? 'bg-red-200 text-red-800' :
                          week.type === 'exam' ? 'bg-yellow-200 text-yellow-800' :
                          week.type === 'event' ? 'bg-green-200 text-green-800' :
                          week.type === 'academic' ? 'bg-blue-200 text-blue-800' :
                          'bg-gray-200 text-gray-800'
                        }`}>
                          {week.type}
                        </span>
                      </div>
                      <div className="text-xs text-gray-600 mb-2">
                        {new Date(week.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} - {new Date(week.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      {week.activity && (
                        <p className="text-sm text-gray-700 mt-2 font-medium">{week.activity}</p>
                      )}
                      {week.holidays && (
                        <div className="mt-2 flex flex-wrap gap-1">
                          {week.holidays.map((holiday, idx) => (
                            <span
                              key={idx}
                              className={`px-2 py-1 text-xs font-semibold rounded ${
                                week.holidayType === 'DH' ? 'bg-red-300 text-red-900' : 'bg-orange-200 text-orange-800'
                              }`}
                            >
                              {week.holidayType || 'H'}: {new Date(holiday).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  // Render list view
  const renderListView = () => {
    const filteredData = academicCalendarData;

    return (
      <div className="space-y-4">
        {filteredData.map((week, idx) => (
          <div
            key={idx}
            className={`bg-white rounded-lg shadow-md overflow-hidden border-l-4 ${
              week.type === 'holiday' ? 'border-red-500' :
              week.type === 'exam' ? 'border-yellow-500' :
              week.type === 'event' ? 'border-green-500' :
              week.type === 'academic' ? 'border-blue-500' :
              'border-gray-300'
            }`}
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">Week {week.week}</span>
                    <span className={`px-3 py-1 text-xs font-semibold rounded-full ${
                      week.type === 'holiday' ? 'bg-red-100 text-red-800' :
                      week.type === 'exam' ? 'bg-yellow-100 text-yellow-800' :
                      week.type === 'event' ? 'bg-green-100 text-green-800' :
                      week.type === 'academic' ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {week.type.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-sm text-gray-600 mb-2">
                    <span className="font-medium">{week.month}</span> • {new Date(week.startDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })} - {new Date(week.endDate).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </div>
                </div>
              </div>
              {week.activity && (
                <p className="text-gray-700 mb-3 font-medium">{week.activity}</p>
              )}
              {week.holidays && (
                <div className="flex flex-wrap gap-2 mt-3">
                  {week.holidays.map((holiday, hIdx) => (
                    <span
                      key={hIdx}
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        week.holidayType === 'DH' ? 'bg-red-200 text-red-900' : 'bg-orange-200 text-orange-800'
                      }`}
                    >
                      {week.holidayType || 'H'}: {new Date(holiday).toLocaleDateString('en-GB', { day: 'numeric', month: 'long' })}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  };

  if (loading) {
    return <div className="text-center py-12">Loading...</div>;
  }

  return (
    <div className="px-4 py-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8 bg-gradient-to-r from-blue-600 to-indigo-700 rounded-xl shadow-lg p-6 text-white">
        <h1 className="text-4xl font-bold mb-2">Academic Calendar</h1>
        <p className="text-blue-100 text-lg">CHAROTAR UNIVERSITY OF SCIENCE & TECHNOLOGY, CHANGA</p>
        <p className="text-blue-200 text-sm mt-1">Faculty of Technology and Engineering • ODD Semester (2025-26)</p>
        <p className="text-blue-200 text-xs mt-2">B. Tech: 3rd, 5th, 7th Semester & M Tech: 3rd Semester</p>
      </div>

      {/* Controls */}
      <div className="mb-6 flex flex-wrap justify-center items-center gap-4 bg-white p-4 rounded-lg shadow-md">
        <div className="flex gap-2">
          <button
            onClick={() => setViewMode('calendar')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'calendar'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📅 Calendar View
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`px-4 py-2 rounded-lg font-semibold transition-all ${
              viewMode === 'list'
                ? 'bg-blue-600 text-white shadow-md'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            📋 List View
          </button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow-md">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legend:</h3>
        <div className="flex flex-wrap gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-blue-200 rounded"></span>
            <span>Academic</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-yellow-200 rounded"></span>
            <span>Exam</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-green-200 rounded"></span>
            <span>Event</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-red-200 rounded"></span>
            <span>Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-4 h-4 bg-gray-200 rounded"></span>
            <span>Regular</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-red-300 text-red-900">DH</span>
            <span>Declared Holiday</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-2 py-1 text-xs font-semibold rounded bg-orange-200 text-orange-800">H</span>
            <span>Holiday</span>
          </div>
        </div>
      </div>

      {/* Calendar Content */}
      <div className="mt-6">
        {viewMode === 'calendar' ? renderCalendarGrid() : renderListView()}
      </div>

      {/* Additional Events from API */}
      {events.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Additional Events</h2>
          <div className="space-y-4">
            {events.map((event) => (
              <div key={event._id} className="bg-white shadow rounded-lg overflow-hidden border-l-4 border-purple-500">
                <div className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-lg font-medium text-gray-900">{event.title}</h3>
                      {event.description && (
                        <p className="mt-1 text-sm text-gray-600">{event.description}</p>
                      )}
                      <div className="mt-2 flex gap-2">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                          event.eventType === 'holiday' ? 'bg-red-100 text-red-800' :
                          event.eventType === 'exam' ? 'bg-yellow-100 text-yellow-800' :
                          event.eventType === 'event' ? 'bg-green-100 text-green-800' :
                          event.eventType === 'deadline' ? 'bg-orange-100 text-orange-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {event.eventType}
                        </span>
                        <span className="px-2 py-1 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          {new Date(event.startDate).toLocaleDateString()} - {new Date(event.endDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;

