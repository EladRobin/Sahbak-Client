// FormHook.jsx - גרסה מעודכנת עם תמיכה גם למשתמשים ללא טוקן

import React, { useState, useRef, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { FaArrowRight } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import axios from 'axios';

const FormHook = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newItem, setNewItem] = useState({ name: "", idNumber: "", item: "", sn: "" });
  const [showModal, setShowModal] = useState(false);
  const buttonRefs = useRef({});

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchItems = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const url = userId && !token ? `http://localhost:5000/api/items/by-id/${userId}` : `http://localhost:5000/api/items`;

    axios.get(url, { headers })
      .then(res => setItems(res.data))
      .catch(err => console.error("שגיאה בשליפה:", err));
  };

  useEffect(() => {
    fetchItems();
  }, []);

const handleSubmitNewItem = () => {
  if (!newItem.name.trim() || !newItem.idNumber.trim() || !newItem.item.trim() || !newItem.sn.trim()) {
    alert("אנא מלא את כל השדות לפני ההוספה");
    return;
  }

      const token = localStorage.getItem('token');
      console.log("Token שנשלח:", token);
      if (!token || token.length < 30) {
        alert("התחברות נדרשת. אנא התחבר שוב.");
        return;
      }


  axios.post('http://localhost:5000/api/items', newItem, {
    headers: { Authorization: `Bearer ${token}` }
  })
    .then(() => {
      fetchItems(); // טען מחדש את כל הפריטים אחרי הוספה
      setNewItem({ name: "", idNumber: "", item: "", sn: "" });
      setShowModal(false);
    })
    .catch(err => console.error("שגיאה בהוספה:", err.response?.data || err.message));
};


  const deleteItem = (id) => {
    axios.delete(`http://localhost:5000/api/items/${id}`, {
      headers: getAuthHeaders()
    })
      .then(() => {
        fetchItems();
        setDropdownOpenId(null);
      })
      .catch(err => console.error("שגיאה במחיקה:", err));
  };

  const startEdit = (item) => {
    setEditRowId(item._id);
    setEditData({ ...item });
    setDropdownOpenId(null);
  };

  const saveEdit = () => {
    if (!editData.name.trim() || !editData.idNumber.trim() || !editData.item.trim() || !editData.sn.trim()) {
      alert("אנא מלא את כל השדות לפני השמירה");
      return;
    }

    axios.put(`http://localhost:5000/api/items/${editRowId}`, editData, {
      headers: getAuthHeaders()
    })
      .then(() => {
        fetchItems();
        setEditRowId(null);
        setDropdownOpenId(null);
      })
      .catch(err => console.error("שגיאה בעדכון:", err));
  };

  const toggleDropdown = (id) => {
    const button = buttonRefs.current[id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      setDropdownOpenId(dropdownOpenId === id ? null : id);
    }
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({ ...prev, [name]: value }));
  };

  const filteredItems = items.filter(item =>
    item.name.includes(searchTerm) ||
    item.idNumber.includes(searchTerm) ||
    item.item.includes(searchTerm) ||
    item.sn.includes(searchTerm)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isInsideButton = Object.values(buttonRefs.current).some(ref => ref && ref.contains(event.target));
      const isInsideDropdown = event.target.closest('.dropdown-menu');
      if (!isInsideButton && !isInsideDropdown) setDropdownOpenId(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      {/* קלט חיפוש וכפתור הוספה */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div style={{ position: 'relative', width: '70%' }}>
          <input
            type="text"
            className="form-control"
            placeholder="חפש..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ paddingRight: '2rem' }}
          />
          <CiSearch
            style={{ position: 'absolute', right: '15px', top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#888' }}
            size={20}
          />
        </div>
        <div
          style={{ width: '50px', height: '50px', cursor: 'pointer' }}
          onClick={() => setShowModal(true)}
        >
          <DotLottieReact
            src="https://lottie.host/d41a87e0-7437-4497-9dfc-ad137be10262/yg5jH90ujJ.lottie"
            loop
            autoplay
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>

      {/* טבלה */}
      <Table responsive bordered hover style={{ backgroundColor: 'white' }}>
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
          {filteredItems.map(item => (
            <tr key={item._id}>
              {editRowId === item._id ? (
                <>
                  <td><input name="name" value={editData.name} onChange={handleEditChange} className="form-control" /></td>
                  <td><input name="idNumber" value={editData.idNumber} onChange={handleEditChange} className="form-control" /></td>
                  <td>
                    <select name="item" value={editData.item} onChange={handleEditChange} className="form-control">
                      <option value="">בחר פריט</option>
                      <option value="מחשב נייח">מחשב נייח</option>
                      <option value="מחשב נייד">מחשב נייד</option>
                      <option value="עכבר">עכבר</option>
                      <option value="ספר">ספר</option>
                      <option value="אחר">אחר</option>
                    </select>
                  </td>
                  <td><input name="sn" value={editData.sn} onChange={handleEditChange} className="form-control" /></td>
                  <td>
                    <div className="d-flex gap-2">
                      <button onClick={saveEdit} className="btn btn-success btn-sm">שמור</button>
                      <button onClick={() => setEditRowId(null)} className="btn btn-secondary btn-sm">ביטול</button>
                    </div>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.name}</td>
                  <td>{item.idNumber}</td>
                  <td>{item.item}</td>
                  <td>{item.sn}</td>
                  <td>
                    <button className="btn btn-outline-secondary" onClick={() => toggleDropdown(item._id)}
                      ref={(el) => (buttonRefs.current[item._id] = el)}>
                      <FaArrowRight />
                    </button>
                  </td>
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* תפריט פעולות */}
      {dropdownOpenId !== null && (
        <ul className="dropdown-menu show shadow"
          style={{ position: 'fixed', top: menuPosition.top + 5, left: menuPosition.left, zIndex: 1050 }}>
          <li><button className="dropdown-item" onClick={() => startEdit(items.find(i => i._id === dropdownOpenId))}>ערוך</button></li>
          <li><button className="dropdown-item" onClick={() => deleteItem(dropdownOpenId)}>מחק</button></li>
        </ul>
      )}

      {/* מודאל הוספה */}
      {showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">הוספת פריט</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input type="text" placeholder="שם מלא" className="form-control mb-2"
                  value={newItem.name} onChange={e => setNewItem(prev => ({ ...prev, name: e.target.value }))} />
                <input type="text" placeholder='ת"ז' className="form-control mb-2"
                  value={newItem.idNumber} onChange={e => setNewItem(prev => ({ ...prev, idNumber: e.target.value }))} />
                <select className="form-control mb-2" value={newItem.item}
                  onChange={e => setNewItem(prev => ({ ...prev, item: e.target.value }))}>
                  <option value="">בחר פריט</option>
                  <option value="מחשב נייח">מחשב נייח</option>
                  <option value="מחשב נייד">מחשב נייד</option>
                  <option value="עכבר">עכבר</option>
                  <option value="ספר">ספר</option>
                  <option value="אחר">אחר</option>
                </select>
                <input type="text" placeholder="SN" className="form-control mb-2"
                  value={newItem.sn} onChange={e => setNewItem(prev => ({ ...prev, sn: e.target.value }))} />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>סגור</button>
                <button className="btn btn-primary" onClick={handleSubmitNewItem}>הוסף פריט</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormHook;