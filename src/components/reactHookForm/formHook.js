import React, { useState, useRef, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaArrowRight } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const FormHook = () => {
  const [items, setItems] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
  const [newItem, setNewItem] = useState({ name: "", idNumber: "", item: "", sn: "" });
  const [showModal, setShowModal] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const buttonRefs = useRef({});

  const isLoggedIn = !!localStorage.getItem("token");

  const itemIcons = {
    "מחשב נייח": "🖥️",
    "מחשב נייד": "💻",
    "עכבר": "🖱️",
    "ספר": "📘",
    אחר: "📦",
  };

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const fetchItems = () => {
    const headers = getAuthHeaders();
    axios
      .get("http://localhost:5000/api/items", { headers })
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה בשליפה:", err);
        }
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
      const adminFlag = localStorage.getItem("isAdmin");
      setIsAdmin(adminFlag === "true");

      axios
        .get("http://localhost:5000/api/users", { headers: getAuthHeaders() })
        .then((res) => setUsers(res.data))
        .catch((err) => {
          if (err.response && err.response.status === 401) {
            alert("הסשן שלך פג. אנא התחבר מחדש.");
            localStorage.clear();
            window.location.href = "/login";
          } else {
            console.error("שגיאה בטעינת משתמשים:", err);
          }
        });
    }
  }, [isLoggedIn]);

  const handleSubmitNewItem = () => {
    if (!newItem.name || !newItem.idNumber || !newItem.item || !newItem.sn) {
      alert("אנא מלא את כל השדות");
      return;
    }

    axios
      .post("http://localhost:5000/api/items", newItem, {
        headers: getAuthHeaders(),
      })
      .then(() => {
        fetchItems();
        setNewItem({ name: "", idNumber: "", item: "", sn: "" });
        setShowModal(false);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה בהוספה:", err.response?.data || err.message);
        }
      });
  };

  const deleteItem = (id) => {
    axios
      .delete(`http://localhost:5000/api/items/${id}`, {
        headers: getAuthHeaders(),
      })
      .then(() => {
        fetchItems();
        setDropdownOpenId(null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה במחיקה:", err);
        }
      });
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

    axios
      .put(`http://localhost:5000/api/items/${editRowId}`, editData, {
        headers: getAuthHeaders(),
      })
      .then(() => {
        fetchItems();
        setEditRowId(null);
        setDropdownOpenId(null);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה בעדכון:", err);
        }
      });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const toggleDropdown = (id) => {
    const button = buttonRefs.current[id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
      setDropdownOpenId(dropdownOpenId === id ? null : id);
    }
  };

  const filteredItems = items.filter((item) => {
    const term = searchTerm.toLowerCase();
    return (
      item.name.toLowerCase().includes(term) ||
      item.idNumber.toLowerCase().includes(term) ||
      item.item.toLowerCase().includes(term) ||
      item.sn.toLowerCase().includes(term)
    );
  });

  // פונקציית ייצוא לאקסל
  const exportToExcel = () => {
    if (filteredItems.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }

    const dataToExport = filteredItems.map(({ name, idNumber, item, sn }) => ({
      "שם מלא": name,
      "תעודת זהות": idNumber,
      פריט: item,
      "מספר סידורי (SN)": sn,
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "ציוד");

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, "exported_items.xlsx");
  };

  // פונקציה לסימון פריט כתקול
const markItemAsDefective = (id) => {
  // מוצא את הפריט מתוך המערך items (הקיים בקומפוננטה)
  const itemToUpdate = items.find((item) => item._id === id);
  if (!itemToUpdate) return;

  const updatedData = {
    name: itemToUpdate.name,
    idNumber: itemToUpdate.idNumber,
    item: itemToUpdate.item,
    sn: itemToUpdate.sn,
    status: 'defective',  // הוספת הסטטוס החדש
  };

  axios.put(`http://localhost:5000/api/items/${id}`, updatedData, {
    headers: getAuthHeaders(),
  })
  .then(() => {
    fetchItems();
  })
  .catch(err => {
    console.error("שגיאה בסימון כתקול:", err);
  });
};



  if (!isLoggedIn) {
    return (
      <div className="container mt-5 text-center">
        <DotLottieReact
          src="https://lottie.host/c992c888-8edc-4b3d-99dd-1f2f989b3087/B2dJIbQnT1.lottie"
          autoplay
          loop
          style={{ width: 300, height: 300, margin: "auto" }}
        />
        <h4 className="mb-4">אנא התחבר כדי לצפות בציוד האישי</h4>
        <div>
          <Button variant="danger" className="me-2" onClick={() => (window.location.href = "/login")}>
            התחבר
          </Button>
          <Button variant="danger" onClick={() => (window.location.href = "/register")}>
            צור חשבון
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mt-4" style={{ maxWidth: 900, position: "relative" }}>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <input
          type="text"
          className="form-control"
          placeholder="חפש..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingRight: "2rem", width: "70%" }}
        />
        <button className="btn btn-success ms-2" onClick={exportToExcel}>
          ייצא לאקסל
        </button>
        {isAdmin && (
          <div style={{ width: "50px", height: "50px", cursor: "pointer" }} onClick={() => setShowModal(true)}>
            <DotLottieReact
              src="https://lottie.host/c835564a-60b7-4125-93f0-e2d340ec061d/ymf1IgNf9R.lottie"
              loop
              autoplay
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        )}
      </div>

      <Table responsive bordered hover>
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
          {filteredItems.map((item) => (
            <tr key={item._id} style={item.status === "defective" ? { backgroundColor: "#f8d7da" } : {}}>
              {editRowId === item._id ? (
                <>
                  <td>
                    <input
                      name="name"
                      value={editData.name}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <input
                      name="idNumber"
                      value={editData.idNumber}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <select
                      name="item"
                      value={editData.item}
                      onChange={handleEditChange}
                      className="form-control"
                    >
                      <option value="">בחר פריט</option>
                      <option value="מחשב נייח">🖥️ מחשב נייח</option>
                      <option value="מחשב נייד">💻 מחשב נייד</option>
                      <option value="עכבר">🖱️ עכבר</option>
                      <option value="ספר">📘 ספר</option>
                      <option value="אחר">📦 אחר</option>
                    </select>
                  </td>
                  <td>
                    <input
                      name="sn"
                      value={editData.sn}
                      onChange={handleEditChange}
                      className="form-control"
                    />
                  </td>
                  <td>
                    <button onClick={saveEdit} className="btn btn-success btn-sm">
                      שמור
                    </button>
                  </td>
                </>
              ) : (
                <>
                  <td>{item.name}</td>
                  <td>{item.idNumber}</td>
                  <td>
                    {itemIcons[item.item]} {item.item}
                  </td>
                  <td>{item.sn}</td>
                  {isAdmin && (
                    <td style={{ position: "relative" }}>
                      <button
                        ref={(el) => (buttonRefs.current[item._id] = el)}
                        onClick={() => toggleDropdown(item._id)}
                        className="btn btn-outline-secondary"
                      >
                        <FaArrowRight />
                      </button>
                      {dropdownOpenId === item._id && (
                        <div
                          style={{
                            position: "absolute",
                            top: "100%",
                            left: 0,
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            zIndex: 1000,
                            padding: "8px",
                            minWidth: "140px",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-warning mb-2 w-100"
                            onClick={() => markItemAsDefective(item._id)}
                          >
                            סמן כתקול
                          </button>
                          <button
                            className="btn btn-sm btn-primary mb-2 w-100"
                            onClick={() => startEdit(item)}
                          >
                            ערוך
                          </button>
                          <button
                            className="btn btn-sm btn-danger w-100"
                            onClick={() => {
                              if (window.confirm("האם למחוק את הפריט?")) deleteItem(item._id);
                            }}
                          >
                            מחק
                          </button>
                        </div>
                      )}
                    </td>
                  )}
                </>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {isAdmin && showModal && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">הוספת פריט</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-control mb-2"
                  value={newItem.idNumber}
                  onChange={(e) => {
                    const selectedTz = e.target.value;
                    const selectedUser = users.find((user) => user.tz === selectedTz);
                    if (selectedUser) {
                      setNewItem((prev) => ({
                        ...prev,
                        idNumber: selectedUser.tz,
                        name: selectedUser.fullName,
                      }));
                    } else {
                      setNewItem((prev) => ({
                        ...prev,
                        idNumber: "",
                        name: "",
                      }));
                    }
                  }}
                >
                  <option value="">בחר משתמש</option>
                  {users.map((user) => (
                    <option key={user.tz} value={user.tz}>
                      {user.fullName} - {user.tz}
                    </option>
                  ))}
                </select>

                <select
                  className="form-control mb-2"
                  value={newItem.item}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, item: e.target.value }))}
                >
                  <option value="">בחר פריט</option>
                  <option value="מחשב נייח">🖥️ מחשב נייח</option>
                  <option value="מחשב נייד">💻 מחשב נייד</option>
                  <option value="עכבר">🖱️ עכבר</option>
                  <option value="ספר">📘 ספר</option>
                  <option value="אחר">📦 אחר</option>
                </select>

                <input
                  type="text"
                  placeholder="SN"
                  className="form-control mb-2"
                  value={newItem.sn}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, sn: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  סגור
                </button>
                <button className="btn btn-primary" onClick={handleSubmitNewItem}>
                  הוסף פריט
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormHook;
