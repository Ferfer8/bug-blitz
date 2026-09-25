# 🐞 Bug Blitz

**Slice, Smash, Conquer: Where Creepy Crawlers Meet Their Match**

Bug Blitz is a browser game inspired by Fruit Ninja, but instead of slicing fruit, you blitz bugs. Swipe across the screen to squash as many bugs as you can before the timer runs out and watch out for the shoes!

**[▶ Play Bug Blitz](https://bug-blitz-game.netlify.app/)**

---

## About the Project

Bug Blitz started in 2023 as coursework for a second-year module in my Computer Science degree. I knew I wanted to build something like Fruit Ninja, but I didn't want it to be about fruit. When I mentioned this to my lecturer, he suggested bugs: as developers, we spend half our time fixing them anyway. The idea stuck.

In 2026, I revisited the project to prepare it for my portfolio. I updated parts of it, but deliberately kept its original foundations so it still reflects where I was as a developer at the time. See [What's Changed](#whats-changed-in-2026) below.

### A Note on "Bugs" 🐜

I'm aware that not every creature in this game is technically a bug. Ants, flies and beetles are insects and spiders are arachnids. For the sake of the game (and the pun), they're all classified as bugs here. 😂

---

## Features

- **Two game modes:** Easy and Hard. Bugs move faster in Hard mode.
- **Fruit Ninja–style gameplay:** bugs and shoes launch in arcs across the screen, spin as they fly and split in half when sliced.
- **Shoe penalty:** slice a shoe and you lose 10 seconds.
- **Unlockable content:** reach score milestones to unlock new bugs and blitz weapons, celebrated with a confetti animation.
- **User accounts:** sign up and log in, with progress, high scores and unlocks saved in the browser.
- **Leaderboard:** see how your scores compare.
- **User settings:** mute audio, choose your bug and weapon and read the in-game help FAQ.
- **Parallax home page:** a layered forest background that moves as you scroll.
- **Credits page:** every third-party asset is credited to its creator.

## How to Play

1. Sign up or log in.
2. Choose Easy or Hard mode.
3. Hold down your mouse or trackpad and swipe across bugs to blitz them.
4. Avoid the shoes, since each one you hit costs you 10 seconds.
5. Score as many points as you can before the 2-minute timer runs out.

---

## Built With

- **HTML, CSS and vanilla JavaScript** (no frameworks)
- **HTML Canvas API** for gameplay rendering and animation
- **localStorage** for user accounts, progress and settings

## What's Changed in 2026

**Updated:**
- **Assets:** replaced images I could no longer find licenses for with properly licensed alternatives, all credited in [CREDITS.md](CREDITS.md).
- **Gameplay rendering:** reworked how bugs and shoes move and are sliced, with arcing flight paths, sliced halves, splash effects and consistent speed across different screen refresh rates.
- **UI and design:** added the parallax hero section, redesigned the congratulations modal, improved the settings layout and replaced placeholder content with a working help FAQ.
- **Credits page:** added a dedicated page crediting all third-party assets.

**Intentionally kept from the original:**
- **localStorage for data:** the original brief required it, so user data is still saved in the browser rather than a database.
- **Multi-page structure:** the site is still built as separate HTML pages, as it was originally.

Keeping these lets the project show both where I started and how I've grown.

## If I Rebuilt It Today

- Store accounts and scores in a database with a backend API, so progress works across devices.
- Use a component-based framework like React for shared elements such as the navbar, footer and modals.
- Add touch support for mobile and tablets.
- Improve accessibility, including keyboard navigation and screen reader support.

---

## Acknowledgements

The core game logic was originally built with the help of the YouTube tutorial **"Ball Ninja Javascript Game | Fruit Ninja Clone | HTML canvas"** by Teenage Programmer. I used it to understand how a Fruit Ninja–style game works, then adapted and extended it with my own changes for Bug Blitz.

## Credits

Bug Blitz uses artwork, fonts and a library from other creators. See [CREDITS.md](CREDITS.md) for the full list. Thank you to all of them!

## License

© 2023–2026 Jennifer Nggada. All rights reserved.

This code is shared publicly as part of my portfolio. You're welcome to view it, but please don't copy, modify, or reuse it without my permission. Interested in using it? Contact me on [GitHub](https://github.com/Ferfer8/) or [LinkedIn](https://www.linkedin.com/in/jennifer-nggada-662219314/).

## Author

**Jennifer Nggada**
