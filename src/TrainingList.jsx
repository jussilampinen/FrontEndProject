import { useEffect, useState } from 'react';
import axios from 'axios';
import dayjs from 'dayjs';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';

export default function TrainingList() {
  const [trainings, setTrainings] = useState([]);
  const [customers, setCustomers] = useState([]);
  const [newTraining, setNewTraining] = useState({
    date: new Date(),
    activity: '',
    duration: '',
    customer: ''
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentTraining, setCurrentTraining] = useState(null);

  useEffect(() => {
    fetchTrainings();
    fetchCustomers();
  }, []);

  const fetchTrainings = () => {
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        const trainingData = res.data._embedded?.trainings || [];
  
        // Enrich each training with the associated customer's name
        const enrichedTrainingsPromises = trainingData.map(training => {
          return axios.get(training._links.customer.href)
            .then(customerRes => {
              const customer = customerRes.data;
              return {
                ...training,
                customerName: `${customer.firstname} ${customer.lastname}`, 
              };
            })
            .catch(err => {
              console.error("Error fetching customer for training:", err);
              return {
                ...training,
                customerName: "Unknown", 
              };
            });
        });
  
        // Wait for all the promises to resolve before setting the state
        Promise.all(enrichedTrainingsPromises)
          .then(result => {
            setTrainings(result);
          });
      })
      .catch(err => console.error('Error fetching trainings:', err));
  };
  
  

  const fetchCustomers = () => {
    axios
      .get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers')
      .then(res => {
        const customers = res.data._embedded.customers.map(c => ({
          ...c,
          id: c._links.self.href.split('/').pop(),
          link: c._links.self.href
        }));
        setCustomers(customers);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setCustomers([]);
      });
  };

  const addTraining = () => {
    const training = {
      ...newTraining,
      date: newTraining.date.toISOString(),
    };

    axios
      .post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings', training)
      .then(() => {
        fetchTrainings();
        setNewTraining({ date: new Date(), activity: '', duration: '', customer: '' });
      })
      .catch(err => console.error('Error adding training:', err));
  };

  const deleteTraining = (link) => {
    confirmAlert({
      title: 'Vahvista poisto',
      message: 'Poistetaanko harjoitus?',
      buttons: [
        {
          label: 'Kyllä',
          onClick: () => {
            axios
              .delete(link)
              .then(fetchTrainings)
              .catch(err => console.error('Error deleting training:', err));
          }
        },
        { label: 'Peruuta' }
      ]
    });
  };

  const openEditModal = (training) => {
    setCurrentTraining(training); 
    setIsModalOpen(true);          
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentTraining(null);
  };

  const updateTraining = () => {
    // Ensure currentTraining.date is a valid Date object
    const updatedDate = dayjs(currentTraining.date).isValid()
      ? dayjs(currentTraining.date).toISOString()
      : new Date().toISOString();  
  
    const updatedTraining = {
      ...currentTraining,
      date: updatedDate, 
    };
  
    axios
      .put(currentTraining._links.self.href, updatedTraining)
      .then(() => {
        fetchTrainings();  
        setIsModalOpen(false);  
      })
      .catch((err) => console.error('Error updating training:', err));
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
            <option key={c.id} value={c.link}>
              {c.firstname} {c.lastname}
            </option>
          ))}
        </select>
        <button onClick={addTraining}>Lisää harjoitus</button>
      </div>

      <div className="ag-theme-alpine" style={{ height: 500, marginTop: 20 }}>
        <AgGridReact
          rowData={trainings}
          columnDefs={[
            {
              headerName: 'Asiakas',
              field: 'customerName',  // Display customer name from the training object
            },
            {
              headerName: 'Aktiviteetti',
              field: 'activity',  // Display activity from the training object
            },
            {
              headerName: 'Kesto (min)',
              field: 'duration',  // Display duration from the training object
            },
            {
              headerName: 'Päivämäärä',
              field: 'date',
              valueFormatter: (params) =>
                dayjs(params.value).format('DD.MM.YYYY')  // Format date field
            },
            {
              headerName: 'Poista',
              cellRenderer: (params) => (
                <button
                  onClick={() => deleteTraining(params.data._links.self.href)}  // Use the self link for deletion
                >
                  Poista
                </button>
              ),
            },
            {
              headerName: 'Muokkaa',
              field: 'id',
              cellRenderer: (params) => (
                <button onClick={() => openEditModal(params.data)}>Muokkaa</button>
              )
            },
          ]}
          defaultColDef={{
            sortable: true,
            filter: true,
            resizable: true,
            flex: 1,
          }}
        />
      </div>

      {/* Modal for editing training */}
      {isModalOpen && currentTraining && (
        <div className="modal" style={{ display: 'block' }}>
          <div className="modal-content">
            <h3>Muokkaa harjoitusta</h3>
            <DatePicker
              selected={currentTraining.date}
              onChange={date => setCurrentTraining({ ...currentTraining, date })}
              showTimeSelect
              dateFormat="Pp"
            />
            <input
              placeholder="Aktiviteetti"
              value={currentTraining.activity}
              onChange={e => setCurrentTraining({ ...currentTraining, activity: e.target.value })}
            />
            <input
              placeholder="Kesto (min)"
              value={currentTraining.duration}
              onChange={e => setCurrentTraining({ ...currentTraining, duration: e.target.value })}
            />
            <select
              value={currentTraining.customer}
              onChange={e => setCurrentTraining({ ...currentTraining, customer: e.target.value })}
            >
              <option value="">Valitse asiakas</option>
              {customers.map(c => (
                <option key={c.id} value={c.link}>
                  {c.firstname} {c.lastname}
                </option>
              ))}
            </select>
            <button onClick={updateTraining}>Tallenna muutokset</button>
            <button onClick={closeModal}>Peruuta</button>
          </div>
        </div>
      )}
    </div>
  );
}
