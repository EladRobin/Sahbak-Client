import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import {
  Card,
  CardContent,
  Avatar,
  Typography,
  Box,
  Button,
  CircularProgress,
  Container,
  TextField,
  Snackbar,
  Alert,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

const ProfileCard = () => {
  const userId = localStorage.getItem('userId');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const fileInputRef = useRef(null);

  // שדות לעריכה (לוקחים מהמשתמש בעת טעינה)
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [tz, setTz] = useState('');
  const [phone, setPhone] = useState('');
  const [userClass, setUserClass] = useState('');

  // הודעות סטטוס
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // timestamp ל-cache busting תמונה
  const [imgTimestamp, setImgTimestamp] = useState(Date.now());

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await axios.get(`http://localhost:5000/api/users/profile/${userId}`);
        setUser(res.data);
        // מלא את השדות בערכים מהשרת
        setFullName(res.data.fullName || '');
        setEmail(res.data.email || '');
        setTz(res.data.tz || '');
        setPhone(res.data.phone || '');
        setUserClass(res.data.class || '');
      } catch (err) {
        console.error('Error fetching user:', err);
        setErrorMsg('שגיאה בטעינת נתוני המשתמש');
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetchUser();
  }, [userId]);

  // העלאת תמונה
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await axios.post(
        `http://localhost:5000/api/users/upload-image/${userId}`,
        formData,
        { headers: { 'Content-Type': 'multipart/form-data' } }
      );
      setUser((prev) => ({ ...prev, profileImage: res.data.imageUrl || res.data.imagePath }));
      setImgTimestamp(Date.now()); // עדכון הטיימסטמפ לטעינה מחדש של התמונה
      setSuccessMsg('תמונת הפרופיל עודכנה בהצלחה');
    } catch (err) {
      console.error('שגיאה בהעלאת תמונה:', err);
      setErrorMsg('שגיאה בהעלאת תמונה');
    }
  };

  // שמירת עדכון פרטי משתמש
  const handleSaveProfile = async () => {
    try {
      const res = await axios.put(`http://localhost:5000/api/users/profile/${userId}`, {
        fullName,
        email,
        phone,
        class: userClass,
      });
      setUser(res.data);
      setEditMode(false);
      setSuccessMsg('פרטי המשתמש עודכנו בהצלחה');
    } catch (err) {
      console.error('שגיאה בעדכון פרטי משתמש:', err);
      setErrorMsg('שגיאה בעדכון פרטי המשתמש');
    }
  };

  if (loading)
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 8 }}>
        <CircularProgress />
      </Box>
    );

  if (!user)
    return (
      <Typography align="center" variant="h6" sx={{ mt: 8 }}>
        משתמש לא נמצא
      </Typography>
    );

  const profileImageUrl = user.profileImage
    ? `http://localhost:5000${user.profileImage}?t=${imgTimestamp}`
    : 'https://via.placeholder.com/100?text=No+Image';

  return (
    <Container maxWidth="sm" sx={{ mt: 6 }}>
      <Card sx={{ boxShadow: 6, pt: 6, pb: 4, px: 3, textAlign: 'center', position: 'relative' }}>
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2, position: 'relative' }}>
          <Avatar
            src={profileImageUrl}
            alt="תמונת פרופיל"
            sx={{
              width: 120,
              height: 120,
              border: '4px solid #2196f3',
              boxShadow: 3,
            }}
          />
          <Button
            onClick={() => fileInputRef.current.click()}
            sx={{
              position: 'absolute',
              bottom: 0,
              right: 'calc(50% - 60px)',
              backgroundColor: '#2196f3',
              color: 'white',
              borderRadius: '20px',
              fontSize: '0.75rem',
              px: 2,
              py: 0.5,
              mt: 1,
              '&:hover': {
                backgroundColor: '#1976d2',
              },
            }}
            startIcon={<EditIcon />}
          >
            ערוך תמונה
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={handleImageUpload}
          />
        </Box>

        <CardContent sx={{ direction: 'rtl' }}>
          {!editMode ? (
            <>
              <Typography variant="h5" sx={{ mb: 1 }}>
                {user.fullName}
              </Typography>
              <Typography color="text.secondary">{user.email}</Typography>
              {user.tz && <Typography>ת"ז: {user.tz}</Typography>}
              {user.phone && <Typography>טלפון: {user.phone}</Typography>}
              {user.class && <Typography>כיתה / תפקיד: {user.class}</Typography>}

              <Button
                variant="outlined"
                sx={{ mt: 3 }}
                onClick={() => setEditMode(true)}
              >
                ערוך פרטים
              </Button>
            </>
          ) : (
            <>
              <TextField
                fullWidth
                label="שם מלא"
                margin="normal"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              <TextField
                fullWidth
                label="אימייל"
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <TextField
                fullWidth
                label="תעודת זהות"
                margin="normal"
                value={tz}
                disabled
                helperText="תעודת זהות לא ניתנת לשינוי"
              />
              <TextField
                fullWidth
                label="טלפון"
                margin="normal"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
              <TextField
                fullWidth
                label="כיתה / תפקיד"
                margin="normal"
                value={userClass}
                onChange={(e) => setUserClass(e.target.value)}
              />

              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
                <Button variant="contained" color="primary" onClick={handleSaveProfile}>
                  שמור
                </Button>
                <Button variant="outlined" color="error" onClick={() => setEditMode(false)}>
                  ביטול
                </Button>
              </Box>
            </>
          )}
        </CardContent>

        {/* הודעות הצלחה ושגיאה */}
        <Snackbar
          open={!!successMsg}
          autoHideDuration={3000}
          onClose={() => setSuccessMsg('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSuccessMsg('')}>
            {successMsg}
          </Alert>
        </Snackbar>

        <Snackbar
          open={!!errorMsg}
          autoHideDuration={3000}
          onClose={() => setErrorMsg('')}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" sx={{ width: '100%' }} onClose={() => setErrorMsg('')}>
            {errorMsg}
          </Alert>
        </Snackbar>
      </Card>
    </Container>
  );
};

export default ProfileCard;
