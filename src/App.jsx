import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Navigation from './Navigation';
import CustomerList from './CustomerList';
import TrainingList from './TrainingList';
import CalendarView from './CalendarView';
import Statistics from './Statistics';

function App() {
  return (
    <Router>
      <Navigation />
      <Routes>
        <Route path="/" element={<CustomerList />} />
        <Route path="/trainings" element={<TrainingList />} />
        <Route path="/calendar" element={<CalendarView />} />
        <Route path="/statistics" element={<Statistics />} />
      </Routes>
    </Router>
  );
}

export default App;

