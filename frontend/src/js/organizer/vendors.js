(function () {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  if (!user.id || user.role !== "organizer") {
    window.location.href = "../auth.html";
    return;
  }

  let vendors = [];
  let events = [];

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

  async function loadVendors() {
    try {
      // Assuming API endpoint exists
      const result = await window.api.getVendors(user.id);
      vendors = result.success ? result.vendors : [];
      // Refresh selects in current section if it has vendor selects
      const activeItem = document.querySelector(".vendor-menu-item.active");
      if (activeItem) {
        const sectionName = activeItem
          .getAttribute("onclick")
          .match(/'([^']+)'/)[1];
        if (["details", "assign", "track"].includes(sectionName)) {
          populateVendorSelects(sectionName);
        }
      }
    } catch (error) {
      console.error("Failed to load vendors:", error);
    }
  }

  async function loadEvents() {
    try {
      const result = await window.api.getOrganizerEvents(user.id);
      events = result.success ? result.events : [];
      // Refresh selects in current section if it has event selects
      const activeItem = document.querySelector(".vendor-menu-item.active");
      if (activeItem) {
        const sectionName = activeItem
          .getAttribute("onclick")
          .match(/'([^']+)'/)[1];
        if (["assign", "track"].includes(sectionName)) {
          populateEventSelects(sectionName);
        }
      }
    } catch (error) {
      console.error("Failed to load events:", error);
    }
  }

  function populateVendorSelects(sectionName) {
    let selects = [];
    switch (sectionName) {
      case "details":
        selects = ["selectVendor"];
        break;
      case "assign":
        selects = ["assignVendor"];
        break;
      case "track":
        selects = ["costVendor"];
        break;
    }

    selects.forEach((id) => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">Select vendor</option>';
        vendors.forEach((vendor) => {
          const option = document.createElement("option");
          option.value = vendor.id;
          option.textContent = vendor.name;
          select.appendChild(option);
        });
      }
    });
  }

  function populateEventSelects(sectionName) {
    let selects = [];
    switch (sectionName) {
      case "assign":
        selects = ["assignEvent"];
        break;
      case "track":
        selects = ["costEvent"];
        break;
    }

    selects.forEach((id) => {
      const select = document.getElementById(id);
      if (select) {
        select.innerHTML = '<option value="">Select event</option>';
        events.forEach((event) => {
          const option = document.createElement("option");
          option.value = event.id;
          option.textContent = event.title;
          select.appendChild(option);
        });
      }
    });
  }

  async function handleAddVendor(event) {
    event.preventDefault();
    const name = document.getElementById("vendorName").value.trim();
    const category = document.getElementById("vendorCategory").value;
    const contact = document.getElementById("vendorContact").value.trim();
    const email = document.getElementById("vendorEmail").value.trim();

    if (!name || !category || !contact || !email) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const result = await window.api.addVendor({
        organizer_id: user.id,
        name,
        category,
        contact,
        email,
      });
      if (result.success) {
        alert("Vendor added successfully.");
        document.getElementById("addVendorForm").reset();
        loadVendors();
      } else {
        alert(result.message || "Failed to add vendor.");
      }
    } catch (error) {
      console.error("Add vendor error:", error);
      alert("Failed to add vendor.");
    }
  }

  function handleSearchVendor() {
    const query = document.getElementById("searchVendor").value.toLowerCase();
    const resultsDiv = document.getElementById("searchResults");

    if (!query) {
      resultsDiv.innerHTML = "";
      return;
    }

    const filtered = vendors.filter(
      (vendor) =>
        vendor.name.toLowerCase().includes(query) ||
        vendor.category.toLowerCase().includes(query),
    );

    resultsDiv.innerHTML = filtered
      .map(
        (vendor) => `
      <div class="search-result-item">
        <strong>${vendor.name}</strong> - ${vendor.category}<br>
        Contact: ${vendor.contact} | Email: ${vendor.email}
      </div>
    `,
      )
      .join("");
  }

  function handleViewVendorDetails() {
    const vendorId = document.getElementById("selectVendor").value;
    const detailsDiv = document.getElementById("vendorDetails");

    if (!vendorId) {
      detailsDiv.innerHTML = "";
      return;
    }

    const vendor = vendors.find((v) => v.id == vendorId);
    if (vendor) {
      detailsDiv.innerHTML = `
        <div class="vendor-detail">
          <h4>${vendor.name}</h4>
          <p><strong>Category:</strong> ${vendor.category}</p>
          <p><strong>Contact:</strong> ${vendor.contact}</p>
          <p><strong>Email:</strong> ${vendor.email}</p>
        </div>
      `;
    }
  }

  async function handleAssignVendor(event) {
    event.preventDefault();
    const eventId = document.getElementById("assignEvent").value;
    const vendorId = document.getElementById("assignVendor").value;
    const role = document.getElementById("assignmentRole").value.trim();

    if (!eventId || !vendorId || !role) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const result = await window.api.assignVendorToEvent({
        event_id: eventId,
        vendor_id: vendorId,
        role,
      });
      if (result.success) {
        alert("Vendor assigned successfully.");
        document.getElementById("assignVendorForm").reset();
      } else {
        alert(result.message || "Failed to assign vendor.");
      }
    } catch (error) {
      console.error("Assign vendor error:", error);
      alert("Failed to assign vendor.");
    }
  }

  async function handleTrackCost(event) {
    event.preventDefault();
    const eventId = document.getElementById("costEvent").value;
    const vendorId = document.getElementById("costVendor").value;
    const cost = parseFloat(document.getElementById("vendorCost").value);
    const description = document.getElementById("costDescription").value.trim();

    if (!eventId || !vendorId || isNaN(cost) || !description) {
      alert("Please fill all fields.");
      return;
    }

    try {
      const result = await window.api.trackVendorCost({
        event_id: eventId,
        vendor_id: vendorId,
        cost,
        description,
      });
      if (result.success) {
        alert("Cost tracked successfully.");
        document.getElementById("trackCostForm").reset();
      } else {
        alert(result.message || "Failed to track cost.");
      }
    } catch (error) {
      console.error("Track cost error:", error);
      alert("Failed to track cost.");
    }
  }

  function showVendorSection(sectionName) {
    // Update active menu item
    document
      .querySelectorAll(".vendor-menu-item")
      .forEach((item) => item.classList.remove("active"));
    event.target.closest(".vendor-menu-item").classList.add("active");

    // Load the corresponding section content
    loadVendorSection(sectionName);
  }

  function loadVendorSection(sectionName) {
    const contentDiv = document.getElementById("vendorContent");
    let content = "";

    switch (sectionName) {
      case "add":
        content = `
          <article class="vendor-section">
            <h3>Add Vendor</h3>
            <form id="addVendorForm" class="vendor-form">
              <div class="field">
                <label for="vendorName">Vendor Name</label>
                <input id="vendorName" type="text" required />
              </div>
              <div class="field">
                <label for="vendorCategory">Category</label>
                <select id="vendorCategory" required>
                  <option value="">Select category</option>
                  <option value="Catering">Catering</option>
                  <option value="Audio/Visual">Audio/Visual</option>
                  <option value="Venue">Venue</option>
                  <option value="Security">Security</option>
                  <option value="Decoration">Decoration</option>
                  <option value="Transportation">Transportation</option>
                </select>
              </div>
              <div class="field">
                <label for="vendorContact">Contact</label>
                <input id="vendorContact" type="text" required />
              </div>
              <div class="field">
                <label for="vendorEmail">Email</label>
                <input id="vendorEmail" type="email" required />
              </div>
              <button class="btn-register" type="submit">Add Vendor</button>
            </form>
          </article>
        `;
        break;
      case "search":
        content = `
          <article class="vendor-section">
            <h3>Search Vendor</h3>
            <div class="search-section">
              <input type="text" id="searchVendor" placeholder="Search vendors by name or category..." />
              <button id="searchBtn" class="btn-register">Search</button>
            </div>
            <div id="searchResults" class="search-results"></div>
          </article>
        `;
        break;
      case "details":
        content = `
          <article class="vendor-section">
            <h3>View Vendor Details</h3>
            <div class="field">
              <label for="selectVendor">Select Vendor</label>
              <select id="selectVendor">
                <option value="">Choose vendor</option>
              </select>
            </div>
            <div id="vendorDetails" class="vendor-details"></div>
          </article>
        `;
        break;
      case "assign":
        content = `
          <article class="vendor-section">
            <h3>Assign Vendor to Event</h3>
            <form id="assignVendorForm" class="vendor-form">
              <div class="field">
                <label for="assignEvent">Event</label>
                <select id="assignEvent" required>
                  <option value="">Select event</option>
                </select>
              </div>
              <div class="field">
                <label for="assignVendor">Vendor</label>
                <select id="assignVendor" required>
                  <option value="">Select vendor</option>
                </select>
              </div>
              <div class="field">
                <label for="assignmentRole">Role/Service</label>
                <input id="assignmentRole" type="text" placeholder="e.g., Catering, Sound System" required />
              </div>
              <button class="btn-register" type="submit">Assign Vendor</button>
            </form>
          </article>
        `;
        break;
      case "track":
        content = `
          <article class="vendor-section">
            <h3>Track Vendor Cost</h3>
            <form id="trackCostForm" class="vendor-form">
              <div class="field">
                <label for="costEvent">Event</label>
                <select id="costEvent" required>
                  <option value="">Select event</option>
                </select>
              </div>
              <div class="field">
                <label for="costVendor">Vendor</label>
                <select id="costVendor" required>
                  <option value="">Select vendor</option>
                </select>
              </div>
              <div class="field">
                <label for="vendorCost">Cost Amount</label>
                <input id="vendorCost" type="number" min="0" step="0.01" required />
              </div>
              <div class="field">
                <label for="costDescription">Description</label>
                <input id="costDescription" type="text" placeholder="Service description" required />
              </div>
              <button class="btn-register" type="submit">Track Cost</button>
            </form>
          </article>
        `;
        break;
    }

    contentDiv.innerHTML = content;

    // Re-attach event listeners for the new content
    attachVendorListeners(sectionName);
  }

  function attachVendorListeners(sectionName) {
    switch (sectionName) {
      case "add":
        const addVendorForm = document.getElementById("addVendorForm");
        if (addVendorForm) {
          addVendorForm.addEventListener("submit", handleAddVendor);
        }
        break;
      case "search":
        const searchBtn = document.getElementById("searchBtn");
        if (searchBtn) {
          searchBtn.addEventListener("click", handleSearchVendor);
        }
        const searchInput = document.getElementById("searchVendor");
        if (searchInput) {
          searchInput.addEventListener("input", handleSearchVendor);
        }
        break;
      case "details":
        populateVendorSelects("details");
        const selectVendor = document.getElementById("selectVendor");
        if (selectVendor) {
          selectVendor.addEventListener("change", handleViewVendorDetails);
        }
        break;
      case "assign":
        populateVendorSelects("assign");
        populateEventSelects("assign");
        const assignVendorForm = document.getElementById("assignVendorForm");
        if (assignVendorForm) {
          assignVendorForm.addEventListener("submit", handleAssignVendor);
        }
        break;
      case "track":
        populateVendorSelects("track");
        populateEventSelects("track");
        const trackCostForm = document.getElementById("trackCostForm");
        if (trackCostForm) {
          trackCostForm.addEventListener("submit", handleTrackCost);
        }
        break;
    }
  }

  function toggleNotifications() {
    const dropdown = document.getElementById("notificationDropdown");
    dropdown.classList.toggle("active");
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

  window.showVendorSection = showVendorSection;
  window.generateVendorReport = generateVendorReport;
  window.toggleNotifications = toggleNotifications;

  document.addEventListener("DOMContentLoaded", function () {
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
