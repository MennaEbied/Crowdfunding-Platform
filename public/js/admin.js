
document.addEventListener("DOMContentLoaded", () => {
  const currentUser = JSON.parse(localStorage.getItem("currentUser"));
  if (!currentUser || currentUser.role !== "admin") {
    alert("Access Denied!");
    window.location.href = "login.html";
    return;
  }

  loadUsers();
  loadPendingCampaigns();
});
async function loadUsers() {
  try {
    const response = await fetch("http://localhost:3000/users");
    const users = await response.json();
    const list = document.getElementById("users-list");
    list.innerHTML = "";
    users.forEach((user) => {
      if (user.role === "admin") return;
      const row = `
             <tr>
             <td>${user.id}</td>
                <td>${user.name}</td>   
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>
                    <button onclick="toggleUserStatus(${user.id}, ${user.isActive})">${user.isActive ? "Ban" : "Unban"}</button>
                </td>
             </tr>
            `;
      list.innerHTML += row;
    });
  } catch (error) {
    console.error("Error loading users:", error);
  }
}

async function loadCampaigns() {
  const res = await fetch("http://localhost:3000/campaigns");
  const campaigns = await res.json();
  const list = document.getElementById("campaigns-list");
  list.innerHTML = "";
  campaigns.forEach((campaign) => {
    const row = `
                <tr>        
                    <td>${campaign.title}</td>
                    <td>${campaign.description}</td>
                    <td>${campaign.goal}</td>   
                    <td>${campaign.currentAmount}</td>
                    <td>${campaign.deadline}</td>
                    <td>${campaign.isApproved ? "Approved" : "Pending"}</td>
                    <td>
                        ${!campaign.isApproved ? `<button onclick="approveCampaign(${campaign.id})">Approve</button>` : ""}
                    </td>
                    <td>
                        <button onclick="deleteCampaign(${campaign.id})">Delete</button>
                    </td>
                </tr>
            `;
    list.innerHTML += row;
  });
}
async function approveCampaign(id) {
  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isApproved: true }),
  });
  loadCampaigns();
}

async function deleteCampaign(id) {
  await fetch(`http://localhost:3000/campaigns/${id}`, {
    method: "DELETE",
  });
  loadCampaigns();
}

async function toggleUserStatus(id, currentStatus) {
  await fetch(`http://localhost:3000/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ isActive: !currentStatus }),
  });
  loadUsers();
}
// admin.js
document.addEventListener("DOMContentLoaded", () => {
  loadUsers();
  loadCampaigns();
});
