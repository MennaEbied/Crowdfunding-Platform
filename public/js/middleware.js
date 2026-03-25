(function () {
  function checkAccess() {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    const path = window.location.pathname;
    const protectedPages = ["admin.html", "campaign.html", "profile.html"];
    const isProtected = protectedPages.some((page) => path.includes(page));

    const authPages = ["login.html", "register.html"];
    const isAuthPage = authPages.some((page) => path.includes(page));

    if (isProtected && !user) {
      window.location.replace("/pages/login.html");
    }

    if (isAuthPage && user) {
      window.location.replace("/index.html");
    }

    if (path.includes("admin.html") && user?.role !== "admin") {
      window.location.replace("/index.html");
    }
  }

  checkAccess();

  window.onpageshow = function (event) {
    if (
      event.persisted ||
      (window.performance && window.performance.navigation.type === 2)
    ) {
      window.location.reload();
    }
  };
})();
