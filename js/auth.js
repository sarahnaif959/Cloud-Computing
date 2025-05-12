document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.querySelector("button");

  loginButton.addEventListener("click", async () => {
    const email = document.querySelector('input[type="email"]').value;
    const password = document.querySelector('input[type="password"]').value;

    const res = await fetch("http://localhost:3001/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (data.token) {
      // ✅ نحفظ التوكن
      localStorage.setItem("token", data.token);

      // ✅ نحفظ بيانات المستخدم إذا رجعها السيرفر
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }

      alert("تم تسجيل الدخول");
      window.location.href = "index.html";
    } else {
      alert("فشل الدخول: " + data.message);
    }
  });
});
