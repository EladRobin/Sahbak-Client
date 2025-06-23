import React, { useState, useRef, useEffect } from 'react';
import Table from 'react-bootstrap/Table';
import { FaArrowRight } from "react-icons/fa";
import { CiSearch } from "react-icons/ci";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';
import Button from 'react-bootstrap/Button';
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
  const [isAdmin, setIsAdmin] = useState(false);
  const buttonRefs = useRef({});

  const isLoggedIn = !!localStorage.getItem('token');

  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchItems = () => {
    const userId = localStorage.getItem('userId');
    const token = localStorage.getItem('token');
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    // אם משתמש מחובר - שולף את כל הפריטים, אחרת לפי userId אם אין טוקן
    const url = userId && !token ? `http://localhost:5000/api/items/by-id/${userId}` : `http://localhost:5000/api/items`;

    axios.get(url, { headers })
      .then(res => setItems(res.data))
      .catch(err => console.error("שגיאה בשליפה:", err));
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
      const adminFlag = localStorage.getItem('isAdmin');
      setIsAdmin(adminFlag === 'true');
    }
  }, [isLoggedIn]);

  const handleSubmitNewItem = () => {
    if (!newItem.name || !newItem.idNumber || !newItem.item || !newItem.sn) {
      alert("אנא מלא את כל השדות");
      return;
    }

    const token = localStorage.getItem('token');
    if (!token || token.length < 30) {
      alert("התחברות נדרשת");
      return;
    }

    axios.post('http://localhost:5000/api/items', newItem, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        fetchItems();
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
    if (!editData.name || !editData.idNumber || !editData.item || !editData.sn) {
      alert("אנא מלא את כל השדות");
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

  // אם המשתמש לא מחובר - מציג הודעה עם כפתורי התחברות והרשמה
  if (!isLoggedIn) {
    return (
      <div className="container mt-5">
        <div className="row align-items-center">
          {/* אנימציה - צד ימין */}
          <div className="col-md-6 d-flex justify-content-center">
            <DotLottieReact
              src="https://lottie.host/c992c888-8edc-4b3d-99dd-1f2f989b3087/B2dJIbQnT1.lottie"
              autoplay
              loop
              style={{ width: 300, height: 300 }}
            />
          </div>

          {/* כפתורי התחברות והרשמה - צד שמאל, יותר במרכז */}
          <div className="col-md-6 d-flex flex-column align-items-center">
            <h4 className="mb-4 text-center">אנא התחבר כדי לצפות בציוד האישי</h4>
            <div>
              <Button variant="danger" className="me-2" onClick={() => window.location.href = '/login'}>Login</Button>
              <Button variant="danger" onClick={() => window.location.href = '/register'}>Create Account</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // אם מחובר - מציג טבלה עם הפריטים
  return (
    <div className="container mt-4" style={{ maxWidth: 900 }}>
      {/* שורת חיפוש ואייקון הוספה */}
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
        {isAdmin && (
          <div
            style={{ width: '50px', height: '50px', cursor: 'pointer' }}
            onClick={() => setShowModal(true)}
          >
            <DotLottieReact
              src="https://lottie.host/c835564a-60b7-4125-93f0-e2d340ec061d/ymf1IgNf9R.lottie"
              loop
              autoplay
              style={{ width: '100%', height: '100%' }}
            />
          </div>
        )}
      </div>

      {/* טבלה */}
      <Table responsive bordered hover style={{ backgroundColor: 'white' }}>
        <thead>
          <tr>
            <th>שם מלא</th>
            <th>ת"ז</th>
            <th>פריט</th>
            <th>SN</th>
            {isAdmin && <th>פעולות</th>}
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
                      <option value="מחשב נייח">🖥️ מחשב נייח</option>
                      <option value="מחשב נייד">💻 מחשב נייד</option>
                      <option value="עכבר">🖱️ עכבר</option>
                      <option value="ספר">📘 ספר</option>
                      <option value="אחר">📦 אחר</option>
                    </select>
                  </td>
                  <td><input name="sn" value={editData.sn} onChange={handleEditChange} className="form-control" /></td>
                  {isAdmin && (
                    <td>
                      <div className="d-flex gap-2">
                        <button onClick={saveEdit} className="btn btn-success btn-sm">שמור</button>
                        <button onClick={() => setEditRowId(null)} className="btn btn-secondary btn-sm">ביטול</button>
                      </div>
                    </td>
                  )}
                </>
              ) : (
                <>
                  <td>{item.name}</td>
                  <td>{item.idNumber}</td>
                  <td>{item.item}</td>
                  <td>{item.sn}</td>
                  {isAdmin && (
                    <td>
                      <button className="btn btn-outline-secondary" onClick={() => toggleDropdown(item._id)}
                        ref={(el) => (buttonRefs.current[item._id] = el)}>
                        <FaArrowRight />
                      </button>
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {/* תפריט פעולות */}
      {isAdmin && dropdownOpenId && (
        <ul className="dropdown-menu show shadow"
          style={{ position: 'fixed', top: menuPosition.top + 5, left: menuPosition.left, zIndex: 1050 }}>
          <li><button className="dropdown-item" onClick={() => startEdit(items.find(i => i._id === dropdownOpenId))}>ערוך</button></li>
          <li><button className="dropdown-item" onClick={() => deleteItem(dropdownOpenId)}>מחק</button></li>
        </ul>
      )}

      {/* מודל הוספה */}
      {isAdmin && showModal && (
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
                <input type="text" placeholder="תז" className="form-control mb-2"
                  value={newItem.idNumber} onChange={e => setNewItem(prev => ({ ...prev, idNumber: e.target.value }))} />
                <select className="form-control mb-2" value={newItem.item}
                  onChange={e => setNewItem(prev => ({ ...prev, item: e.target.value }))}>
                  <option value="">בחר פריט</option>
                  <option value="מחשב נייח">🖥️ מחשב נייח</option>
                  <option value="מחשב נייד">💻 מחשב נייד</option>
                  <option value="עכבר">🖱️ עכבר</option>
                  <option value="ספר">📘 ספר</option>
                  <option value="אחר">📦 אחר</option>
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
