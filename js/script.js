//menu mobile
const toggle = document.querySelector(".nav-toggle");
const list = document.querySelector(".nav-list");
if (toggle && list) {
  toggle.addEventListener("click", () => {
    const open = list.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
}

const current = location.pathname.split("/").pop() || "index.html";
document.querySelectorAll(".nav-link").forEach((a) => {
  const href = a.getAttribute("href") || "";
  const page = href.split("#")[0];

  if (page === current) a.classList.add("active");

  if (
    current === "index.html" &&
    location.hash &&
    href.endsWith(location.hash)
  ) {
    document
      .querySelectorAll(".nav-link")
      .forEach((x) => x.classList.remove("active"));
    a.classList.add("active");
  }
});
