<h1 align="center"><img src="https://raw.githubusercontent.com/hudayiarici/improved-intra-pokemon-edition/main/promo/logo-wide.png" height="192" alt="Improved Intra: Pokemon Edition"></h1>

<p align="center">
  <b>The ultimate Pokemon trainer extension for 42's Intranet! Catch 'em all while coding.</b>
</p>

---

## 🚀 Pokemon Edition Features
This is a specialized fork of the amazing [Improved Intra](https://github.com/FreekBes/improved_intra) project, transformed into a full Pokemon experience.

- **Gotta Catch 'Em All:** Every user on Intra is automatically assigned a Pokemon based on their login.
- **Dynamic Sprites:** Support for all **1000+ Pokemon** from all generations (powered by [PokeAPI](https://pokeapi.co/)).
- **Choose Your Partner:** Click on your own Pokemon icon on your profile or dashboard to change it to any Pokemon you want!
- **Global Synchronization:** All Pokemon choices are synced across the world using [Supabase](https://supabase.com/). When you change your Pokemon, everyone else using the extension will see your new partner!
- **Pokemon Terminology:** 
  - "Patroning" → **Pokemons**
  - "Patroned by" → **Trainer**
  - "Not patroning anyone" → **Not training any Pokemon**
  - "No patron" → **No trainer**
- **Pixel-Art Aesthetic:** High-quality pixel-art sprites integrated directly into the Intra UI.

## 🛠 Features from Original Improved Intra
- **Dark Theme:** Rest your eyes during those long night clusters.
- **Customizable Profiles:** Add custom banners and GitHub links.
- **Enhanced Stats:** View outstanding flags and project details at a glance.
- **UI Cleanups:** Optimized layouts and removed unnecessary buttons.

## 📦 Installation & Download

### Direct Download
- [**Download for Chrome / Chromium Based Browsers (chromium.zip)**](https://github.com/hudayiarici/improved-intra-pokemon-edition/raw/main/chromium.zip)
- [**Download for Firefox (firefox.zip)**](https://github.com/hudayiarici/improved-intra-pokemon-edition/raw/main/firefox.zip)

### How to Install
#### For Chrome / Brave / Edge:
1. Download `chromium.zip` and extract it to a folder.
2. Open `chrome://extensions/` in your browser.
3. Enable **Developer Mode** (top right).
4. Click **Load unpacked** and select the folder where you extracted the files.

#### For Firefox:
1. Download `firefox.zip`.
2. Open `about:debugging#/runtime/this-firefox` in your browser.
3. Click **Load Temporary Add-on...** and select the `firefox.zip` file.
*(Note: Temporary add-ons in Firefox are removed when the browser restarts.)*

## ⚙️ Configuration (For Owners)
If you are hosting your own version, make sure to set your Supabase keys in `fixes/general.js`:
```javascript
const SUPABASE_URL = 'https://your-project.supabase.co';
const SUPABASE_ANON_KEY = 'your-anon-key';
```

## 🤝 Contributing
Feel free to fork and add more Pokemon features! Bug reports and feature requests are welcome.

---
*Disclaimer: This project is a community-made fork and is not affiliated with 42 or Nintendo.*