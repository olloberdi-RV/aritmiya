# Quick Start Guide

## 🚀 Getting Started in 3 Steps

### Step 1: Start a Local Server

Choose one method:

**Python (Recommended):**
```bash
python -m http.server 8000
```

**Node.js:**
```bash
npx http-server -p 8000
```

**VS Code:**
- Install "Live Server" extension
- Right-click `index.html` → "Open with Live Server"

### Step 2: Open in Browser

Navigate to: **http://localhost:8000**

Allow camera permissions when prompted.

### Step 3: Control the Globe

- **Move hand LEFT/RIGHT** → Rotate longitude
- **Move hand UP/DOWN** → Rotate latitude
- **STOP moving** → Detect country automatically
- **Open palm** → Best tracking results

---

## 💡 Tips for Best Experience

### Hand Tracking Tips:
- ✓ Use good lighting
- ✓ Keep hand clearly visible
- ✓ Open palm works best
- ✓ Smooth, steady movements
- ✗ Avoid rapid jerky motions
- ✗ Don't partially hide your hand

### Performance Tips:
- Close unnecessary browser tabs
- Use Chrome, Firefox, or Edge for best results
- Ensure good internet connection (for CDN resources)

---

## 🎮 What You'll See

### On Screen:
1. **Top-left:** Instructions panel
2. **Top-right:** Status indicator (red = no hand, green = tracking)
3. **Bottom-left:** Current coordinates (latitude/longitude)
4. **Bottom-right:** Small camera preview
5. **Center:** 3D rotating Earth globe with stars

### When You Stop:
- Globe gradually slows down (inertia effect)
- Country is automatically detected
- Large overlay appears showing:
  - Country name
  - Capital city
  - Population
- Atmosphere pulses briefly
- Overlay fades after 3 seconds

---

## ⚙️ Customization

Edit `globe-app.js` to adjust behavior:

```javascript
const config = {
  gesture: {
    sensitivity: 3.0,        // Higher = more sensitive
    inertiaDamping: 0.92,    // Lower = stops faster
    stopDelay: 500           // Time before detection (ms)
  }
};
```

---

## ❓ Troubleshooting

### Camera Not Working?
- Check browser permissions
- Make sure you're using localhost or HTTPS
- Reload the page
- Try a different browser

### Hand Not Detected?
- Improve lighting
- Move hand closer to camera
- Open your palm fully
- Check status indicator (should be green)

### Slow Performance?
- Close other tabs
- Lower globe detail in config
- Check GPU acceleration in browser

### Wrong Country Detected?
- Stop moving more completely
- Let globe fully stop rotating
- Try centering the target country better

---

## 🌍 Supported Countries

The app includes 47+ major countries with metadata:
- United States, Canada, Mexico
- Brazil, Argentina, Chile, Colombia
- United Kingdom, France, Germany, Spain, Italy
- Russia, China, Japan, India
- Australia, South Africa, and many more!

When you center on an ocean, it will display "Ocean" instead.

---

## 📝 Notes

- **Local Server Required:** Browsers require a server for camera access
- **Modern Browser Needed:** Chrome 90+, Firefox 88+, Edge 90+, Safari 14+
- **Webcam Required:** Built-in or external camera
- **Desktop/Laptop Best:** Optimized for larger screens

---

## 🎯 Fun Challenges

Try these:

1. **Speed Run:** How fast can you find Brazil?
2. **Accuracy Test:** Can you center exactly on small countries?
3. **Continuous Spin:** Keep your hand moving for smooth continuous rotation
4. **Precision Stop:** Stop exactly on your target country
5. **World Tour:** Visit all 7 continents!

---

## 📞 Need Help?

Check the full README.md for:
- Detailed architecture explanation
- Configuration options
- Browser compatibility
- Troubleshooting guide

---

**Enjoy exploring the world! 🌍👋**
