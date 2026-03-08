function Navbar() {
  const navRight = document.querySelector(".nav-right");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    navRight.innerHTML = `
            <a href="/pages/login.html">Login</a>
            <a href="/pages/register.html">Register</a>
        `;
  } else {
    let links = `<span class="user-welcome">Hello, ${user.name}</span>`;
    links += `<a href="/pages/profile.html">My Pledges</a>`;
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
