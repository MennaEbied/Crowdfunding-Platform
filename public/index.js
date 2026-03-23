let allLoadedCampaigns = [];

async function loadApprovedCampaigns() {
  const searchInput = document.getElementById("search-input");
  const searchTerm = searchInput.value.trim();
  const category = document.getElementById("category-filter").value;

  let url = `http://localhost:3000/campaigns?isApproved=true`;

  if (searchTerm) {
    url += `&title_contains=${searchTerm}`;
  }
  if (category) {
    url += `&category=${category}`;
  }
  url += `&_sort=deadline`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("Server response was not ok");

    const campaigns = await res.json();
    allLoadedCampaigns = campaigns;

    const container = document.getElementById("campaign-list");
    if (campaigns.length === 0) {
      container.innerHTML = `
                <div class="no-results">
                    <i class="fa-solid fa-magnifying-glass" style="font-size: 32px; margin-bottom: 10px; display: block;"></i>
                    No campaigns found matching "${searchTerm}"
                </div>`;
    } else {
      renderCampaigns(campaigns);
    }
  } catch (error) {
    console.error("Error loading campaigns:", error);
  }
}

function renderCampaigns(campaigns) {
  const container = document.getElementById("campaign-list");
  container.innerHTML = "";

  campaigns.forEach((campaign) => {
    const raised = Number(campaign.currentAmount) || 0;
    const goal = Number(campaign.goal) || 0;

    const card = document.createElement("div");
    card.className = "campaign-card";
    card.dataset.id = campaign.id;

    card.innerHTML = `
            <div class="card-image-wrapper">
                <img src="${campaign.image}" alt="${campaign.title}">
            </div>
            <div class="card-content">
                <h3>${campaign.title || "New Campaign"}</h3>
                 <p class="campaign-description">${campaign.description ? campaign.description.substring(0, 100) + "..." : "Explore this upcoming project."}</p>
                
                <div class="funding-info">
                    <div class="info-item">
                        <span class="info-label">Raised</span>
                        <span class="info-value raised">$${raised.toLocaleString()}</span>
                    </div>
                    <div class="info-item">
                        <span class="info-label">Goal</span>
                        <span class="info-value">$${goal.toLocaleString()}</span>
                    </div>
                </div>
                <button class="support-btn" data-id="${campaign.id}">Support Project</button>
            </div>
        `;
    container.appendChild(card);
  });
}

async function handleSupportAction(campaignId) {
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    alert("Please login to support campaigns");
    return;
  }

  const amount = Number(prompt("Enter pledge amount:"));
  if (!amount || amount <= 0) return;

  const isConfirmed = confirm(
    `Confirm your pledge of $${amount.toLocaleString()} to this project?`,
  );
  if (!isConfirmed) return;

  const pledge = {
    amount: amount,
    userId: user.id,
    campaignId: campaignId,
    date: new Date().toISOString(),
  };

  try {
    const pledgeRes = await fetch("http://localhost:3000/pledges", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pledge),
    });

    if (pledgeRes.ok) {
      const campRes = await fetch(
        `http://localhost:3000/campaigns/${campaignId}`,
      );
      const campaign = await campRes.json();
      const newTotal = (Number(campaign.currentAmount) || 0) + amount;

      await fetch(`http://localhost:3000/campaigns/${campaignId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentAmount: newTotal }),
      });

      alert("Pledge successful! Thank you.");

      await loadApprovedCampaigns();

      const modal = document.getElementById("campaign-modal");
      if (modal.style.display === "flex") {
        const updatedCampaign = allLoadedCampaigns.find(
          (c) => String(c.id) === String(campaignId),
        );
        if (updatedCampaign) openCampaignModal(updatedCampaign);
      }
    }
  } catch (err) {
    console.error("Support failed:", err);
    alert("Error processing pledge.");
  }
}

async function openCampaignModal(campaign) {
  const modal = document.getElementById("campaign-modal");
  const body = modal.querySelector(".modal-body");

  let supportCount = 0;
  try {
    const res = await fetch(
      `http://localhost:3000/pledges?campaignId=${campaign.id}`,
    );
    const pledges = await res.json();
    supportCount = pledges.length;
  } catch (err) {
    console.error(err);
  }

  const raised = Number(campaign.currentAmount) || 0;
  const goal = Number(campaign.goal) || 0;
  const progress = Math.min((raised / goal) * 100, 100);

  body.innerHTML = `
        <p class="modal-author">Campaign by <span>User #${campaign.creatorId}</span></p>
        <div class="modal-grid">
            <div class="modal-left">
                <div class="modal-image"><img src="${campaign.image}"></div>
                <div class="modal-story">
                    <h3>About this Campaign</h3>
                    <p class="description-text">${campaign.description}</p>
                </div>
            </div>
            <div class="modal-right">
                <div class="modal-stats-card">
                    <div class="category-badge">${campaign.category || "General"}</div>
                    <div class="modal-raised">$${raised.toLocaleString()}</div>
                    <p class="goal-text">pledged of $${goal.toLocaleString()} goal</p>
                    <div class="progress-container">
                        <div class="progress-bar" style="width: ${progress}%"></div>
                    </div>
                    <div class="modal-stats-footer">
                        <div class="stat-item">
                            <span class="stat-label">Supports</span>
                             <span class="stat-value">${supportCount}</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Deadline</span>
                            <span class="stat-value">${campaign.deadline}</span>
                        </div>
                    </div>
                    <button class="support-btn" data-id="${campaign.id}">Support Project</button>
                    <div class="modal-location"><i class="fa-solid fa-location-dot"></i> Egypt</div>
                </div>
            </div>
        </div>
    `;

  modal.style.display = "flex";
  document.body.style.overflow = "hidden";
}

document.addEventListener("DOMContentLoaded", () => {
  loadApprovedCampaigns();
  document.getElementById("campaign-list").addEventListener("click", (e) => {
    const card = e.target.closest(".campaign-card");
    const isSupportBtn = e.target.classList.contains("support-btn");

    if (card) {
      const campaignId = card.dataset.id;
      const campaign = allLoadedCampaigns.find(
        (c) => String(c.id) === String(campaignId),
      );

      if (isSupportBtn) {
        handleSupportAction(campaignId);
      } else {
        openCampaignModal(campaign);
      }
    }
  });

  document
    .querySelector("#campaign-modal .modal-body")
    .addEventListener("click", (e) => {
      if (e.target.classList.contains("support-btn")) {
        handleSupportAction(e.target.dataset.id);
      }
    });

  document.querySelector(".close-modal").onclick = () => {
    document.getElementById("campaign-modal").style.display = "none";
    document.body.style.overflow = "auto";
  };

  const searchInput = document.getElementById("search-input");
  searchInput.addEventListener("input", loadApprovedCampaigns);

  document
    .getElementById("category-filter")
    .addEventListener("change", loadApprovedCampaigns);
});
