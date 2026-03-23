document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));

  if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied!");
    window.location.replace("login.html");
    return;
  }

  loadUsers();
  loadCampaigns();

  document.getElementById("users-list").addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const userId = btn.dataset.id;
    const currentStatus = btn.dataset.active === "true";

    await toggleUserStatus(userId, currentStatus);
  });

  document
    .getElementById("campaigns-list")
    .addEventListener("click", async (e) => {
      const btn = e.target.closest("button");
      if (!btn) return;

      const campaignId = btn.dataset.id;

      if (btn.classList.contains("btn-approve")) {
        await approveCampaign(campaignId);
      } else if (btn.classList.contains("btn-delete")) {
        await deleteCampaign(campaignId);
      }
    });
});

async function loadUsers() {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    const list = document.getElementById("users-list");

    const regularUsers = users.filter((user) => user.role !== "admin");
    if (regularUsers.length === 0) {
      list.innerHTML = `
        <tr>
          <td colspan="5" style="text-align: center; padding: 20px; color: #888;">
            No registered users found.
          </td>
        </tr>`;
      return;
    }

    list.innerHTML = regularUsers
      .map(
        (user) => `
        <tr>
            <td>${user.id}</td>
            <td><strong>${user.name}</strong></td>   
            <td>${user.email}</td>
            <td>${user.role}</td>
            <td>
                <div class="admin-actions">
                    <button 
                        class="${user.isActive ? "btn-delete" : "btn-approve"}" 
                        data-id="${user.id}" 
                        data-active="${user.isActive}">
                        ${user.isActive ? "Ban" : "Unban"}
                    </button>
                </div>
            </td>
        </tr>
      `,
      )
      .join("");
  } catch (error) {
    console.error("Failed to load users:", error);
  }
}

async function loadCampaigns() {
  try {
    const res = await fetch("http://localhost:3000/campaigns");
    const campaigns = await res.json();
    const list = document.getElementById("campaigns-list");

    if (campaigns.length === 0) {
      list.innerHTML = `
        <tr>
          <td colspan="7" style="text-align: center; padding: 20px; color: #888;">
            No campaigns have been created yet.
          </td>
        </tr>`;
      return;
    }

    list.innerHTML = campaigns
      .map(
        (campaign) => `
        <tr> 
            <td>${campaign.id}</td>       
            <td><strong>${campaign.title}</strong></td>
            <td>$${Number(campaign.goal).toLocaleString()}</td>   
            <td>$${Number(campaign.currentAmount).toLocaleString()}</td>
            <td>${campaign.deadline}</td>
            <td>
                <span class="status-badge ${campaign.isApproved ? "status-approved" : "status-pending"}">
                    ${campaign.isApproved ? "Approved" : "Pending"}
                </span>
            </td>
            <td>
                <div class="admin-actions">
                    ${
                      !campaign.isApproved
                        ? `<button class="btn-approve" data-id="${campaign.id}">Approve</button>`
                        : ""
                    }
                    <button class="btn-delete" data-id="${campaign.id}">Delete</button>
                </div>
            </td>
        </tr>
    `,
      )
      .join("");
  } catch (error) {
    console.error("Failed to load campaigns:", error);
  }
}
async function approveCampaign(id) {
  try {
    await fetch(`http://localhost:3000/campaigns/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isApproved: true }),
    });
    loadCampaigns();
  } catch (err) {
    console.error(err);
  }
}

async function deleteCampaign(id) {
  if (!confirm("Delete this campaign?")) return;
  try {
    await fetch(`http://localhost:3000/campaigns/${id}`, { method: "DELETE" });
    loadCampaigns();
  } catch (err) {
    console.error(err);
  }
}

async function toggleUserStatus(id, currentStatus) {
  try {
    await fetch(`http://localhost:3000/users/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !currentStatus }),
    });
    loadUsers();
  } catch (err) {
    console.error(err);
  }
}
