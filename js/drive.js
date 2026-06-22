// ============================================================
// Drive module — Google Drive API v3
// Handles receipt uploads to ExpenseTracker/Receipts/ folder.
// ============================================================

const Drive = (function () {
  const BASE = 'https://www.googleapis.com/drive/v3';
  const UPLOAD_BASE = 'https://www.googleapis.com/upload/drive/v3';

  // ---- Folder management ----

  async function findOrCreateReceiptsFolder() {
    const cached = localStorage.getItem('et_drive_receipts_folder');
    if (cached) return cached;

    const token = Auth.getToken();

    let parentId = localStorage.getItem('et_drive_folder');
    if (!parentId) {
      parentId = await _findOrCreateFolder('ExpenseTracker', null, token);
      localStorage.setItem('et_drive_folder', parentId);
    }

    const receiptsId = await _findOrCreateFolder('Receipts', parentId, token);
    localStorage.setItem('et_drive_receipts_folder', receiptsId);
    return receiptsId;
  }

  async function _findOrCreateFolder(name, parentId, token) {
    const parentClause = parentId ? ` and '${parentId}' in parents` : '';
    const q = `name='${name}' and mimeType='application/vnd.google-apps.folder' and trashed=false${parentClause}`;
    const res = await fetch(`${BASE}/files?q=${encodeURIComponent(q)}&fields=files(id)`, {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    if (!res.ok) throw { status: res.status };
    const data = await res.json();

    if (data.files && data.files.length > 0) return data.files[0].id;

    // Create
    const body = { name, mimeType: 'application/vnd.google-apps.folder' };
    if (parentId) body.parents = [parentId];
    const createRes = await fetch(`${BASE}/files`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
    if (!createRes.ok) throw { status: createRes.status };
    return (await createRes.json()).id;
  }

  // ---- Upload ----

  async function uploadReceipt(file, label) {
    const folderId = await findOrCreateReceiptsFolder();
    const token = Auth.getToken();

    const rawExt = file.name ? file.name.split('.').pop() : '';
    const ext = rawExt || (file.type === 'application/pdf' ? 'pdf' : 'jpg');
    const safeName = `receipt-${label}-${Date.now()}.${ext}`.replace(/[^a-zA-Z0-9\-_.]/g, '_');

    const boundary = 'et_mp_' + Date.now();
    const metadata = JSON.stringify({ name: safeName, parents: [folderId] });

    const enc = new TextEncoder();
    const metaBytes  = enc.encode(`--${boundary}\r\nContent-Type: application/json; charset=UTF-8\r\n\r\n${metadata}\r\n`);
    const fileHeader = enc.encode(`--${boundary}\r\nContent-Type: ${file.type}\r\n\r\n`);
    const closing    = enc.encode(`\r\n--${boundary}--`);
    const fileBytes  = new Uint8Array(await file.arrayBuffer());

    const body = new Uint8Array(metaBytes.length + fileHeader.length + fileBytes.length + closing.length);
    let off = 0;
    body.set(metaBytes,  off); off += metaBytes.length;
    body.set(fileHeader, off); off += fileHeader.length;
    body.set(fileBytes,  off); off += fileBytes.length;
    body.set(closing,    off);

    const uploadRes = await fetch(
      `${UPLOAD_BASE}/files?uploadType=multipart&fields=id,webViewLink`,
      {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/related; boundary=${boundary}`,
          'Authorization': `Bearer ${token}`,
        },
        body,
      }
    );
    if (!uploadRes.ok) throw { status: uploadRes.status };
    const uploaded = await uploadRes.json();

    // Make file readable by anyone with the link
    await fetch(`${BASE}/files/${uploaded.id}/permissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({ role: 'reader', type: 'anyone' }),
    });

    return uploaded.webViewLink;
  }

  // ---- Image compression (canvas resize + JPEG re-encode) ----

  function compressImage(file) {
    return new Promise((resolve) => {
      const MAX = 1600;
      const img = new Image();
      const objectUrl = URL.createObjectURL(file);

      img.onload = () => {
        URL.revokeObjectURL(objectUrl);
        let { width, height } = img;
        if (width > MAX || height > MAX) {
          if (width >= height) {
            height = Math.round((height / width) * MAX);
            width = MAX;
          } else {
            width = Math.round((width / height) * MAX);
            height = MAX;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d').drawImage(img, 0, 0, width, height);
        canvas.toBlob(
          (blob) => {
            resolve(new File([blob], file.name.replace(/\.[^.]+$/, '.jpg'), { type: 'image/jpeg' }));
          },
          'image/jpeg',
          0.82
        );
      };

      img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
      img.src = objectUrl;
    });
  }

  return { findOrCreateReceiptsFolder, uploadReceipt, compressImage };
})();
