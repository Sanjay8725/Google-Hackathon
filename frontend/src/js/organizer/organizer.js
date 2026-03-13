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

  function showSection(section) {
    const eventsSection = document.getElementById("eventsSection");
    const analyticsSection = document.getElementById("analyticsSection");
    document
      .querySelectorAll(".nav-item")
      .forEach((btn) => btn.classList.remove("active"));
    event.target.classList.add("active");

    if (section === "events") {
      eventsSection.style.display = "block";
      analyticsSection.style.display = "none";
    } else {
      eventsSection.style.display = "none";
      analyticsSection.style.display = "block";
    }
  }

  function toggleNotifications() {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("active");
  }

  function markAllRead() {
    const unreadItems = document.querySelectorAll(".notification-item.unread");
    unreadItems.forEach((item) => item.classList.remove("unread"));
  }

  async function generateVendorReport(reportType) {
    try {
      let data = [];
      let filename = "";
      let csvContent = "";

      switch (reportType) {
        case "add":
          // Generate Add Vendor Report - shows all vendors
          const vendorsResult = await window.api.getVendors(user.id);
          data = vendorsResult.success ? vendorsResult.vendors : [];
          filename = "vendor_list_report.csv";
          csvContent = "Vendor ID,Name,Category,Contact,Email,Created Date\n";
          data.forEach((vendor) => {
            csvContent += `${vendor.id},"${vendor.name}","${vendor.category}","${vendor.contact}","${vendor.email}","${new Date().toLocaleDateString()}"\n`;
          });
          break;

        case "search":
          // Generate Search Vendor Report - shows searchable vendor data
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
          // Generate Vendor Details Report - comprehensive vendor information
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
          // Generate Vendor Assignment Report - shows vendor-event assignments
          const eventsResult = await window.api.getOrganizerEvents(user.id);
          const events = eventsResult.success ? eventsResult.events : [];
          filename = "vendor_assignment_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Role,Assignment Date,Status\n";

          // Mock data for assignments since API might not have this
          events.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Sample Vendor","Catering","${new Date().toLocaleDateString()}","Assigned"\n`;
            csvContent += `${event.id},"${event.title}",2,"Tech Vendor","AV Equipment","${new Date().toLocaleDateString()}","Assigned"\n`;
          });
          break;

        case "track":
          // Generate Vendor Cost Tracking Report
          const costResult = await window.api.getOrganizerEvents(user.id);
          const costEvents = costResult.success ? costResult.events : [];
          filename = "vendor_cost_tracking_report.csv";
          csvContent =
            "Event ID,Event Title,Vendor ID,Vendor Name,Service,Cost Amount,Currency,Date,Status\n";

          // Mock cost data
          costEvents.forEach((event) => {
            csvContent += `${event.id},"${event.title}",1,"Catering Co","Food Service",2500.00,"USD","${new Date().toLocaleDateString()}","Paid"\n`;
            csvContent += `${event.id},"${event.title}",2,"AV Solutions","Sound System",1200.00,"USD","${new Date().toLocaleDateString()}","Pending"\n`;
          });
          break;
      }

      // Create and download the CSV file
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", filename);
      link.style.visibility = "hidden";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Close the dropdown after download
      toggleNotifications();

      // Show success message
      alert(
        `${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report downloaded successfully!`,
      );
    } catch (error) {
      console.error("Error generating report:", error);
      alert("Failed to generate report. Please try again.");
    }
  }

  async function loadOrganizerEvents() {
    const statsEl = document.getElementById("quickStats");
    const grid = document.getElementById("eventsGrid");

    try {
      const result = await window.api.getOrganizerEvents(user.id);
      const events = result.success ? result.events : [];
      organizerEvents = events;

      const totalAttendees = events.reduce(
        (sum, e) => sum + (e.registered || 0),
        0,
      );
      const totalCheckedIn = events.reduce(
        (sum, e) => sum + (e.checked_in || 0),
        0,
      );
      const avgEngagement = events.length
        ? Math.round(
            events.reduce((sum, e) => sum + (e.engagement || 0), 0) /
              events.length,
          )
        : 0;

      statsEl.innerHTML = `
        <div class="stat-box"><span>📅</span><div><p class="stat-value">${events.length}</p><p class="stat-label">Total Events</p></div></div>
        <div class="stat-box"><span>👥</span><div><p class="stat-value">${totalAttendees}</p><p class="stat-label">Total Registered</p></div></div>
        <div class="stat-box"><span>✅</span><div><p class="stat-value">${totalCheckedIn}</p><p class="stat-label">Checked-In</p></div></div>
        <div class="stat-box"><span>📊</span><div><p class="stat-value">${avgEngagement}%</p><p class="stat-label">Avg Engagement</p></div></div>
      `;

      grid.innerHTML = events
        .map(
          (event) => `
        <div class="event-card">
          <div class="event-header">
            <h3>${event.title}</h3>
            <span class="status-badge ${event.status.toLowerCase()}">${event.status}</span>
          </div>
          <div class="event-details">
            <div class="detail-item"><span>📅 Date:</span> ${event.date}</div>
            <div class="detail-item"><span>📍 Location:</span> ${event.location}</div>
            <div class="detail-item"><span>👥 Registered:</span> ${event.registered || 0}</div>
            <div class="detail-item"><span>✅ Checked In:</span> ${event.checked_in || 0}</div>
            <div class="detail-item"><span>📊 Engagement:</span> ${event.engagement || 0}%</div>
          </div>
          <div class="event-actions">
            <button class="action-btn edit" onclick="viewEventAnalytics(${event.id})">📊 Analytics</button>
            <button class="action-btn preview" onclick="startQRScanner(${event.id})">📱 QR Check-in</button>
          </div>
        </div>
      `,
        )
        .join("");

      if (events.length === 0) {
        grid.innerHTML =
          '<div class="empty-state"><div class="empty-state-icon">📅</div><div class="empty-state-text">No events created yet</div></div>';
      }
    } catch (error) {
      console.error("Failed to load organizer events:", error);
      statsEl.innerHTML = "";
      grid.innerHTML =
        '<div class="empty-state"><div class="empty-state-icon">⚠️</div><div class="empty-state-text">Failed to load events</div></div>';
    }
  }

  async function handleCreateEvent(event) {
    event.preventDefault();

    const title = (document.getElementById("newEventTitle").value || "").trim();
    const date = (document.getElementById("newEventDate").value || "").trim();
    const time = (document.getElementById("newEventTime").value || "").trim();
    const location = (
      document.getElementById("newEventLocation").value || ""
    ).trim();
    const category = (
      document.getElementById("newEventCategory").value || ""
    ).trim();
    const mode = (document.getElementById("newEventMode").value || "").trim();
    const description = (
      document.getElementById("newEventDescription").value || ""
    ).trim();

    if (!title || !date || !location || !category || !mode) {
      alert("Please provide title, date, location, category and mode.");
      return;
    }

    try {
      const result = await window.api.createEvent({
        organizer_id: user.id,
        title: title,
        description: description,
        date: date,
        time: time,
        location: location,
        category: category,
        mode: mode,
        capacity: 0,
      });

      if (!result || !result.success) {
        alert((result && result.message) || "Failed to create event.");
        return;
      }

      alert("Event created successfully.");
      document.getElementById("createEventForm").reset();
      loadOrganizerEvents();
    } catch (error) {
      console.error("Create event error:", error);
      alert("Failed to create event.");
    }
  }

  window.logout = logout;
  window.showSection = showSection;
  window.viewEventAnalytics = () => alert("Analytics view coming soon.");
  window.startQRScanner = () => alert("QR scanner coming soon.");
  window.toggleNotifications = toggleNotifications;
  window.markAllRead = markAllRead;
  window.generateVendorReport = generateVendorReport;

  document.addEventListener("DOMContentLoaded", function () {
    const createEventForm = document.getElementById("createEventForm");
    if (createEventForm) {
      createEventForm.addEventListener("submit", handleCreateEvent);
    }

    // Mobile hamburger menu
    const orgMenuToggle = document.getElementById("orgMenuToggle");
    const orgOverlay = document.getElementById("orgOverlay");
    const orgSidebar = document.getElementById("orgSidebar");

    if (orgMenuToggle && orgOverlay && orgSidebar) {
      orgMenuToggle.addEventListener("click", function () {
        orgSidebar.classList.toggle("mobile-open");
        orgMenuToggle.classList.toggle("active");
        orgOverlay.classList.toggle("active");
      });
      orgOverlay.addEventListener("click", function () {
        orgSidebar.classList.remove("mobile-open");
        orgMenuToggle.classList.remove("active");
        orgOverlay.classList.remove("active");
      });
      document.addEventListener("click", function (e) {
        if (
          !orgSidebar.contains(e.target) &&
          !orgMenuToggle.contains(e.target)
        ) {
          if (orgSidebar.classList.contains("mobile-open")) {
            orgSidebar.classList.remove("mobile-open");
            orgMenuToggle.classList.remove("active");
            orgOverlay.classList.remove("active");
          }
        }
      });
    }

    loadOrganizerEvents();
  });
})();
