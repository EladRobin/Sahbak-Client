import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Table from 'react-bootstrap/Table';
import Button from 'react-bootstrap/Button';

const DefectiveItems = () => {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const isAdmin = localStorage.getItem('isAdmin') === 'true';
    if (!isAdmin) {
      alert('אינך אדמין');
      navigate('/', { replace: true });
      return;
    }

    const fetchDefectiveItems = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await axios.get('http://localhost:5000/api/items/defective', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setItems(response.data);
        setLoading(false);
      } catch (err) {
        setError('שגיאה בטעינת נתונים');
        setLoading(false);
      }
    };

    fetchDefectiveItems();
  }, [navigate]);

  const handleRestore = async (id) => {
  try {
    const token = localStorage.getItem('token');

    // מוצאים את הפריט מתוך ה-state לפי id
    const itemToRestore = items.find(item => item._id === id);
    if (!itemToRestore) {
      alert('פריט לא נמצא');
      return;
    }

    // יוצרים אובייקט עם כל השדות + סטטוס חדש
    const updatedItem = {
      name: itemToRestore.name,
      idNumber: itemToRestore.idNumber,
      item: itemToRestore.item,
      sn: itemToRestore.sn,
      status: 'active', // סטטוס כשיר
    };

    await axios.put(
      `http://localhost:5000/api/items/${id}`,
      updatedItem,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    setItems(prev => prev.filter(item => item._id !== id)); // מסירים מהטבלה
  } catch (err) {
    alert('שגיאה בהחזרת הפריט לכשיר');
    console.error(err);
  }
};


  if (loading) return <p>טוען...</p>;
  if (error) return <p style={{ color: 'red' }}>{error}</p>;

  return (
    <div style={{ maxWidth: 900, margin: 'auto', padding: 20 }}>
      <h1>ציוד לא כשיר</h1>
      {items.length === 0 ? (
        <p>אין פריטים לא כשירים</p>
      ) : (
        <Table striped bordered hover>
          <thead>
            <tr>
              <th>שם מלא</th>
              <th>ת"ז</th>
              <th>פריט</th>
              <th>SN</th>
              <th>פעולות</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.idNumber}</td>
                <td>{item.item}</td>
                <td>{item.sn}</td>
                <td>
                  <Button
                    variant="success"
                    size="sm"
                    onClick={() => {
                      if (window.confirm('האם אתה בטוח שברצונך להחזיר את הפריט לכשיר?')) {
                        handleRestore(item._id);
                      }
                    }}
                  >
                    החזר לכשיר
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default DefectiveItems;
