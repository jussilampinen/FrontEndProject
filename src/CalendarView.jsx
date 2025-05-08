import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { useEffect, useState } from 'react';
import axios from 'axios';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { enUS } from 'date-fns/locale';

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
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        if (res.data && Array.isArray(res.data.content)) {
          const data = res.data.content.map(t => ({
            title: `${t.activity} (${t.customer?.firstname || ''})`,
            start: new Date(t.date),
            end: new Date(new Date(t.date).getTime() + t.duration * 60000),
          }));
          setEvents(data);
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
        defaultView="week"
      />
    </div>
  );
}

