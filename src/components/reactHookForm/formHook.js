import React, { useState, useRef, useEffect } from "react";
import Table from "react-bootstrap/Table";
import { FaArrowRight } from "react-icons/fa";
import { DotLottieReact } from "@lottiefiles/dotlottie-react";
import Button from "react-bootstrap/Button";
import axios from "axios";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import SignatureCanvas from "react-signature-canvas";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


const FormHook = () => {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [dropdownOpenId, setDropdownOpenId] = useState(null);
  const [menuPosition, setMenuPosition] = useState({ top: 0, left: 0 });
  const [editRowId, setEditRowId] = useState(null);
  const [editData, setEditData] = useState({});
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

  useEffect(() => {
    if (isLoggedIn) {
      fetchItems();
    }
  }, [isLoggedIn]);

  const ONE_MONTH_MS = 30 * 24 * 60 * 60 * 1000;

  const filteredItemsWithSignatureStatus = items
    .filter(item => item.status !== "defective") // רק פריטים כשירים
    .map(item => {
      let signatureExpired = false;
      if (item.signatureDate) {
        const lastSignature = new Date(item.signatureDate);
        const now = new Date();
        if (now - lastSignature > ONE_MONTH_MS) {
          signatureExpired = true;
        }
      } else {
        signatureExpired = true;
      }
      return { ...item, signatureExpired };
    });

  useEffect(() => {
    const expired = filteredItemsWithSignatureStatus.find(item => item.signatureExpired);
    if (expired) {
      setSelectedItemId(expired._id);
      setSignatureModalOpen(true);
    }
  }, [items]); 

  const markItemAsDefective = (id) => {
    axios.put(`http://localhost:5000/api/items/${id}/mark-defective`, {}, { headers: getAuthHeaders() })
.then(() => {
  fetchItems();
  toast.success("הפריט סומן כתקול והוסר מהרשימה");
})
      .catch((err) => {
        console.error("שגיאה בסימון כתקול:", err);
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
    axios.post(`http://localhost:5000/api/items/${selectedItemId}/sign`,
      { signature: dataUrl },
      { headers: getAuthHeaders() }
    ).then(() => {
      alert("חתימה נשמרה בהצלחה");
      setSignatureModalOpen(false);
      fetchItems();
    }).catch((err) => {
      console.error("שגיאה בשמירת חתימה:", err);
    });
  };

  const toggleDropdown = (id) => {
    const button = buttonRefs.current[id];
    if (button) {
      const rect = button.getBoundingClientRect();
      setMenuPosition({ top: rect.bottom + window.scrollY, left: rect.left + window.scrollX });
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
          autoplay loop
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
          type="text" className="form-control" placeholder="חפש..."
          value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
          style={{ paddingRight: "2rem", width: "70%" }}
        />
        <button className="btn btn-success ms-2" onClick={exportToExcel}>
          ייצא לאקסל
        </button>
      </div>

      <Table responsive bordered hover>
        <thead>
          <tr>
            <th>שם מלא</th><th>ת"ז</th><th>פריט</th><th>SN</th><th>חתימה</th>{isAdmin && <th>פעולות</th>}
          </tr>
        </thead>
        <tbody>
{filteredItemsWithSignatureStatus.filter(item =>
  item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.idNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.item.toLowerCase().includes(searchTerm.toLowerCase()) ||
  item.sn.toLowerCase().includes(searchTerm.toLowerCase())
).map((item) => (
            <tr key={item._id}>
              <td>{item.name}</td>
              <td>{item.idNumber}</td>
              <td>{itemIcons[item.item]} {item.item}</td>
              <td>{item.sn}</td>
              <td>
                {item.signature ? (
                  <>
                    <img src={item.signature} alt="חתימה" style={{ width: 100, height: 50, border: "1px solid #ccc" }} />
                    {item.signatureExpired && (
                      <div style={{ color: "red", fontWeight: "bold" }}>יש לחדש חתימה</div>
                    )}
                  </>
                ) : (
                  <button className="btn btn-sm btn-info" onClick={() => openSignatureModal(item._id)}>
                    חתום
                  </button>
                )}
              </td>
              {isAdmin && (
                <td>
                  <button
                    ref={(el) => (buttonRefs.current[item._id] = el)}
                    onClick={() => toggleDropdown(item._id)}
                    className="btn btn-outline-secondary"
                  >
                    <FaArrowRight />
                  </button>
                  {dropdownOpenId === item._id && (
                    <div style={{
                      position: "absolute", background: "white", border: "1px solid #ccc", borderRadius: "4px",
                      zIndex: 1000, padding: "8px", minWidth: "140px", boxShadow: "0 2px 5px rgba(0,0,0,0.15)"
                    }}>
                      <button
                        className="btn btn-sm btn-warning mb-2 w-100"
                        onClick={() => markItemAsDefective(item._id)}
                        disabled={item.signatureExpired}
                      >
                        סמן כתקול
                      </button>
                      {item.signatureExpired && (
                        <div style={{ fontSize: "0.8rem", color: "red" }}>חובה לחדש חתימה</div>
                      )}
                    </div>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>

      {signatureModalOpen && (
        <div className="modal show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">חתום על הציוד</h5>
                <button type="button" className="btn-close" onClick={() => setSignatureModalOpen(false)}></button>
              </div>
              <div className="modal-body text-center">
                <SignatureCanvas
                  penColor="black"
                  ref={signaturePadRef}
                  canvasProps={{ width: 400, height: 200, className: "sigCanvas", style: { border: "1px solid #000" } }}
                />
                <div className="mt-2">
                  <Button variant="secondary" className="me-2" onClick={() => signaturePadRef.current.clear()}>נקה</Button>
                  <Button variant="primary" onClick={handleSaveSignature}>אשר חתימה</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
          <ToastContainer
            position="bottom-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="colored"
          />

    </div>
    
  );
};

export default FormHook;
