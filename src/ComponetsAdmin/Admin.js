import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { PieChart } from '@mui/x-charts/PieChart';

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
        console.log("token from localStorage:", token); // בדיקת טוקן
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
        setError('שגיאה בטעינת נתונים');
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
          series={[{ data: chartData }]}
          height={300}
          width={300}
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
