EverAfter Planner — Wedding Planning Website Prototype

FILES
- index.html: main planner dashboard, vendors, budget, guest list, timeline, seating plan and partner collaboration hub.
- rsvp.html: separate guest-facing RSVP page.
- style.css: responsive styling and accessibility-related presentation.
- script.js: interactive prototype behaviour.

NEW FEATURES ADDED
1. Wedding timeline: add dated milestones, assign an owner, mark milestones complete, remove milestones and see overdue dates highlighted.
2. Seating plan: add tables with a seat capacity, assign guests from the planner guest list, remove assignments, and remove tables.
3. Separate guest RSVP page: guests can enter their name, optional email, attendance response and an optional note.
4. Partner collaboration hub: create shared tasks with an owner and due date, mark tasks complete, and save shared notes.

PROTOTYPE LIMITATIONS
- Timeline, seating assignments, partner tasks and notes use browser localStorage. Data remains in the same browser/device and is not shared live with another partner.
- The separate RSVP page saves a demonstration response in localStorage on the guest's browser. It does not send the response to the couple or automatically update the planner guest list.
- A production version would require secure accounts, a shared backend/database, privacy controls and server-side RSVP handling.
- Vendor listings and prices are examples, not live offers. The contact form is a demo and does not send email.
- WCAG accessibility should be tested with automated tools and assistive technology before claiming full compliance.

HOW TO RUN
Open index.html in a modern browser. Use the “Guest RSVP” navigation link to open rsvp.html. For localStorage behaviour, use the same browser and origin; for best results, run the folder using a simple local web server rather than opening files directly.
