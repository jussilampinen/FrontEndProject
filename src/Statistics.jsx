import { useEffect, useState } from 'react';
import axios from 'axios';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Legend } from 'recharts';
import _ from 'lodash';

export default function Statistics() {
  const [data, setData] = useState([]);

  useEffect(() => {
    axios.get('https://customer-rest-service-frontend-personaltrainer.2.rahtiapp.fi/api/trainings')
      .then(res => {
        // Ensure the response has the correct structure (_embedded.trainings)
        const trainings = res.data._embedded?.trainings || [];
        
        // Group the trainings by activity
        const grouped = _.groupBy(trainings, 'activity');

        // Map the grouped data to prepare chart data
        const chartData = Object.keys(grouped).map(key => ({
          activity: key,
          duration: _.sumBy(grouped[key], t => parseInt(t.duration))  // Sum durations for each activity
        }));

        setData(chartData);
      })
      .catch(err => {
        console.error('Error fetching trainings data:', err);
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
