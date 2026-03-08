async function loadApprovedCampaigns() {

  const res = await fetch("http://localhost:3000/campaigns?isApproved=true");
  const campaigns = await res.json();

  const container = document.getElementById("campaign-list");
  container.innerHTML = campaigns
    .map(
      (cam) => `
        <div class="card">
            <img src="${cam.image}" alt="Campaign Image"> <h3>${cam.title}</h3>
            <p>Goal: $${cam.goal}</p>
            <p>Deadline: ${cam.deadline}</p>
        </div>
    `,
    )
    .join("");
}
document.addEventListener("DOMContentLoaded", loadApprovedCampaigns);