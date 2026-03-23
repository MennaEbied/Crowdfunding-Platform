function Navbar() {
  const navRight = document.querySelector(".nav-right");
  const navLeft = document.querySelector(".nav-left");
  const user = JSON.parse(localStorage.getItem("currentUser"));

  if (!user) {
    //GUEST MODE
    navRight.innerHTML = `
            <button id="login-btn">Login</button>
            <button id="register-btn">Register</button>
        `;
    navLeft.innerHTML = `
        <a href="/index.html">Home</a>
        <a href="#">About</a>
        <a href="#">Contact Us</a>
        `;

    document.getElementById("login-btn").addEventListener("click", () => {
      window.location.href = "/pages/login.html";
    });
    document.getElementById("register-btn").addEventListener("click", () => {
      window.location.href = "/pages/register.html";
    });
  } else {
    //USER MODE
    navLeft.innerHTML = `
      <a href="/index.html">Home</a>
        <a href="/pages/campaign.html">Launch Campaign</a>
        ${user.role === "admin" ? '<a href="/pages/admin.html">Dashboard</a>' : ""}
        <a href="/pages/profile.html">Profile</a>
      `;
    let rightLinks = `<span class="user-welcome">Hello, ${user.name}</span>`;
    rightLinks += `<button id="logout-btn">Logout</button>`;
    navRight.innerHTML = rightLinks;

    document.getElementById("logout-btn").addEventListener("click", () => {
      localStorage.removeItem("currentUser");
       sessionStorage.removeItem("currentUser");
      window.location.replace("/index.html");
    });
  }
  const mobileNav = document.querySelector(".mobile-nav");
  const navMenu = document.querySelector(".nav-menu");
  if (mobileNav) {
    mobileNav.addEventListener("click", () => {
      navMenu.classList.toggle("active");

      const icon = mobileNav.querySelector("i");
      if (navMenu.classList.contains("active")) {
        icon.classList.replace("fa-bars", "fa-xmark");
      } else {
        icon.classList.replace("fa-xmark", "fa-bars");
      }
    });
  }
}
document.addEventListener("DOMContentLoaded", Navbar);
