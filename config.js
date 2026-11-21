/* ====== EDIT ME: all shop info lives here. Values below are PLACEHOLDERS. ====== */
window.SITE = {
  name: "Malik's Barbers",
  timezone: "Europe/London",          // used for the live Open/Closed badge
  currency: "£",
  phone: "+44 0000 000000",
  address: "Your street, Your town",
  bookingUrl: "#",                    // paste your booking link (Fresha, Booksy, etc.)
  walkIns: true,
  // 0 = Sunday ... 6 = Saturday. Times 24h. null = closed.
  hours: {
    1: [9, 19], 2: [9, 19], 3: [9, 19], 4: [9, 20], 5: [9, 20], 6: [9, 18], 0: [10, 16]
  },
  steps: [
    ["Pick your cut", "Choose a service and your barber."],
    ["Lock your time", "Instant confirmation by text."],
    ["Walk in fresh", "Sit down. We handle the rest."]
  ],
  // [name, price, minutes, popular?]
  services: [
    ["Skin Fade", 20, 40], ["Haircut", 18, 30], ["Beard Trim", 10, 15],
    ["Cut + Beard", 28, 50, true], ["Kids Cut", 14, 25], ["Hot Towel Shave", 22, 30]
  ],
  special: { "2026-12-25": null },     // date (YYYY-MM-DD) -> null = closed, or [open, close]
  whatsapp: "",                       // e.g. "447000000000" to show a WhatsApp button
  socials: [],                        // e.g. [["Instagram","https://instagram.com/..."]]
  // Scroll timeline: p = scroll progress (0-1), t = video seconds. Equal t = hold on an anchor.
  timeline: {
    desktop: [[0,0],[.12,2.8],[.26,3.8],[.40,4.0],[.47,5.5],[.60,5.7],[.72,9.2],[.90,9.5],[1,10]],
    mobile:  [[0,0],[.12,2.8],[.26,4.0],[.40,4.2],[.47,5.5],[.60,5.7],[.72,9.2],[.90,9.5],[1,10]]
  },
  // Which scroll ranges show which panel
  panels: { welcome:[0,.10], hours:[.24,.42], book:[.45,.62], price:[.70,.92] }
};
