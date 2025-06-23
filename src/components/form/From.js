// MyItems.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Table from 'react-bootstrap/Table';
import { useNavigate } from 'react-router-dom';

const MyItems = () => {
  const [items, setItems] = useState([]);
  const [userId, setUserId] = useState(localStorage.getItem('userId'));
  const navigate = useNavigate();

  useEffect(() => {
    if (!userId) {
      navigate('/myform');
      return;
    }

    axios.get('http://localhost:5000/api/items', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    })
      .then(res => {
        const filtered = res.data.filter(item => item.idNumber === userId);
        setItems(filtered);
      })
      .catch(err => {
        console.error("שגיאה בטעינת פריטים:", err);
      });
  }, [userId, navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userId');
    navigate('/myform');
  };

  return (
    <div className="container mt-5">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4>הציוד שלך</h4>
        <button className="btn btn-danger btn-sm" onClick={handleLogout}>התנתק</button>
      </div>

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
