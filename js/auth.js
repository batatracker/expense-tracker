// ============================================================
// Auth module — Google Identity Services OAuth 2.0
// Wraps the GIS token-based flow (no server needed).
// ============================================================

const Auth = (function () {
  let _tokenClient = null;
  let _accessToken = null;
  let _userInfo = null;

  // Resolve/reject stored for the sign-in promise
  let _resolveSignIn = null;
  let _rejectSignIn = null;

  function init() {
    return new Promise((resolve) => {
      if (typeof google === 'undefined') {
        // GIS script not loaded yet — wait for it
        window.addEventListener('load', () => _initClient(resolve), { once: true });
      } else {
        _initClient(resolve);
      }
    });
  }

  function _initClient(done) {
    const clientId = localStorage.getItem('et_client_id');

    // Include drive.file scope only when receipt upload is enabled.
    let scope = CONFIG.SCOPES_BASE;
    try {
      const settings = JSON.parse(localStorage.getItem('et_settings') || '{}');
      if (settings.receiptUpload) scope += ' ' + CONFIG.SCOPE_DRIVE;
    } catch {}

    _tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope,
      callback: (response) => {
        if (response.error) {
          if (_rejectSignIn) _rejectSignIn(new Error(response.error));
          return;
        }
        _accessToken = response.access_token;
        sessionStorage.setItem('et_token', _accessToken);
        _fetchUserInfo().then((info) => {
          _userInfo = info;
          if (_resolveSignIn) _resolveSignIn({ token: _accessToken, userInfo: info });
        }).catch((err) => {
          if (_rejectSignIn) _rejectSignIn(err);
        });
      },
    });
    if (done) done();
  }

  async function _fetchUserInfo() {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${_accessToken}` },
    });
    if (!res.ok) throw { status: res.status };
    return res.json();
  }

  function signIn() {
    return new Promise((resolve, reject) => {
      _resolveSignIn = resolve;
      _rejectSignIn = reject;
      // Prompt for consent
      _tokenClient.requestAccessToken({ prompt: 'consent' });
    });
  }

  function signOut() {
    if (_accessToken) {
      google.accounts.oauth2.revoke(_accessToken, () => {});
    }
    _accessToken = null;
    _userInfo = null;
    sessionStorage.removeItem('et_token');
  }

  function getToken() {
    return _accessToken;
  }

  function setToken(token) {
    _accessToken = token;
  }

  async function fetchUserInfo() {
    if (!_accessToken) return null;
    try {
      const info = await _fetchUserInfo();
      _userInfo = info;
      return info;
    } catch {
      return null;
    }
  }

  function getUserInfo() {
    return _userInfo;
  }

  return { init, signIn, signOut, getToken, setToken, fetchUserInfo, getUserInfo };
})();
