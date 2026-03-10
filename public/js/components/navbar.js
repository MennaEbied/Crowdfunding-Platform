function Navbar() {
  const navRight = document.querySelector(".nav-right");
  const navLeft = document.querySelector(".nav-left");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    //GUEST MODE
    navRight.innerHTML = `
            <a href="/pages/login.html">Login</a>
            <a href="/pages/register.html">Register</a>
        `;
    navLeft.innerHTML = `
        <a href="/index.html">Home</a>
        <a href="#">About</a>
        <a href="#">Contact Us</a>
        `;
  } else {
    //USER MODE
    navLeft.innerHTML = `
      <a href="/index.html">Home</a>
        <a href="/pages/campaign.html">Launch Campaign</a>
        <a href="#">About</a>
        <a href="/pages/profile.html">My Pledges</a>
      `;
    let links = `<span class="user-welcome">Hello, ${user.name}</span>`;
    links += ``;
    if (user.role === "admin") {
      links += `<a href="/pages/admin.html">Admin Dashboard</a>`;
    }

    links += `<button id="logout-btn">Logout</button>`;
    navRight.innerHTML = links;

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("currentUser");
      window.location.href = "/index.html";
    });
  }
}
document.addEventListener("DOMContentLoaded", Navbar);
