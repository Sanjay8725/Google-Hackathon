(function () {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id || user.role !== "organizer") {
    window.location.href = "../auth.html";
    return;
  }

  function setMessage(id, type, text) {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.className = "analytics-message " + type;
    el.textContent = text;
  }

  function clearMessage(id) {
    const el = document.getElementById(id);
    if (!el) {
      return;
    }
    el.className = "analytics-message";
    el.textContent = "";
  }

  async function handleEngagementSubmit(event) {
    event.preventDefault();
    clearMessage("engagementMessage");

    const eventId = Number(document.getElementById("engagementEventId").value);
    const userId = Number(document.getElementById("engagementUserId").value);
    const action = (
      document.getElementById("engagementAction").value || ""
    ).trim();

    if (!eventId || !userId || !action) {
      setMessage(
        "engagementMessage",
        "error",
        "Please fill Event ID, User ID and Action.",
      );
      return;
    }

    try {
      const result = await window.api.trackEngagement({
        event_id: eventId,
        user_id: userId,
        action: action,
      });

      if (result.success) {
        setMessage(
          "engagementMessage",
          "success",
          `Tracked successfully. Engagement score: ${result.engagement}%`,
        );
      } else {
        setMessage(
          "engagementMessage",
          "error",
          result.message || "Failed to track engagement.",
        );
      }
    } catch (error) {
      console.error("Track engagement failed:", error);
      setMessage(
        "engagementMessage",
        "error",
        "Connection failed while tracking engagement.",
      );
    }
  }

  async function checkAnalyticsConnection() {
    clearMessage("connectionMessage");
    const output = document.getElementById("analyticsOutput");
    if (output) {
      output.textContent = "Checking connection...";
    }

    try {
      const result = await window.api.getDashboardAnalytics(user.id);

      if (result.success) {
        setMessage(
          "connectionMessage",
          "success",
          "Connected. Organizer analytics API is working.",
        );
        if (output) {
          output.textContent = JSON.stringify(result.stats, null, 2);
        }
      } else {
        setMessage(
          "connectionMessage",
          "error",
          result.message || "API returned an error.",
        );
        if (output) {
          output.textContent = JSON.stringify(result, null, 2);
        }
      }
    } catch (error) {
      console.error("Connection check failed:", error);
      setMessage(
        "connectionMessage",
        "error",
        "Unable to connect to analytics endpoint.",
      );
      if (output) {
        output.textContent = String(
          error && error.message ? error.message : error,
        );
      }
    }
  }

  function getNumericInput(id) {
    return Number((document.getElementById(id) || {}).value || 0);
  }

  async function runReadAction(label, action) {
    clearMessage("connectionMessage");
    const output = document.getElementById("analyticsOutput");
    if (output) {
      output.textContent = `${label}: loading...`;
    }

    try {
      const result = await action();
      if (result && result.success) {
        setMessage(
          "connectionMessage",
          "success",
          `${label}: API connected and data loaded.`,
        );
      } else {
        setMessage(
          "connectionMessage",
          "error",
          `${label}: ${result && result.message ? result.message : "Request failed."}`,
        );
      }
      if (output) {
        output.textContent = JSON.stringify(result, null, 2);
      }
    } catch (error) {
      setMessage("connectionMessage", "error", `${label}: connection failed.`);
      if (output) {
        output.textContent = String(
          error && error.message ? error.message : error,
        );
      }
    }
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
  window.toggleNotifications = toggleNotifications;
  window.markAllRead = markAllRead;
  window.generateVendorReport = generateVendorReport;

  document.addEventListener("DOMContentLoaded", function () {
    const organizerField = document.getElementById("queryOrganizerId");
    if (organizerField) {
      organizerField.value = String(user.id);
    }

    const engagementForm = document.getElementById("engagementForm");
    if (engagementForm) {
      engagementForm.addEventListener("submit", handleEngagementSubmit);
    }

    const checkButton = document.getElementById("checkConnectionBtn");
    if (checkButton) {
      checkButton.addEventListener("click", checkAnalyticsConnection);
    }

    const btnGetEvents = document.getElementById("btnGetEvents");
    if (btnGetEvents) {
      btnGetEvents.addEventListener("click", function () {
        runReadAction("Get All Events", function () {
          return window.api.getAllEvents();
        });
      });
    }

    const btnGetFeedbackStats = document.getElementById("btnGetFeedbackStats");
    if (btnGetFeedbackStats) {
      btnGetFeedbackStats.addEventListener("click", function () {
        const eventId = getNumericInput("queryEventId");
        runReadAction("Get Feedback Stats", function () {
          return window.api.getFeedbackStats(eventId);
        });
      });
    }

    const btnGetEventAnalytics = document.getElementById(
      "btnGetEventAnalytics",
    );
    if (btnGetEventAnalytics) {
      btnGetEventAnalytics.addEventListener("click", function () {
        const eventId = getNumericInput("queryEventId");
        runReadAction("Get Event Analytics", function () {
          return window.api.getEventAnalytics(eventId);
        });
      });
    }

    const btnGetDashboardAnalytics = document.getElementById(
      "btnGetDashboardAnalytics",
    );
    if (btnGetDashboardAnalytics) {
      btnGetDashboardAnalytics.addEventListener("click", function () {
        const organizerId = getNumericInput("queryOrganizerId");
        runReadAction("Get Organizer Analytics", function () {
          return window.api.getDashboardAnalytics(organizerId);
        });
      });
    }

    checkAnalyticsConnection();

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
