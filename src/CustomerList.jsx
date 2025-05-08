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


ModuleRegistry.registerModules([ClientSideRowModelModule]);


// Button as separate React component for AG Grid
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

  useEffect(() => fetchCustomers(), []);

  const fetchCustomers = () => {
    axios
      .get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers')
      .then(res => setCustomers(res.data.content || []))
      .catch(err => {
        console.error('Error fetching customers:', err);
        setCustomers([]);
      });
  };

  const addCustomer = () => {
    axios
      .post('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers', newCustomer)
      .then(res => {
        fetchCustomers(); // reload to get the ID
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
      });
  };

  const deleteCustomer = useCallback((id) => {
    confirmAlert({
      title: 'Vahvista poisto',
      message: 'Haluatko varmasti poistaa asiakkaan?',
      buttons: [
        {
          label: 'Kyllä',
          onClick: () => {
            axios
              .delete(`https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/customers/${id}`)
              .then(fetchCustomers)
              .catch(err => console.error('Error deleting customer:', err));
          }
        },
        { label: 'Peruuta' }
      ]
    });
  }, []);

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
      cellRenderer: 'deleteButton'
    }
  ];

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
      <div style={{ marginBottom: 10 }}>
        {Object.keys(newCustomer).map((key) => (
          <input
            key={key}
            placeholder={key}
            value={newCustomer[key]}
            onChange={(e) => setNewCustomer({ ...newCustomer, [key]: e.target.value })}
          />
        ))}
        <button onClick={addCustomer}>Lisää asiakas</button>
      </div>

      <CSVLink data={customers} headers={csvHeaders} filename="asiakkaat.csv">
        <button>Lataa CSV</button>
      </CSVLink>

      <div className="ag-theme-alpine" style={{ height: 500 }}>
        <AgGridReact
          rowData={customers}
          columnDefs={columnDefs}
          frameworkComponents={{ deleteButton: (props) => <DeleteButton {...props} deleteCustomer={deleteCustomer} /> }}
          defaultColDef={{ sortable: true, filter: true, flex: 1 }}
          rowModelType="clientSide"
        />
      </div>
    </div>
  );
}
