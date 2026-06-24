# 🔊 Volume Booster Safe

> A clean, tracker-free Chrome volume booster extension.

## What is this?
Volume Booster Safe lets you boost your browser volume past the maximum level. 
This is a cleaned-up, open-source version of a popular Chrome Web Store extension that was found to contain hidden tracking and affiliate marketing code.

## Why was it cleaned?
The original extension contained the "GiveFreely" tracker which silently:
- Tracked your location (via MaxMind GeoIP)
- Monitored your shopping habits (cart, checkout pages)
- Redirected links to affiliate URLs (`wild.link`)
- Stole Shopify Shop IDs
- Fetched remote configurations and logged data to their servers

All tracking scripts, remote configurations, overly broad permissions (`<all_urls>`, `webRequest`), and auto-updates from Google have been **completely removed**.

## Features
- **100% Safe:** No trackers, no ads, no remote code.
- **Modern UI:** Clean, dark-themed popup with modern UI elements.
- **Auto-Update:** Checks GitHub Releases for updates automatically and notifies you.

## Installation
1. Download the latest release `.zip` or `.crx `from GitHub and extract it.
2. Open Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** in the top right corner.
4. Click **Load unpacked** and select the extracted folder.
