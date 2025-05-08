import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

// Set up the localizer for the calendar using date-fns
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales: { 'en-US': enUS }
});

export default function CalendarView() {
  const [events, setEvents] = useState([]);

  useEffect(() => {
    // Fetch training events from the API
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        if (res.data && Array.isArray(res.data.content)) {
          const data = res.data.content.map(t => ({
            title: `${t.activity} (${t.customer?.firstname || 'Unknown'} ${t.customer?.lastname || ''})`,
            start: new Date(t.date),
            end: new Date(new Date(t.date).getTime() + (t.duration * 60000)), // End time based on duration
          }));
          console.log('Events:', data);  // Log the events to check
          setEvents(data);  // Set the events for the calendar
        } else {
          console.error('No valid event data available.');
        }
      })
      .catch(err => {
        console.error('Error fetching events:', err);
      });
  }, []);

  return (
    <div>
      <h2>Harjoitukset kalenterissa</h2>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        views={['month', 'week', 'day']}
        defaultView="week"  // Default to week view
        toolbar  // Add toolbar to allow navigation
      />
    </div>
  );
}
