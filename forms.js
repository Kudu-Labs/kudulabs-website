// Airtable config
const AIRTABLE_API_KEY = "patdRl30nD8YFk7cO.4856be5a8bea7b5db1eef04145b698b78499231f42de0286c07cd381c9c8962e";   // ⚠️ Mets ton vrai token
const AIRTABLE_BASE_ID = "appPBCTZnOfXmENHt";   // ⚠️ Mets l’ID de ta base
const API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

// Tables
const TABLES = {
  waitlist: "Waitlist Entries",
  contact: "Contact Requests",
  team: "Team Applications"
};

// Toast notifications
function showToast(message, type = "success") {
  const toast = document.createElement("div");
  toast.className = "toast";
  toast.textContent = message;
  if (type === "error") toast.style.background = "rgba(200,0,0,0.9)";
  document.body.appendChild(toast);
  setTimeout(() => toast.classList.add("show"), 100);
  setTimeout(() => {
    toast.classList.remove("show");
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// Reusable Airtable sender
async function sendToAirtable(table, data) {
  const res = await fetch(`${API_URL}/${encodeURIComponent(table)}`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AIRTABLE_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ records: [{ fields: data }] })
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

// --- Waitlist form ---
document.querySelector("#waitlist-modal form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const email = e.target.querySelector("input[type=email]").value;
  try {
    await sendToAirtable(TABLES.waitlist, { Email: email });
    showToast("Thanks — you’ve been added to the waitlist!");
    closeModal("waitlist-modal");
    e.target.reset();
  } catch (err) {
    console.error(err);
    showToast("Something went wrong. Please try again.", "error");
  }
});

// --- Contact form ---
document.querySelector("#contact-modal form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    Name: e.target.querySelector("input[required]").value,
    Email: e.target.querySelector("input[type=email]").value,
    Reason: e.target.querySelector("select").value,
    Message: e.target.querySelector("textarea").value
  };
  try {
    await sendToAirtable(TABLES.contact, data);
    showToast("Message sent successfully!");
    closeModal("contact-modal");
    e.target.reset();
  } catch (err) {
    console.error(err);
    showToast("Failed to send message. Please retry.", "error");
  }
});

// --- Team Application form ---
document.querySelector("#join-modal form")?.addEventListener("submit", async e => {
  e.preventDefault();
  const data = {
    "Name": e.target.querySelector("input[required]").value,
    "Email": e.target.querySelector("input[type=email]").value,
    "LinkedIn or Portfolio" : e.target.querySelector("input[type=url]").value,
    "Short Note": e.target.querySelector("textarea").value
  };
  try {
    await sendToAirtable(TABLES.team, data);
    showToast("Application received. We’ll be in touch!");
    closeModal("join-modal");
    e.target.reset();
  } catch (err) {
    console.error("Airtable error:", err);
    showToast("Error: check console for details", "error");

  }
});
