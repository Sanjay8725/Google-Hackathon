(function () {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id || user.role !== "organizer") {
    window.location.href = "../auth.html";
    return;
  }

  function logout() {
    localStorage.removeItem("user");
    window.location.href = "../index.html";
  }

  function goDashboard(section) {
    const target = section
      ? `organizer-dashboard.html#${section}`
      : "organizer-dashboard.html";
    window.location.href = target;
  }

  function showSettingsSection(sectionName) {
    // Update active nav item
    document
      .querySelectorAll(".settings-nav")
      .forEach((nav) => nav.classList.remove("active"));
    event.target.classList.add("active");

    // Load the corresponding section content
    loadSettingsSection(sectionName);
  }

  function loadSettingsSection(sectionName) {
    const contentDiv = document.getElementById("settingsContent");
    let content = "";

    switch (sectionName) {
      case "profile":
        content = `
          <h2>👤 Profile Settings</h2>
          <form id="profileForm" class="settings-form">
            <div class="profile-image-section">
              <div class="profile-image-container">
                <img id="profileImage" src="../../public/default-avatar.png" alt="Profile Image" />
                <button type="button" class="change-image-btn" onclick="changeProfileImage()">Change Image</button>
              </div>
            </div>
            <div class="form-grid">
              <div class="field">
                <label for="profileName">Full Name</label>
                <input id="profileName" type="text" required />
              </div>
              <div class="field">
                <label for="profileEmail">Email Address</label>
                <input id="profileEmail" type="email" required />
              </div>
              <div class="field">
                <label for="profileDob">Date of Birth</label>
                <input id="profileDob" type="date" />
              </div>
              <div class="field">
                <label for="profilePhone">Phone Number</label>
                <input id="profilePhone" type="tel" />
              </div>
              <div class="field field-full">
                <label for="profileLocation">Location</label>
                <input id="profileLocation" type="text" placeholder="City, Country" />
              </div>
            </div>
            <button class="btn-register" type="submit">Save Profile</button>
          </form>
        `;
        break;
      case "security":
        content = `
          <h2>🔒 Security Settings</h2>
          <form id="securityForm" class="settings-form">
            <div class="field">
              <label for="currentPassword">Current Password</label>
              <input id="currentPassword" type="password" required />
            </div>
            <div class="field">
              <label for="newPassword">New Password</label>
              <input id="newPassword" type="password" required />
            </div>
            <div class="field">
              <label for="confirmPassword">Confirm New Password</label>
              <input id="confirmPassword" type="password" required />
            </div>
            <div class="security-options">
              <label class="checkbox-label">
                <input type="checkbox" id="twoFactor" />
                Enable Two-Factor Authentication
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="loginAlerts" checked />
                Email alerts for new logins
              </label>
            </div>
            <button class="btn-register" type="submit">Update Security</button>
          </form>
        `;
        break;
      case "preferences":
        content = `
          <h2>⚙️ Event Preferences</h2>
          <form id="preferencesForm" class="settings-form">
            <div class="field">
              <label for="defaultEventType">Default Event Type</label>
              <select id="defaultEventType">
                <option value="online">Online</option>
                <option value="offline">Offline</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
            <div class="field">
              <label for="defaultCapacity">Default Capacity</label>
              <input id="defaultCapacity" type="number" min="1" value="100" />
            </div>
            <div class="field">
              <label for="notificationSettings">Notification Preferences</label>
              <select id="notificationSettings">
                <option value="all">All notifications</option>
                <option value="important">Important only</option>
                <option value="none">No notifications</option>
              </select>
            </div>
            <div class="preference-options">
              <label class="checkbox-label">
                <input type="checkbox" id="autoPublish" checked />
                Auto-publish events after creation
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="allowFeedback" checked />
                Allow attendee feedback
              </label>
            </div>
            <button class="btn-register" type="submit">Save Preferences</button>
          </form>
        `;
        break;
      case "payments":
        content = `
          <h2>💳 Payment Settings</h2>
          <form id="paymentsForm" class="settings-form">
            <div class="field">
              <label for="paymentMethod">Primary Payment Method</label>
              <select id="paymentMethod">
                <option value="card">Credit/Debit Card</option>
                <option value="bank">Bank Transfer</option>
                <option value="paypal">PayPal</option>
                <option value="upi">UPI</option>
              </select>
            </div>
            <div class="field">
              <label for="currency">Preferred Currency</label>
              <select id="currency">
                <option value="USD">USD ($)</option>
                <option value="EUR">EUR (€)</option>
                <option value="INR">INR (₹)</option>
                <option value="GBP">GBP (£)</option>
              </select>
            </div>
            <div class="payment-options">
              <label class="checkbox-label">
                <input type="checkbox" id="autoPayment" />
                Enable automatic payments
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="paymentReminders" checked />
                Payment reminders
              </label>
            </div>
            <button class="btn-register" type="submit">Save Payment Settings</button>
          </form>
        `;
        break;
      case "appearance":
        content = `
          <h2>🎨 Appearance Settings</h2>
          <form id="appearanceForm" class="settings-form">
            <div class="field">
              <label for="theme">Theme</label>
              <select id="theme">
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="auto">Auto (System)</option>
              </select>
            </div>
            <div class="field">
              <label for="language">Language</label>
              <select id="language">
                <option value="en">English</option>
                <option value="es">Spanish</option>
                <option value="fr">French</option>
                <option value="de">German</option>
              </select>
            </div>
            <div class="field">
              <label for="timezone">Timezone</label>
              <select id="timezone">
                <option value="UTC">UTC</option>
                <option value="America/New_York">Eastern Time</option>
                <option value="Europe/London">London</option>
                <option value="Asia/Kolkata">India (IST)</option>
              </select>
            </div>
            <button class="btn-register" type="submit">Save Appearance</button>
          </form>
        `;
        break;
      case "privacy":
        content = `
          <h2>🔐 Data & Privacy</h2>
          <form id="privacyForm" class="settings-form">
            <div class="privacy-options">
              <label class="checkbox-label">
                <input type="checkbox" id="dataCollection" checked />
                Allow data collection for analytics
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="marketingEmails" />
                Receive marketing emails
              </label>
              <label class="checkbox-label">
                <input type="checkbox" id="shareData" />
                Share data with partners
              </label>
            </div>
            <div class="privacy-actions">
              <button type="button" class="btn-secondary" onclick="exportData()">Export My Data</button>
              <button type="button" class="btn-danger" onclick="deleteAccount()">Delete Account</button>
            </div>
            <button class="btn-register" type="submit">Save Privacy Settings</button>
          </form>
        `;
        break;
    }

    contentDiv.innerHTML = content;

    // Re-attach event listeners for the new form
    attachFormListeners(sectionName);
  }

  function attachFormListeners(sectionName) {
    switch (sectionName) {
      case "profile":
        const profileForm = document.getElementById("profileForm");
        if (profileForm) {
          profileForm.addEventListener("submit", handleProfileSave);
        }
        break;
      case "security":
        const securityForm = document.getElementById("securityForm");
        if (securityForm) {
          securityForm.addEventListener("submit", handleSecuritySave);
        }
        break;
      case "preferences":
        const preferencesForm = document.getElementById("preferencesForm");
        if (preferencesForm) {
          preferencesForm.addEventListener("submit", handlePreferencesSave);
        }
        break;
      // Add other form listeners as needed
    }
  }

  async function loadSettings() {
    try {
      // Load user profile data
      const profileResult = await window.api.getUserProfile(user.id);
      if (profileResult.success) {
        const profile = profileResult.profile;
        document.getElementById("profileName").value = profile.name || "";
        document.getElementById("profileEmail").value = profile.email || "";
        document.getElementById("profileDob").value = profile.dob || "";
        document.getElementById("profilePhone").value = profile.phone || "";
        document.getElementById("profileLocation").value =
          profile.location || "";
        if (profile.image) {
          document.getElementById("profileImage").src = profile.image;
        }
      }
    } catch (error) {
      console.error("Failed to load settings:", error);
    }
  }

  async function handleProfileSave(event) {
    event.preventDefault();
    const profileData = {
      name: document.getElementById("profileName").value,
      email: document.getElementById("profileEmail").value,
      dob: document.getElementById("profileDob").value,
      phone: document.getElementById("profilePhone").value,
      location: document.getElementById("profileLocation").value,
    };

    try {
      const result = await window.api.updateUserProfile(user.id, profileData);
      if (result.success) {
        alert("Profile updated successfully.");
      } else {
        alert(result.message || "Failed to update profile.");
      }
    } catch (error) {
      console.error("Profile update error:", error);
      alert("Failed to update profile.");
    }
  }

  async function handleSecuritySave(event) {
    event.preventDefault();
    const currentPassword = document.getElementById("currentPassword").value;
    const newPassword = document.getElementById("newPassword").value;
    const confirmPassword = document.getElementById("confirmPassword").value;

    if (newPassword !== confirmPassword) {
      alert("New passwords do not match.");
      return;
    }

    try {
      const result = await window.api.updatePassword(
        user.id,
        currentPassword,
        newPassword,
      );
      if (result.success) {
        alert("Password updated successfully.");
        document.getElementById("securityForm").reset();
      } else {
        alert(result.message || "Failed to update password.");
      }
    } catch (error) {
      console.error("Password update error:", error);
      alert("Failed to update password.");
    }
  }

  async function handlePreferencesSave(event) {
    event.preventDefault();
    const preferences = {
      defaultEventType: document.getElementById("defaultEventType").value,
      defaultCapacity: document.getElementById("defaultCapacity").value,
      notificationSettings: document.getElementById("notificationSettings")
        .value,
      autoPublish: document.getElementById("autoPublish").checked,
      allowFeedback: document.getElementById("allowFeedback").checked,
    };

    try {
      const result = await window.api.updatePreferences(user.id, preferences);
      if (result.success) {
        alert("Preferences saved successfully.");
      } else {
        alert(result.message || "Failed to save preferences.");
      }
    } catch (error) {
      console.error("Preferences save error:", error);
      alert("Failed to save preferences.");
    }
  }

  function changeProfileImage() {
    // Mock image change - in real app would open file picker
    alert("Image upload feature coming soon.");
  }

  function exportData() {
    alert("Data export feature coming soon.");
  }

  function deleteAccount() {
    if (
      confirm(
        "Are you sure you want to delete your account? This action cannot be undone.",
      )
    ) {
      alert("Account deletion feature coming soon.");
    }
  }

  async function generateVendorReport(reportType) {
    try {
      let data = [];
      let filename = "";
      let csvContent = "";

      switch (reportType) {
        case "add":
          const vendorsResult = await window.api.getVendors(user.id);
          data = vendorsResult.success ? vendorsResult.vendors : [];
          filename = "vendor_list_report.csv";
          csvContent = "Vendor ID,Name,Category,Contact,Email,Created Date\n";
          data.forEach((vendor) => {
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","${new Date().toLocaleDateString()}"\n`;
          });
          break;

        case "search":
          const searchResult = await window.api.getVendors(user.id);
          data = searchResult.success ? searchResult.vendors : [];
          filename = "vendor_search_report.csv";
          csvContent = "Vendor ID,Name,Category,Contact,Email,Search Tags\n";
          data.forEach((vendor) => {
            const searchTags =
              `${vendor.name} ${vendor.category} ${vendor.contact}`.toLowerCase();
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","${searchTags}"\n`;
          });
          break;

        case "details":
          const detailsResult = await window.api.getVendors(user.id);
          data = detailsResult.success ? detailsResult.vendors : [];
          filename = "vendor_details_report.csv";
          csvContent =
            "Vendor ID,Name,Category,Contact,Email,Phone,Address,Rating,Status\n";
          data.forEach((vendor) => {
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","N/A","N/A","5.0","Active"\n`;
          });
          break;

        case "assign":
          const eventsResult = await window.api.getOrganizerEvents(user.id);
          const events = eventsResult.success ? eventsResult.events : [];
          filename = "vendor_assignment_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Role,Assignment Date,Status\n";

          events.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Sample Vendor","Catering","${new Date().toLocaleDateString()}","Assigned"\n`;
            csvContent += `${event.id},"${event.title}",2,"Tech Vendor","AV Equipment","${new Date().toLocaleDateString()}","Assigned"\n`;
          });
          break;

        case "track":
          const costResult = await window.api.getOrganizerEvents(user.id);
          const costEvents = costResult.success ? costResult.events : [];
          filename = "vendor_cost_tracking_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Service,Cost Amount,Currency,Date,Status\n";

          costEvents.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Catering Co","Food Service",2500.00,"USD","${new Date().toLocaleDateString()}","Paid"\n`;
            csvContent += `${event.id},"${event.title}",2,"AV Solutions","Sound System",1200.00,"USD","${new Date().toLocaleDateString()}","Pending"\n`;
          });
          break;
      }

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toggleNotifications();
      alert(
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  }

  window.logout = logout;
  window.goDashboard = goDashboard;
  window.showSettingsSection = showSettingsSection;
  window.changeProfileImage = changeProfileImage;
  window.exportData = exportData;
  window.deleteAccount = deleteAccount;
  window.toggleNotifications = () => {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("active");
  };
  window.markAllRead = () => {
    const unreadItems = document.querySelectorAll(".notification-item.unread");
    unreadItems.forEach((item) => item.classList.remove("unread"));
  };
  window.generateVendorReport = generateVendorReport;

  document.addEventListener("DOMContentLoaded", function () {
    loadSettings();
    loadSettingsSection("profile"); // Load default section

    // Mobile hamburger menu toggle for sliding sidebar
    const orgMenuToggle = document.getElementById("orgMenuToggle");
    const mobileMenuBar = document.getElementById("mobileMenuBar");
    const sidebarBackdrop = document.getElementById("sidebarBackdrop");

    if (orgMenuToggle) {
      orgMenuToggle.addEventListener("click", function () {
        if (mobileMenuBar) {
          mobileMenuBar.classList.toggle("show");
          sidebarBackdrop.classList.toggle("show");
        }
      });
    }

    if (sidebarBackdrop) {
      sidebarBackdrop.addEventListener("click", function () {
        mobileMenuBar.classList.remove("show");
        sidebarBackdrop.classList.remove("show");
      });
    }

    document.addEventListener("click", function (e) {
      if (
        mobileMenuBar &&
        !mobileMenuBar.contains(e.target) &&
        !orgMenuToggle.contains(e.target)
      ) {
        if (mobileMenuBar.classList.contains("show")) {
          mobileMenuBar.classList.remove("show");
          sidebarBackdrop.classList.remove("show");
        }
      }
    });
  });
})();
