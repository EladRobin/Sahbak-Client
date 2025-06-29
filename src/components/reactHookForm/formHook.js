import React, { useState, useRef, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaArrowRight } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SignatureCanvas from "react-signature-canvas";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

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
  const [signatureModalOpen, setSignatureModalOpen] = useState(false);
  const [selectedItemId, setSelectedItemId] = useState(null);
  const signaturePadRef = useRef();
  const buttonRefs = useRef({});
  const isLoggedIn = !!localStorage.getItem("token");
  const isAdmin = localStorage.getItem("isAdmin") === "true";

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

  // --- Fetch items and users ---
  const fetchItems = () => {
    axios
      .get("http://localhost:5000/api/items", { headers: getAuthHeaders() })
      .then((res) => setItems(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה בשליפה:", err);
        }
      });
  };

  const fetchUsers = () => {
    axios
      .get("http://localhost:5000/api/users", { headers: getAuthHeaders() })
      .then((res) => setUsers(res.data))
      .catch((err) => {
        if (err.response?.status === 401) {
          alert("הסשן שלך פג. אנא התחבר מחדש.");
          localStorage.clear();
          window.location.href = "/login";
        } else {
          console.error("שגיאה בטעינת משתמשים:", err);
        }
      });
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
      if (isAdmin) fetchUsers();
    }
  }, [isLoggedIn, isAdmin]);

  // --- Filtered & enhanced items with signatureExpired flag ---
  const filteredItemsWithSignatureStatus = items
    .filter(item => item.status !== "defective")
    .filter(item => {
      const term = searchTerm.toLowerCase();
      return (
        item.name.toLowerCase().includes(term) ||
        item.idNumber.toLowerCase().includes(term) ||
        item.item.toLowerCase().includes(term) ||
        item.sn.toLowerCase().includes(term)
      );
    })
    .map(item => {
      let signatureExpired = false;
      if (item.signatureDate) {
        const lastSignature = new Date(item.signatureDate);
        const now = new Date();
        if (now - lastSignature > ONE_MONTH_MS) signatureExpired = true;
      } else {
        signatureExpired = true;
      }
      return { ...item, signatureExpired };
    });

  // --- Open signature modal automatically for first expired signature item ---
  useEffect(() => {
    const expiredItem = filteredItemsWithSignatureStatus.find(item => item.signatureExpired);
    if (expiredItem) {
      setSelectedItemId(expiredItem._id);
      setSignatureModalOpen(true);
    }
  }, [items]);

  // --- Handlers ---

  const handleSubmitNewItem = () => {
    if (!newItem.name || !newItem.idNumber || !newItem.item || !newItem.sn) {
      alert("אנא מלא את כל השדות");
      return;
    }
    axios
      .post("http://localhost:5000/api/items", newItem, { headers: getAuthHeaders() })
      .then(() => {
        toast.success("פריט נוסף בהצלחה");
        fetchItems();
        setNewItem({ name: "", idNumber: "", item: "", sn: "" });
        setShowModal(false);
      })
      .catch((err) => {
        console.error("שגיאה בהוספה:", err.response?.data || err.message);
        toast.error("שגיאה בהוספת פריט");
      });
  };

  const deleteItem = (id) => {
    axios
      .delete(`http://localhost:5000/api/items/${id}`, { headers: getAuthHeaders() })
      .then(() => {
        toast.success("פריט נמחק בהצלחה");
        fetchItems();
        setDropdownOpenId(null);
      })
      .catch((err) => {
        console.error("שגיאה במחיקה:", err);
        toast.error("שגיאה במחיקת פריט");
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
      .put(`http://localhost:5000/api/items/${editRowId}`, editData, { headers: getAuthHeaders() })
      .then(() => {
        toast.success("פריט עודכן בהצלחה");
        fetchItems();
        setEditRowId(null);
        setDropdownOpenId(null);
      })
      .catch((err) => {
        console.error("שגיאה בעדכון:", err);
        toast.error("שגיאה בעדכון פריט");
      });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const markItemAsDefective = (id) => {
    const itemToUpdate = items.find((item) => item._id === id);
    if (!itemToUpdate) return;
    const updatedData = {
      ...itemToUpdate,
      status: "defective",
    };
    axios
      .put(`http://localhost:5000/api/items/${id}`, updatedData, { headers: getAuthHeaders() })
      .then(() => {
        toast.success("הפריט סומן כתקול");
        fetchItems();
        setDropdownOpenId(null);
      })
      .catch((err) => {
        console.error("שגיאה בסימון כתקול:", err);
        toast.error("שגיאה בסימון כתקול");
      });
  };

  const openSignatureModal = (itemId) => {
    setSelectedItemId(itemId);
    setSignatureModalOpen(true);
  };

  const handleSaveSignature = () => {
    if (signaturePadRef.current.isEmpty()) {
      alert("אנא חתום קודם");
      return;
    }
    const dataUrl = signaturePadRef.current.toDataURL();
    axios
      .post(
        `http://localhost:5000/api/items/${selectedItemId}/sign`,
        { signature: dataUrl },
        { headers: getAuthHeaders() }
      )
      .then(() => {
        toast.success("חתימה נשמרה בהצלחה");
        setSignatureModalOpen(false);
        fetchItems();
      })
      .catch((err) => {
        console.error("שגיאה בשמירת חתימה:", err);
        toast.error("שגיאה בשמירת חתימה");
      });
  };

  // Toggle dropdown + calculate position + keep dropdown inside viewport
  const toggleDropdown = (id) => {
    const button = buttonRefs.current[id];
    if (button) {
      const rect = button.getBoundingClientRect();
      const dropdownWidth = 200;
      const dropdownHeight = 150;
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let leftPos = rect.left;
      if (leftPos + dropdownWidth > viewportWidth) {
        leftPos = viewportWidth - dropdownWidth - 10; // margin from right edge
      }

      let topPos = rect.bottom + 5;
      if (topPos + dropdownHeight > viewportHeight) {
        topPos = rect.top - dropdownHeight - 5; // show above button if no space below
      }

      setMenuPosition({ top: topPos + window.scrollY, left: leftPos + window.scrollX });
      setDropdownOpenId(dropdownOpenId === id ? null : id);
    }
  };

  const exportToExcel = () => {
    if (filteredItemsWithSignatureStatus.length === 0) {
      alert("אין נתונים לייצוא");
      return;
    }
    const dataToExport = filteredItemsWithSignatureStatus.map(({ name, idNumber, item, sn }) => ({
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
            <th>חתימה</th>
            {isAdmin && <th>פעולות</th>}
          </tr>
        </thead>
        <tbody>
          {filteredItemsWithSignatureStatus.map((item) => (
            <tr
              key={item._id}
              style={item.status === "defective" ? { backgroundColor: "#f8d7da" } : {}}
            >
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
                    <div style={{ color: "gray", fontSize: "0.9rem" }}>עריכה לא זמינה לחתימה</div>
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
                  <td>
                    {item.signature ? (
                      <>
                        <img
                          src={item.signature}
                          alt="חתימה"
                          style={{ width: 100, height: 50, border: "1px solid #ccc" }}
                        />
                        {item.signatureExpired && (
                          <div style={{ color: "red", fontWeight: "bold" }}>יש לחדש חתימה</div>
                        )}
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-info"
                        onClick={() => openSignatureModal(item._id)}
                      >
                        חתום
                      </button>
                    )}
                  </td>
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
                            position: "fixed",
                            top: menuPosition.top,
                            left: menuPosition.left,
                            background: "white",
                            border: "1px solid #ccc",
                            borderRadius: "4px",
                            zIndex: 10000,
                            padding: "8px",
                            maxWidth: "200px",
                            maxHeight: "150px",
                            overflowY: "auto",
                            boxShadow: "0 2px 5px rgba(0,0,0,0.15)",
                            display: "flex",
                            flexDirection: "column",
                            gap: "6px",
                          }}
                        >
                          <button
                            className="btn btn-sm btn-warning"
                            onClick={() => markItemAsDefective(item._id)}
                            disabled={item.signatureExpired}
                            title={item.signatureExpired ? "חובה לחדש חתימה לפני סימון תקול" : ""}
                          >
                            סמן כתקול
                          </button>
                          <button
                            className="btn btn-sm btn-primary"
                            onClick={() => startEdit(item)}
                          >
                            ערוך
                          </button>
                          <button
                            className="btn btn-sm btn-danger"
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

      {/* מודל הוספה */}
      {isAdmin && showModal && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">הוספת פריט</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <select
                  className="form-control mb-2"
                  value={newItem.idNumber}
                  onChange={(e) => {
                    const selectedTz = e.target.value;
                    const selectedUser = users.find((user) => user.tz === selectedTz);
                    setNewItem((prev) => ({
                      ...prev,
                      idNumber: selectedTz,
                      name: selectedUser ? selectedUser.fullName : "",
                    }));
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
                  className="form-control mb-2"
                  placeholder="מספר סידורי (SN)"
                  value={newItem.sn}
                  onChange={(e) => setNewItem((prev) => ({ ...prev, sn: e.target.value }))}
                />
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  ביטול
                </button>
                <button className="btn btn-primary" onClick={handleSubmitNewItem}>
                  הוסף
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* מודל חתימה */}
      {signatureModalOpen && (
        <div
          className="modal show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
          onClick={() => setSignatureModalOpen(false)}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">חתום על הפריט</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setSignatureModalOpen(false)}
                ></button>
              </div>
              <div className="modal-body">
                <SignatureCanvas
                  ref={signaturePadRef}
                  penColor="black"
                  canvasProps={{ width: 500, height: 200, className: "signature-canvas" }}
                  backgroundColor="#fff"
                  clearOnResize={false}
                />
                <div className="mt-2">
                  <button
                    className="btn btn-outline-danger me-2"
                    onClick={() => signaturePadRef.current.clear()}
                  >
                    נקה חתימה
                  </button>
                  <button className="btn btn-primary" onClick={handleSaveSignature}>
                    שמור חתימה
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />

      <style>{`
        .signature-canvas {
          border: 1px solid #ccc;
          border-radius: 4px;
        }
      `}</style>
    </div>
  );
};

export default FormHook;
