import React, { useRef, useState } from 'react';
import SignaturePad from 'react-signature-canvas';
import axios from 'axios';
import { Box, Button, Typography, Snackbar, Alert } from '@mui/material';

const SignPage = () => {
  const sigPad = useRef(null);
  const userId = localStorage.getItem('userId');

  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const clear = () => {
    sigPad.current.clear();
  };

  const save = async () => {
    if (sigPad.current.isEmpty()) {
      setErrorMsg("לא נחתמה חתימה, אנא חתום תחילה");
      return;
    }
    const dataUrl = sigPad.current.toDataURL('image/png');

    try {
      await axios.post('http://localhost:5000/api/users/save-signature', {
        userId,
        signature: dataUrl,
      });
      setSuccessMsg('חתימה נשמרה בהצלחה!');
      clear();
    } catch (err) {
      console.error('שגיאה בשמירת החתימה:', err);
      setErrorMsg('שגיאה בשמירת החתימה');
    }
  };

  return (
    <Box sx={{ mt: 6, textAlign: 'center' }}>
      <Typography variant="h5" sx={{ mb: 2 }}>חתום כאן</Typography>
      <Box
        sx={{
          border: '2px solid #1976d2',
          borderRadius: '8px',
          display: 'inline-block',
        }}
      >
        <SignaturePad
          ref={sigPad}
          canvasProps={{
            width: 400,
            height: 200,
            className: 'signatureCanvas'
          }}
        />
      </Box>
      <Box sx={{ mt: 2 }}>
        <Button variant="outlined" onClick={clear} sx={{ mx: 1 }}>
          נקה
        </Button>
        <Button variant="contained" onClick={save}>
          שמור חתימה
        </Button>
      </Box>

      <Snackbar open={!!successMsg} autoHideDuration={3000} onClose={() => setSuccessMsg('')}>
        <Alert severity="success" sx={{ width: '100%' }} onClose={() => setSuccessMsg('')}>
          {successMsg}
        </Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={3000} onClose={() => setErrorMsg('')}>
        <Alert severity="error" sx={{ width: '100%' }} onClose={() => setErrorMsg('')}>
          {errorMsg}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default SignPage;
