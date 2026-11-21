# Malik's Barbers: scroll-driven walkthrough

Scroll = video. Scroll down to walk in, scroll up to rewind.
Flow: pulsing Welcome bubble at the doors, pulled to the couch (opening hours), turn left (booking), turn right (prices).

## Upload to GitHub (no folders)
All files sit in one flat list, so you can drag them all into a repo in the browser.
Then Settings > Pages > Deploy from branch > `main` / root.

## Edit your info
Everything (hours, prices, phone, booking link, WhatsApp, socials, special days) is in `config.js`. Values are PLACEHOLDERS.

## Files
index.html, style.css, config.js, main.js (scroll to video), fx.js (Lenis, GSAP, Three.js, WebGL, GLSL), fx2.js (more Lenis, GSAP, CSS/JS),
desktop.mp4 + mobile.mp4 (+ posters). Needs internet for the libraries (Lenis, GSAP, Three.js).

## Keys
Arrows or 1-4 jump | Space next | T auto-tour | Shift slow | F stats | P screenshot | Q lite mode | ? help

## Re-encode a video (keep every frame a keyframe so scrubbing is smooth)
ffmpeg -i in.mp4 -an -c:v libx264 -g 1 -crf 27 -pix_fmt yuv420p -movflags +faststart out.mp4

Optional: `python3 build-single-file.py` makes one standalone HTML file.
