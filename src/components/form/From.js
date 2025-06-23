import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';

const MyItems = () => {
  const [items, setItems] = useState([]);

  useEffect(() => {
    // קריאה לשרת להבאת הנתונים
    axios.get('http://localhost:5000/api/items', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
    .then(res => {
      setItems(res.data);
    })
    .catch(err => {
      console.error("שגיאה בטעינת פריטים:", err);
    });
  }, []);

  return (
    <div className="container mt-5">
      <h4>הציוד שלך</h4>

      {items.length === 0 ? (
        <div className="alert alert-info">לא נמצאו פריטים תואמים לת"ז שלך.</div>
      ) : (
        <Table bordered hover responsive>
          <thead>
            <tr>
              <th>שם מלא</th>
              <th>פריט</th>
              <th>SN</th>
            </tr>
          </thead>
          <tbody>
            {items.map(item => (
              <tr key={item._id}>
                <td>{item.name}</td>
                <td>{item.item}</td>
                <td>{item.sn}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}
    </div>
  );
};

export default MyItems;
