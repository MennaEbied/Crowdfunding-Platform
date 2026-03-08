async function Login(email, password) {
  try {
    const res = await fetch(`http://localhost:3000/users?email=${email}`);
    const users = await res.json();

    console.log("Users found by email:", users);

    if (users.length > 0) {
      const user = users[0];
      if (user.password !== password) {
        alert("Invalid password.");
        return;
      }

      if (!user.isActive) {
        alert("Your account has been banned by an admin.");
        return;
      }

      localStorage.setItem(
        "currentUser",
        JSON.stringify({
          id: user.id,
          name: user.name,
          role: user.role,
        }),
      );

      if (user.role === "admin") {
        window.location.href = "/pages/admin.html";
      } else {
        window.location.href = "/index.html";
      }
    } else {
      alert("No user found with this email.");
    }
  } catch (error) {
    console.error("Login error:", error);
  }
}
document.getElementById("login-form")?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  await Login(email, password);
});

async function Register(name, email, password) {
  try {
    const response = await fetch(`http://localhost:3000/users?email=${email}`);
    const existingUser = await response.json();
    if (existingUser.length > 0) {
      alert("Email already in use.");
      return;
    }
    const newUser = {
      name: name,
      email: email,
      password: password,
      role: "user",
      isActive: true,
    };
    const res = await fetch("http://localhost:3000/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newUser),
    });
    if (res.ok) {
      alert("Registration successful! Please login.");
      window.location.href = "/pages/login.html";
    }
  } catch (error) {
    console.error("Registration error:", error);
  }
}
document
  .getElementById("register-form")
  ?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("name").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    await Register(name, email, password);
  });
