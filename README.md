# 3D Globe with Hand Gesture Control

An interactive web application that allows users to rotate a 3D Earth globe using hand gestures detected via webcam. When the globe rotation stops, the application automatically identifies and displays the country located at the center of the screen.

## Features

✨ **Core Features:**
- Real-time hand gesture recognition using MediaPipe Hands
- Interactive 3D Earth globe rendered with Three.js and WebGL
- Gesture-based rotation control (horizontal/vertical hand movement)
- Automatic country detection when rotation stops
- Live coordinate display (latitude/longitude)

🎨 **Visual Enhancements:**
- Realistic Earth texture with continents and oceans
- Atmospheric glow effect around the globe
- Star-filled space background
- Smooth inertia-based rotation
- Pulsing highlight effect when country is detected
- Small camera preview window

📱 **UI Features:**
- Clean, modern responsive design
- Real-time status indicators
- Interactive instructions panel
- Country information display (name, capital, population)
- Coordinate tracking display

## Technical Stack

- **HTML5** - Structure and layout
- **CSS3** - Styling and animations
- **JavaScript (ES6+)** - Application logic
- **Three.js (v0.152.2)** - 3D graphics and WebGL rendering
- **MediaPipe Hands** - Real-time hand tracking and gesture recognition

## Requirements

- Modern web browser (Chrome, Firefox, Edge, Safari)
- Webcam/camera access
- Local web server (due to browser security restrictions)

## Installation & Setup

### Method 1: Using Python

```bash
# Navigate to the project directory
cd hand-3d

# Start a local server (Python 3)
python -m http.server 8000

# Or Python 2
python -m SimpleHTTPServer 8000
```

### Method 2: Using Node.js

```bash
# Navigate to the project directory
cd hand-3d

# Install http-server globally (if not already installed)
npm install -g http-server

# Start the server
http-server -p 8000
```

### Method 3: Using VS Code

1. Install the "Live Server" extension
2. Right-click on `index.html`
3. Select "Open with Live Server"

## Usage

1. **Start the Application:**
   - Open your browser to `http://localhost:8000`
   - Allow camera permissions when prompted

2. **Control the Globe:**
   - Move your hand **left/right** to rotate longitude
   - Move your hand **up/down** to rotate latitude
   - Use an **open palm** for best tracking
   - The globe will have momentum and gradually slow down

3. **Detect Countries:**
   - **Stop moving** your hand
   - Wait for the globe to stop rotating
   - The country at the center will be **automatically detected**
   - Country name, capital, and population will be displayed

## Project Structure

```
hand-3d/
├── index.html          # Main HTML file with UI structure and styling
├── globe-app.js        # Core application logic
│   ├── Globe rendering (Three.js)
│   ├── Hand gesture detection (MediaPipe)
│   ├── Gesture-to-rotation mapping
│   ├── Country detection system
│   └── UI updates and animations
└── README.md          # This file
```

## Architecture Overview

### 1. Globe Rendering System
- Three.js scene with perspective camera
- Sphere geometry with procedurally generated Earth texture
- Lighting system (ambient + directional)
- Atmospheric glow effect
- Star field background

### 2. Hand Gesture Detection
- MediaPipe Hands integration
- Real-time hand landmark tracking
- Palm center position calculation
- Movement delta detection

### 3. Gesture-to-Rotation Mapping
- Hand movement converted to globe rotation
- Configurable sensitivity settings
- Inertia and momentum physics
- Smooth damping for natural feel

### 4. Country Detection System
- Geographic coordinate calculation
- Haversine distance formula for nearest country
- 47+ countries with metadata
- Automatic detection on rotation stop

### 5. UI and Visual Feedback
- Real-time status updates
- Coordinate display
- Country information overlay
- Camera preview window
- Responsive design

## Configuration

You can adjust the behavior by modifying the `config` object in `globe-app.js`:

```javascript
const config = {
  globe: {
    radius: 2,              // Globe size
    segments: 64,           // Detail level
    cameraDistance: 5       // Camera distance
  },
  gesture: {
    sensitivity: 3.0,       // Rotation sensitivity
    inertiaDamping: 0.92,   // Momentum damping (0-1)
    stopThreshold: 0.001,   // Stop detection threshold
    stopDelay: 500          // Delay before detection (ms)
  },
  detection: {
    minConfidence: 0.7      // Hand detection confidence
  }
};
```

## Browser Compatibility

| Browser | Version | Status |
|---------|---------|--------|
| Chrome  | 90+     | ✅ Fully Supported |
| Firefox | 88+     | ✅ Fully Supported |
| Edge    | 90+     | ✅ Fully Supported |
| Safari  | 14+     | ✅ Supported |
| Opera   | 76+     | ✅ Supported |

## Performance Considerations

- **Camera Resolution:** Set to 640x480 for optimal performance
- **Globe Segments:** 64 segments balances quality and performance
- **Hand Tracking:** Single hand mode for better performance
- **Rendering:** Optimized with proper Three.js settings

## Troubleshooting

### Camera Not Working
- Ensure you've granted camera permissions
- Check if another application is using the camera
- Try reloading the page
- Use HTTPS or localhost (required for camera access)

### Poor Hand Tracking
- Ensure good lighting conditions
- Keep your hand in front of the camera
- Use an open palm for best results
- Avoid rapid movements

### Slow Performance
- Close other browser tabs
- Reduce globe segment count in config
- Check your GPU/hardware acceleration settings
- Use a newer browser version

## Future Enhancements

Potential improvements for future versions:

- 🌍 Full GeoJSON country boundary data for accurate detection
- 🎯 More precise country highlighting on the globe
- 📊 Extended country metadata (GDP, area, language, flag)
- 🖐️ Additional gesture controls (pinch to zoom, rotate with two hands)
- 🎨 Selectable globe textures (satellite, political, terrain)
- 🌙 Night mode with city lights
- 🔍 Search functionality to find countries
- 📱 Mobile device support with touch controls
- 🎬 Recording and playback of globe tours
- 🌐 Internationalization (multiple languages)

## Code Quality

The codebase follows modern web development best practices:

- ✅ Clear separation of concerns
- ✅ Well-documented with comprehensive comments
- ✅ Modular architecture with logical sections
- ✅ Consistent naming conventions
- ✅ Proper error handling
- ✅ Responsive and accessible design
- ✅ Performance optimized
- ✅ Browser compatibility considered

## License

This project is open source and available for educational purposes.

## Credits

- **Three.js** - 3D graphics library
- **MediaPipe** - Hand tracking solution by Google
- **Earth Texture** - Procedurally generated in-app

## Contributing

Contributions are welcome! Feel free to submit issues and pull requests.

## Contact

For questions or feedback, please open an issue in the repository.

---

**Enjoy exploring the world with hand gestures! 🌍👋**
