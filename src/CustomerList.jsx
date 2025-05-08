import { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/styles/ag-grid.css';
import 'ag-grid-community/styles/ag-theme-alpine.css';
import { confirmAlert } from 'react-confirm-alert';
import 'react-confirm-alert/src/react-confirm-alert.css';
import { CSVLink } from 'react-csv';
import { ClientSideRowModelModule } from 'ag-grid-community';
import { ModuleRegistry } from 'ag-grid-community';

// Register AG Grid modules
ModuleRegistry.registerModules([ClientSideRowModelModule]);

// Button for deleting customers in AG Grid
const DeleteButton = ({ value, deleteCustomer }) => {
  return <button onClick={() => deleteCustomer(value)}>Poista</button>;
};

export default function CustomerList() {
  const [customers, setCustomers] = useState([]);
  const [newCustomer, setNewCustomer] = useState({
    firstname: '',
    lastname: '',
    email: '',
    phone: '',
    streetaddress: '',
    city: ''
  });
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Modal visibility state
  const [currentCustomer, setCurrentCustomer] = useState(null); // Current customer being edited

  useEffect(() => {
    fetchCustomers();
  }, []);

  // Fetch customers from API
  const fetchCustomers = () => {
    setLoading(true);
    axios
      .get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers')
      .then(res => {
        const customers = res.data._embedded.customers.map(c => ({
          ...c,
          id: c._links.self.href.split('/').pop()  // extract ID from self link
        }));
        setCustomers(customers);
      })
      .catch(err => {
        console.error('Error fetching customers:', err);
        setCustomers([]);
      })
      .finally(() => setLoading(false));
  };

  // Add new customer
  const addCustomer = () => {
    setLoading(true);
    axios
      .post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers', newCustomer)
      .then(res => {
        fetchCustomers(); // Reload to get the ID
        setNewCustomer({
          firstname: '',
          lastname: '',
          email: '',
          phone: '',
          streetaddress: '',
          city: ''
        });
      })
      .catch(err => {
        console.error('Error adding customer:', err);
      })
      .finally(() => setLoading(false));
  };

  // Delete customer with confirmation
  const deleteCustomer = useCallback((id) => {
    confirmAlert({
      title: 'Vahvista poisto',
      message: 'Haluatko varmasti poistaa asiakkaan?',
      buttons: [
        {
          label: 'Kyllä',
          onClick: () => {
            setLoading(true);
            axios
              .delete(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${id}`)
              .then(fetchCustomers)
              .catch(err => console.error('Error deleting customer:', err))
              .finally(() => setLoading(false));
          }
        },
        { label: 'Peruuta' }
      ]
    });
  }, []);

  // Open modal to edit customer
  const openEditModal = (customer) => {
    setCurrentCustomer(customer);
    setIsModalOpen(true);
  };

  // Close the modal
  const closeModal = () => {
    setIsModalOpen(false);
    setCurrentCustomer(null);
  };

  // Update customer
  const updateCustomer = () => {
    setLoading(true);
    axios
      .put(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${currentCustomer.id}`, currentCustomer)
      .then(() => {
        fetchCustomers(); // Refresh customers
        closeModal(); // Close the modal
      })
      .catch(err => {
        console.error('Error updating customer:', err);
      })
      .finally(() => setLoading(false));
  };

  // AG Grid columns
  const columnDefs = [
    { field: 'firstname', headerName: 'Etunimi' },
    { field: 'lastname', headerName: 'Sukunimi' },
    { field: 'email', headerName: 'Email' },
    { field: 'phone', headerName: 'Puhelin' },
    { field: 'streetaddress', headerName: 'Osoite' },
    { field: 'city', headerName: 'Kaupunki' },
    {
      headerName: 'Poista',
      field: 'id',
      cellRenderer: (params) => <DeleteButton {...params} deleteCustomer={deleteCustomer} />
    },
    {
      headerName: 'Muokkaa',
      field: 'id',
      cellRenderer: (params) => (
        <button onClick={() => openEditModal(params.data)}>Muokkaa</button>
      )
    }
  ];

  // CSV Headers for download
  const csvHeaders = [
    { label: 'Etunimi', key: 'firstname' },
    { label: 'Sukunimi', key: 'lastname' },
    { label: 'Email', key: 'email' },
    { label: 'Puhelin', key: 'phone' },
    { label: 'Osoite', key: 'streetaddress' },
    { label: 'Postinumero', key: 'postcode' },
    { label: 'Kaupunki', key: 'city' }
  ];

  return (
    <div>
      <h2>Asiakkaat</h2>

      {/* Customer Form */}
      <div style={{ marginBottom: 10 }}>
        {Object.keys(newCustomer).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={newCustomer[key]}
            onChange={(e) => setNewCustomer({ ...newCustomer, [key]: e.target.value })}
            disabled={loading}
          />
        ))}
        <button onClick={addCustomer} disabled={loading}>
          {loading ? 'Lisätään...' : 'Lisää asiakas'}
        </button>
      </div>

      {/* CSV Export Button */}
      <CSVLink data={customers} headers={csvHeaders} filename="asiakkaat.csv">
        <button disabled={loading}>Lataa CSV</button>
      </CSVLink>

      {/* AG Grid */}
      <div className="ag-theme-alpine" style={{ height: 500 }}>
        <AgGridReact
          rowData={customers}
          columnDefs={columnDefs}
          defaultColDef={{ sortable: true, filter: true, flex: 1 }}
          rowModelType="clientSide"
        />
      </div>

      {/* Edit Customer Modal */}
      {isModalOpen && currentCustomer && (
        <div className="modal">
          <div className="modal-content">
            <h3>Muokkaa asiakasta</h3>
            <input
              type="text"
              placeholder="Etunimi"
              value={currentCustomer.firstname}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, firstname: e.target.value })}
            />
            <input
              type="text"
              placeholder="Sukunimi"
              value={currentCustomer.lastname}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, lastname: e.target.value })}
            />
            <input
              type="text"
              placeholder="Email"
              value={currentCustomer.email}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, email: e.target.value })}
            />
            <input
              type="text"
              placeholder="Puhelin"
              value={currentCustomer.phone}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, phone: e.target.value })}
            />
            <input
              type="text"
              placeholder="Osoite"
              value={currentCustomer.streetaddress}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, streetaddress: e.target.value })}
            />
            <input
              type="text"
              placeholder="Kaupunki"
              value={currentCustomer.city}
              onChange={(e) => setCurrentCustomer({ ...currentCustomer, city: e.target.value })}
            />
            <button onClick={updateCustomer}>Tallenna muutokset</button>
            <button onClick={closeModal}>Peruuta</button>
          </div>
        </div>
      )}
    </div>
  );
}
