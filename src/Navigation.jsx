import { Link } from 'react-router-dom';

function Navigation() {
  return (
    <nav>
      <ul>
        <li><Link to="/">Asiakkaat</Link></li>
        <li><Link to="/trainings">Harjoitukset</Link></li>
        <li><Link to="/calendar">Kalenteri</Link></li>
        <li><Link to="/statistics">Tilastot</Link></li>
      </ul>
    </nav>
  );
}

export default Navigation;
