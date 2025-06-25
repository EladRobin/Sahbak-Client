import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart } from '@mui/x-charts/PieChart';
import { Tooltip } from '@mui/material';
import './Admin.css';

const Admin = () => {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      alert('אינך אדמין');
      navigate('/', { replace: true });
      return;
    }

    const fetchCounts = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('אין טוקן התחברות. אנא התחבר.');
          setLoading(false);
          return;
        }

        const response = await axios.get('http://localhost:5000/api/items/count-by-type', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });

        setData(response.data);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('שגיאה בטעינת נתונים: ' + (error.response?.data?.message || error.message));
        setLoading(false);
      }
    };

    fetchCounts();
  }, [navigate]);

  const chartData = data.map(({ type, count }) => ({
    label: type,
    value: count,
  }));

  return (
    <div style={{ maxWidth: 400, margin: 'auto', padding: 20 }}>
      <h1 style={{ textAlign: 'center' }}>פילוח ציוד לפי סוג</h1>

      {loading && <p style={{ textAlign: 'center' }}>טוען...</p>}

      {error && <p style={{ textAlign: 'center', color: 'red' }}>{error}</p>}

      {!loading && !error && chartData.length > 0 && (
        <PieChart
          series={[
            {
              data: chartData,
              highlightScope: { faded: 'global', highlighted: 'item' }, // הובר יפה
              faded: { additionalRadius: -15, color: 'gray' }, // פריטים לא פעילים מתעמעמים
            },
          ]}
          slotProps={{
            legend: {
              direction: 'column',
              position: { vertical: 'middle', horizontal: 'right' },
            },
          }}
          tooltip={{
            trigger: 'item',
            render: ({ datum }) => (
              <Tooltip title={`${datum.label}: ${datum.value} פריטים`} open>
                <span></span>
              </Tooltip>
            )
          }}
          height={300}
          width={400}
          valueFormatter={item => `${item.value} פריטים`}
        />
      )}

      {!loading && !error && chartData.length === 0 && (
        <p style={{ textAlign: 'center' }}>אין נתונים להצגה</p>
      )}
    </div>
  );
};

export default Admin;
