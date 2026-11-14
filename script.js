// script.js — frontend only (no backend), using localStorage

document.addEventListener('DOMContentLoaded', () => {
  // Toggle views
  document.getElementById('show-client').addEventListener('click', () => toggleViews('client'));
  document.getElementById('show-admin').addEventListener('click', () => {
    toggleViews('admin');
    renderAdmin();
  });

  // Submit booking form
  document.getElementById('booking-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('client-name').value.trim();
    const email = document.getElementById('client-email').value.trim();
    const datetime = document.getElementById('date-time').value;
    const message = document.getElementById('message').value.trim();

    if (!name || !email || !datetime) {
      alert("Please fill all required fields.");
      return;
    }

    // Save request in localStorage
    const requests = JSON.parse(localStorage.getItem('appointments') || "[]");
    requests.push({
      id: Date.now(),
      name,
      email,
      datetime,
      message,
      status: "pending"
    });
    localStorage.setItem('appointments', JSON.stringify(requests));

    alert("Request sent! (saved in browser storage only)");
    document.getElementById('booking-form').reset();
    renderClient(email);
  });

  // Load client requests when email changes
  document.getElementById('client-email').addEventListener('change', (e) => {
    renderClient(e.target.value.trim());
  });
});

// Toggle between Client and Admin views
function toggleViews(view) {
  document.getElementById('client-view').style.display = view === 'client' ? '' : 'none';
  document.getElementById('admin-view').style.display = view === 'admin' ? '' : 'none';
}

// Render client requests
function renderClient(email) {
  const container = document.getElementById('client-requests');
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]")
    .filter(r => r.email === email);

  container.innerHTML = '';
  if (requests.length === 0) {
    container.innerHTML = `<div class="text-muted">No requests for ${email}</div>`;
    return;
  }

  requests.forEach(r => {
    const item = document.createElement('div');
    item.className = 'list-group-item';
    item.innerHTML = `
      <strong>${new Date(r.datetime).toLocaleString()}</strong>
      — status: <strong>${r.status}</strong><br>
      <span class="meta">${r.message || ''}</span>
    `;
    container.appendChild(item);
  });
}

// Render admin requests
function renderAdmin() {
  const containerPending = document.getElementById('admin-requests');
  const containerAll = document.getElementById('all-requests');
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]");

  // Pending requests
  const pending = requests.filter(r => r.status === 'pending');
  containerPending.innerHTML = '';
  if (pending.length === 0) {
    containerPending.innerHTML = `<div class="text-muted">No pending requests</div>`;
  } else {
    pending.forEach(r => {
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-start';
      item.innerHTML = `
        <div>
          <strong>${r.name}</strong>
          <div class="meta">${new Date(r.datetime).toLocaleString()} • ${r.email}</div>
          <div>${r.message || ''}</div>
        </div>
        <div class="btn-group-vertical btn-group-sm">
          <button class="btn btn-success btn-small" onclick="respond(${r.id}, 'accepted')">Accept</button>
          <button class="btn btn-danger btn-small" onclick="respond(${r.id}, 'rejected')">Reject</button>
        </div>
      `;
      containerPending.appendChild(item);
    });
  }

  // All requests
  containerAll.innerHTML = '';
  if (requests.length === 0) {
    containerAll.innerHTML = `<div class="text-muted">No requests yet</div>`;
    return;
  }
  requests.forEach(r => {
    const item = document.createElement('div');
    item.className = 'list-group-item';
    item.innerHTML = `
      <strong>${r.name}</strong> — ${new Date(r.datetime).toLocaleString()}
      <span class="badge bg-${r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'secondary'} ms-2">
        ${r.status}
      </span>
    `;
    containerAll.appendChild(item);
  });
}

// Accept/Reject request
function respond(id, status) {
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]");
  const idx = requests.findIndex(r => r.id === id);
  if (idx !== -1) {
    requests[idx].status = status;
    localStorage.setItem('appointments', JSON.stringify(requests));
    renderAdmin();
  }
}
document.addEventListener('DOMContentLoaded', () => {
  // Handle login
  document.getElementById('login-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const role = document.getElementById('role').value;
    const email = document.getElementById('email').value.trim();

    if (!role || !email) {
      alert("Please select role and enter email.");
      return;
    }

    // Save logged-in user info
    localStorage.setItem('loggedUser', JSON.stringify({ role, email }));

    // Show correct view
    if (role === "client") {
      toggleViews('client');
      renderClient(email);
    } else {
      toggleViews('admin');
      renderAdmin();
    }

    document.getElementById('login-view').style.display = "none"; // hide login
  });

  // Auto-login if already stored
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || "null");
  if (loggedUser) {
    if (loggedUser.role === "client") {
      toggleViews('client');
      renderClient(loggedUser.email);
    } else {
      toggleViews('admin');
      renderAdmin();
    }
    document.getElementById('login-view').style.display = "none";
  }
});

// Update toggleViews so navbar is not required anymore
function toggleViews(view) {
  document.getElementById('client-view').style.display = view === 'client' ? '' : 'none';
  document.getElementById('admin-view').style.display = view === 'admin' ? '' : 'none';
}
// --- AUTHENTICATION (login/signup) ---

// Handle tab switching on login.html
const loginTab = document.getElementById('login-tab');
const signupTab = document.getElementById('signup-tab');
const loginForm = document.getElementById('login-form');
const signupForm = document.getElementById('signup-form');

if (loginTab && signupTab) {
  loginTab.addEventListener('click', () => {
    loginForm.style.display = '';
    signupForm.style.display = 'none';
    loginTab.classList.add('active');
    signupTab.classList.remove('active');
  });

  signupTab.addEventListener('click', () => {
    loginForm.style.display = 'none';
    signupForm.style.display = '';
    signupTab.classList.add('active');
    loginTab.classList.remove('active');
  });
}

// Signup
if (signupForm) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('signup-name').value.trim();
    const email = document.getElementById('signup-email').value.trim();
    const password = document.getElementById('signup-password').value;
    const role = document.getElementById('signup-role').value;

    let users = JSON.parse(localStorage.getItem('users') || "[]");

    if (users.some(u => u.email === email)) {
      alert("Email already registered!");
      return;
    }

    users.push({ name, email, password, role });
    localStorage.setItem('users', JSON.stringify(users));

    alert("Signup successful! Please login.");
    signupForm.reset();
    loginTab.click(); // switch back to login
  });
}

// Login
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value.trim();
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users') || "[]");
    const user = users.find(u => u.email === email && u.password === password);

    if (!user) {
      alert("Invalid email or password!");
      return;
    }

    localStorage.setItem('loggedUser', JSON.stringify(user));
    window.location.href = "index.html"; // redirect to main system
  });
}

// --- PROTECT INDEX.HTML ---
if (window.location.pathname.endsWith("index.html")) {
  const loggedUser = JSON.parse(localStorage.getItem('loggedUser') || "null");
  if (!loggedUser) {
    window.location.href = "login.html"; // not logged in
  } else {
    // Show correct section
    if (loggedUser.role === "client") {
      toggleViews('client');
      renderClient(loggedUser.email);
    } else {
      toggleViews('admin');
      renderAdmin();
    }
  }
}

// --- EXISTING FUNCTIONS (from previous script.js) ---
function toggleViews(view) {
  document.getElementById('client-view').style.display = view === 'client' ? '' : 'none';
  document.getElementById('admin-view').style.display = view === 'admin' ? '' : 'none';
}

function renderClient(email) {
  const container = document.getElementById('client-requests');
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]")
    .filter(r => r.email === email);

  container.innerHTML = '';
  if (requests.length === 0) {
    container.innerHTML = `<div class="text-muted">No requests for ${email}</div>`;
    return;
  }

  requests.forEach(r => {
    const item = document.createElement('div');
    item.className = 'list-group-item';
    item.innerHTML = `
      <strong>${new Date(r.datetime).toLocaleString()}</strong>
      — status: <strong>${r.status}</strong><br>
      <span class="meta">${r.message || ''}</span>
    `;
    container.appendChild(item);
  });
}

function renderAdmin() {
  const containerPending = document.getElementById('admin-requests');
  const containerAll = document.getElementById('all-requests');
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]");

  // Pending requests
  const pending = requests.filter(r => r.status === 'pending');
  containerPending.innerHTML = '';
  if (pending.length === 0) {
    containerPending.innerHTML = `<div class="text-muted">No pending requests</div>`;
  } else {
    pending.forEach(r => {
      const item = document.createElement('div');
      item.className = 'list-group-item d-flex justify-content-between align-items-start';
      item.innerHTML = `
        <div>
          <strong>${r.name}</strong>
          <div class="meta">${new Date(r.datetime).toLocaleString()} • ${r.email}</div>
          <div>${r.message || ''}</div>
        </div>
        <div class="btn-group-vertical btn-group-sm">
          <button class="btn btn-success btn-small" onclick="respond(${r.id}, 'accepted')">Accept</button>
          <button class="btn btn-danger btn-small" onclick="respond(${r.id}, 'rejected')">Reject</button>
        </div>
      `;
      containerPending.appendChild(item);
    });
  }

  // All requests
  containerAll.innerHTML = '';
  if (requests.length === 0) {
    containerAll.innerHTML = `<div class="text-muted">No requests yet</div>`;
    return;
  }
  requests.forEach(r => {
    const item = document.createElement('div');
    item.className = 'list-group-item';
    item.innerHTML = `
      <strong>${r.name}</strong> — ${new Date(r.datetime).toLocaleString()}
      <span class="badge bg-${r.status === 'accepted' ? 'success' : r.status === 'rejected' ? 'danger' : 'secondary'} ms-2">
        ${r.status}
      </span>
    `;
    containerAll.appendChild(item);
  });
}

function respond(id, status) {
  const requests = JSON.parse(localStorage.getItem('appointments') || "[]");
  const idx = requests.findIndex(r => r.id === id);
  if (idx !== -1) {
    requests[idx].status = status;
    localStorage.setItem('appointments', JSON.stringify(requests));
    renderAdmin();
  }
}
function logout() {
  localStorage.removeItem('loggedUser');
  window.location.href = "login.html";
}
function convertToPakistanTime(dateStr, timeStr) {
  // Combine date & time into one string
  let localDateTime = new Date(dateStr + "T" + timeStr);

  // Convert to Pakistan Standard Time (UTC+5)
  let options = { timeZone: "Asia/Karachi", hour12: false };
  let pkDate = localDateTime.toLocaleDateString("en-GB", options);
  let pkTime = localDateTime.toLocaleTimeString("en-GB", options);

  return pkDate + " " + pkTime + " (PKT)";
}

// Example usage:
let booking = convertToPakistanTime("2025-09-16", "14:30");
console.log(booking); // 👉 "16/09/2025 14:30 (PKT)"
function toggleDoctorFields() {
  const role = document.getElementById("signup-role").value;
  const doctorFields = document.getElementById("doctorFields");

  doctorFields.style.display = role === "admin" ? "block" : "none";
}

