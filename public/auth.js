document.addEventListener("DOMContentLoaded", function () {
  const loginButton = document.querySelector("button"); // الزر الوحيد في الصفحة

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
      localStorage.setItem("token", data.token);
      alert("تم تسجيل الدخول 🎉");
      window.location.href = "index.html"; // يدخلك الصفحة الرئيسية
    } else {
      alert("فشل الدخول: " + data.message);
    }
  });
});
