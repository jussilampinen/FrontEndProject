import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import _ from 'lodash';

export default function Statistics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        const grouped = _.groupBy(res.data.content, 'activity');
        const chartData = Object.keys(grouped).map(key => ({
          activity: key,
          duration: _.sumBy(grouped[key], t => parseInt(t.duration))
        }));
        setData(chartData);
      });
  }, []);

  return (
    <div>
      <h2>Harjoitustyyppien kestot (min)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="activity" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Bar dataKey="duration" fill="#8884d8" name="Kesto (min)" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
