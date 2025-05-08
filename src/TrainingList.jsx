import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';

export default function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newTraining, setNewTraining] = useState({
    date: new Date(),
    activity: '',
    duration: '',
    customer: ''
  });

  useEffect(() => {
    fetchTrainings();
    fetchCustomers();
  }, []);

  const fetchTrainings = () => {
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        console.log("Trainings fetched:", res.data);
        setTrainings(res.data.content || []);
      })
      .catch(err => console.error('Error fetching trainings:', err));
  };
  
  const fetchCustomers = () => {
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers')
      .then(res => {
        console.log("Customers fetched:", res.data);
        setCustomers(res.data.content || []);
      })
      .catch(err => console.error('Error fetching customers:', err));
  };

  const addTraining = () => {
    const training = {
      ...newTraining,
      date: newTraining.date.toISOString(),
    };

    axios.post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings', training)
      .then(() => {
        fetchTrainings();
        setNewTraining({ date: new Date(), activity: '', duration: '', customer: '' });
      });
  };

  const deleteTraining = (link) => {
    confirmAlert({
      title: 'Vahvista poisto',
      message: 'Poistetaanko harjoitus?',
      buttons: [
        {
          label: 'Kyllä',
          onClick: () => {
            axios.delete(link).then(() => {
              fetchTrainings();
            }).catch(err => console.error('Error deleting training:', err));
          }
        },
        { label: 'Peruuta' }
      ]
    });
  };
  

  return (
    <div>
      <h2>Harjoitukset</h2>
      <div>
        <DatePicker
          selected={newTraining.date}
          onChange={date => setNewTraining({ ...newTraining, date })}
          showTimeSelect
          dateFormat="Pp"
        />
        <input
          placeholder="Aktiviteetti"
          value={newTraining.activity}
          onChange={e => setNewTraining({ ...newTraining, activity: e.target.value })}
        />
        <input
          placeholder="Kesto (min)"
          value={newTraining.duration}
          onChange={e => setNewTraining({ ...newTraining, duration: e.target.value })}
        />
        <select
          value={newTraining.customer}
          onChange={e => setNewTraining({ ...newTraining, customer: e.target.value })}
        >
          <option value="">Valitse asiakas</option>
          {customers.map(c => (
            <option key={c.links[0].href} value={c.links[0].href}>
              {c.firstname} {c.lastname}
            </option>
          ))}
        </select>
        <button onClick={addTraining}>Lisää harjoitus</button>
      </div>

      <table>
        <thead>
          <tr>
            <th>Asiakas</th>
            <th>Aktiviteetti</th>
            <th>Kesto</th>
            <th>Päivämäärä</th>
            <th>Poista</th>
          </tr>
        </thead>
        <tbody>
          {trainings.map(t => (
            <tr key={t.id}>
              <td>{t.customer?.firstname} {t.customer?.lastname}</td>
              <td>{t.activity}</td>
              <td>{t.duration}</td>
              <td>{dayjs(t.date).format('DD.MM.YYYY HH:mm')}</td>
              <td>
                <button onClick={() => deleteTraining(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings/${t.id}`)}>Poista</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
