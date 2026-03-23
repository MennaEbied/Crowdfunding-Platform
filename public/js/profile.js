async function loadProfile() {
  const user = JSON.parse(localStorage.getItem("currentUser"));
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  try {
    const pRes = await fetch(`http://localhost:3000/pledges`);
    const cRes = await fetch(`http://localhost:3000/campaigns`);
    const allPledges = await pRes.json();
    const allCam = await cRes.json();

    const myPledges = allPledges.filter((p) => p.userId == user.id);
    const myCampaigns = allCam.filter((c) => c.creatorId == user.id);

    console.log("Found Pledges for user:", myPledges.length);
    console.log("Found Campaigns for user:", myCampaigns.length);

    renderPledges(myPledges, allCam);
    renderMyCampaigns(myCampaigns);
  } catch (error) {
    console.error("Fetch Error:", error);
  }
}
function renderPledges(pledges, allCam) {
  const container = document.getElementById("pledge-list");
  if (!container) return;

  if (pledges.length === 0) {
    container.innerHTML =
      "<p class='empty-msg'>You haven't made any pledges yet.</p>";
    return;
  }

  container.innerHTML = pledges
    .map((p) => {
      const targetId = p.campaignId || p.projectId;
      const campaign = allCam.find((c) => String(c.id) === String(targetId));
      const displayTitle = campaign
        ? campaign.title
        : `Project (ID: ${targetId})`;

      return `
            <div class="dashboard-card pledge-card">
                <div class="card-info">
                    <h5>${displayTitle}</h5>
                    <p class="amount-tag">Pledged: <span>$${p.amount}</span></p>
                </div>
            </div>
        `;
    })
    .join("");
}

function renderMyCampaigns(campaigns) {
  const container = document.getElementById("campaign-list");
  if (!container) return;

  if (campaigns.length === 0) {
    container.innerHTML =
      "<p class='empty-msg'>You haven't created any campaigns yet.</p>";
    return;
  }

  container.innerHTML = campaigns
    .map(
      (c) => `
        <div class="campaign-card dashboard-card" data-id="${c.id}">
            <div class="campaign-content">
                <div class="card-header">
                    <h3 class="title">${c.title}</h3>
                    <span class="status-badge ${c.isApproved ? "status-approved" : "status-pending"}">
                        ${c.isApproved ? "Live" : "Pending Review"}
                    </span>
                </div>
                <p class="description">${c.description}</p>
                <div class="campaign-footer">
                    <span class="goal">Goal: <strong>$${Number(c.goal).toLocaleString()}</strong></span>
                    <div class="action-btns">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn"> Delete</button>
                    </div>
                </div>
            </div>
        </div>
    `,
    )
    .join("");
}
const campaignList = document.getElementById("campaign-list");
if (campaignList) {
  campaignList.addEventListener("click", async (e) => {
    const card = e.target.closest(".campaign-card");
    if (!card) return;

    const id = card.getAttribute("data-id");

    if (e.target.classList.contains("delete-btn")) {
      const confirmDelete = confirm("Are you sure you want to delete this?");
      if (confirmDelete) {
        try {
          const response = await fetch(
            `http://localhost:3000/campaigns/${id}`,
            {
              method: "DELETE",
            },
          );
          if (response.ok) {
            card.remove();
          }
        } catch (err) {
          console.error("Delete failed:", err);
        }
      }
    }

    if (e.target.classList.contains("edit-btn")) {
      const descElement = card.querySelector(".description");
      const newDesc = prompt("Edit your description:", descElement.innerText);

      if (newDesc && newDesc !== descElement.innerText) {
        try {
          const response = await fetch(
            `http://localhost:3000/campaigns/${id}`,
            {
              method: "PATCH",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ description: newDesc }),
            },
          );
          if (response.ok) {
            descElement.innerText = newDesc;
          }
        } catch (err) {
          console.error("Update failed:", err);
        }
      }
    }
  });
}
document.addEventListener("DOMContentLoaded", loadProfile);
