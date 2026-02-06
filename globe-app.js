/* ==========================================
   3D GLOBE WITH HAND GESTURE CONTROL
   ==========================================
   
   This application creates an interactive 3D Earth globe that can be
   rotated using hand gestures detected via webcam. When rotation stops,
   it automatically identifies and displays the country at the center.
   
   ARCHITECTURE:
   1. Globe Rendering (Three.js)
   2. Hand Gesture Detection (MediaPipe Hands)
   3. Gesture-to-Rotation Mapping
   4. Country Detection System (GeoJSON-based)
   5. UI Updates and Visual Feedback
   
   ========================================== */

// ==========================================
// SECTION 1: GLOBAL STATE AND CONFIGURATION
// ==========================================

const config = {
  globe: {
    radius: 2,
    segments: 64,
    cameraDistance: 5
  },
  gesture: {
    sensitivity: 3.0,        // Rotation sensitivity
    inertiaDamping: 0.92,    // Inertia damping factor (0-1)
    stopThreshold: 0.001,    // Threshold to detect stopped rotation
    stopDelay: 500,          // Delay before country detection (ms)
    movementThreshold: 0.01  // Minimum movement to detect hand motion
  },
  detection: {
    minConfidence: 0.7,
    maxDistanceKm: 1000      // Maximum distance for country match (km)
  },
  ui: {
    countryDisplayTime: 3000,     // Time to show country display (ms)
    atmosphereBaseOpacity: 0.1,   // Base opacity of atmosphere
    atmospherePulseAmplitude: 0.1, // Pulse effect amplitude
    atmospherePulseFrequency: 0.5  // Pulse effect frequency
  }
};

// State management
const state = {
  globe: {
    rotation: { x: 0, y: 0 },
    velocity: { x: 0, y: 0 },
    targetRotation: { x: 0, y: 0 }
  },
  hand: {
    detected: false,
    position: { x: 0, y: 0 },
    previousPosition: { x: 0, y: 0 },
    isMoving: false
  },
  country: {
    current: null,
    detected: false
  },
  lastMovementTime: Date.now(),
  stopTimeout: null
};

// ==========================================
// SECTION 2: THREE.JS GLOBE SETUP
// ==========================================

// Scene setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0a0a0a);

// Camera setup
const camera = new THREE.PerspectiveCamera(
  60,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = config.globe.cameraDistance;

// Renderer setup
const renderer = new THREE.WebGLRenderer({ 
  antialias: true,
  alpha: false 
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.body.appendChild(renderer.domElement);
renderer.domElement.id = 'globe-canvas';

// Lighting setup
const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
directionalLight.position.set(5, 3, 5);
scene.add(directionalLight);

// Create Earth globe with texture
const globeGeometry = new THREE.SphereGeometry(
  config.globe.radius,
  config.globe.segments,
  config.globe.segments
);

// Create a realistic Earth texture using a procedural approach
const canvas = document.createElement('canvas');
canvas.width = 2048;
canvas.height = 1024;
const ctx = canvas.getContext('2d');

// Create a blue ocean base
ctx.fillStyle = '#1a4d80';
ctx.fillRect(0, 0, canvas.width, canvas.height);

// Add land masses (simplified continents)
ctx.fillStyle = '#2d5016';

// Africa
ctx.beginPath();
ctx.ellipse(1100, 550, 280, 350, 0, 0, Math.PI * 2);
ctx.fill();

// Europe
ctx.fillRect(1050, 300, 200, 150);

// Asia
ctx.beginPath();
ctx.ellipse(1500, 400, 450, 300, 0, 0, Math.PI * 2);
ctx.fill();

// North America
ctx.beginPath();
ctx.ellipse(400, 350, 300, 280, 0.3, 0, Math.PI * 2);
ctx.fill();

// South America
ctx.beginPath();
ctx.ellipse(550, 700, 180, 280, 0, 0, Math.PI * 2);
ctx.fill();

// Australia
ctx.beginPath();
ctx.ellipse(1650, 750, 150, 120, 0, 0, Math.PI * 2);
ctx.fill();

const texture = new THREE.CanvasTexture(canvas);
texture.needsUpdate = true;

const globeMaterial = new THREE.MeshPhongMaterial({
  map: texture,
  bumpScale: 0.05,
  specular: 0x333333,
  shininess: 5
});

const globe = new THREE.Mesh(globeGeometry, globeMaterial);
scene.add(globe);

// Add atmosphere glow effect
const atmosphereGeometry = new THREE.SphereGeometry(
  config.globe.radius * 1.1,
  config.globe.segments,
  config.globe.segments
);
const atmosphereMaterial = new THREE.MeshBasicMaterial({
  color: 0x4488ff,
  transparent: true,
  opacity: 0.1,
  side: THREE.BackSide
});
const atmosphere = new THREE.Mesh(atmosphereGeometry, atmosphereMaterial);
scene.add(atmosphere);

// Stars background
const starsGeometry = new THREE.BufferGeometry();
const starPositions = [];
for (let i = 0; i < 1000; i++) {
  const x = (Math.random() - 0.5) * 100;
  const y = (Math.random() - 0.5) * 100;
  const z = (Math.random() - 0.5) * 100;
  starPositions.push(x, y, z);
}
starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starPositions, 3));
const starsMaterial = new THREE.PointsMaterial({ 
  color: 0xffffff, 
  size: 0.1 
});
const stars = new THREE.Points(starsGeometry, starsMaterial);
scene.add(stars);

// Country highlight sphere (initially invisible)
const highlightGeometry = new THREE.SphereGeometry(
  config.globe.radius * 1.02,
  config.globe.segments,
  config.globe.segments
);
const highlightMaterial = new THREE.MeshBasicMaterial({
  color: 0x4CAF50,
  transparent: true,
  opacity: 0,
  side: THREE.FrontSide
});
const highlightSphere = new THREE.Mesh(highlightGeometry, highlightMaterial);
scene.add(highlightSphere);

// ==========================================
// SECTION 3: COUNTRY DATA AND DETECTION
// ==========================================

// Simplified country data with coordinates (center points)
// In a production app, you would load a full GeoJSON dataset
const countries = [
  { name: "United States", lat: 37.0902, lon: -95.7129, capital: "Washington, D.C.", population: "331M" },
  { name: "Canada", lat: 56.1304, lon: -106.3468, capital: "Ottawa", population: "38M" },
  { name: "Mexico", lat: 23.6345, lon: -102.5528, capital: "Mexico City", population: "129M" },
  { name: "Brazil", lat: -14.2350, lon: -51.9253, capital: "Brasília", population: "213M" },
  { name: "Argentina", lat: -38.4161, lon: -63.6167, capital: "Buenos Aires", population: "45M" },
  { name: "United Kingdom", lat: 55.3781, lon: -3.4360, capital: "London", population: "68M" },
  { name: "France", lat: 46.2276, lon: 2.2137, capital: "Paris", population: "67M" },
  { name: "Germany", lat: 51.1657, lon: 10.4515, capital: "Berlin", population: "83M" },
  { name: "Spain", lat: 40.4637, lon: -3.7492, capital: "Madrid", population: "47M" },
  { name: "Italy", lat: 41.8719, lon: 12.5674, capital: "Rome", population: "60M" },
  { name: "Russia", lat: 61.5240, lon: 105.3188, capital: "Moscow", population: "144M" },
  { name: "China", lat: 35.8617, lon: 104.1954, capital: "Beijing", population: "1.4B" },
  { name: "Japan", lat: 36.2048, lon: 138.2529, capital: "Tokyo", population: "126M" },
  { name: "India", lat: 20.5937, lon: 78.9629, capital: "New Delhi", population: "1.4B" },
  { name: "Australia", lat: -25.2744, lon: 133.7751, capital: "Canberra", population: "26M" },
  { name: "South Africa", lat: -30.5595, lon: 22.9375, capital: "Pretoria", population: "60M" },
  { name: "Egypt", lat: 26.8206, lon: 30.8025, capital: "Cairo", population: "102M" },
  { name: "Nigeria", lat: 9.0820, lon: 8.6753, capital: "Abuja", population: "211M" },
  { name: "Kenya", lat: -0.0236, lon: 37.9062, capital: "Nairobi", population: "54M" },
  { name: "Saudi Arabia", lat: 23.8859, lon: 45.0792, capital: "Riyadh", population: "35M" },
  { name: "Turkey", lat: 38.9637, lon: 35.2433, capital: "Ankara", population: "85M" },
  { name: "South Korea", lat: 35.9078, lon: 127.7669, capital: "Seoul", population: "52M" },
  { name: "Indonesia", lat: -0.7893, lon: 113.9213, capital: "Jakarta", population: "274M" },
  { name: "Thailand", lat: 15.8700, lon: 100.9925, capital: "Bangkok", population: "70M" },
  { name: "Vietnam", lat: 14.0583, lon: 108.2772, capital: "Hanoi", population: "98M" },
  { name: "Philippines", lat: 12.8797, lon: 121.7740, capital: "Manila", population: "111M" },
  { name: "Malaysia", lat: 4.2105, lon: 101.9758, capital: "Kuala Lumpur", population: "33M" },
  { name: "Pakistan", lat: 30.3753, lon: 69.3451, capital: "Islamabad", population: "225M" },
  { name: "Iran", lat: 32.4279, lon: 53.6880, capital: "Tehran", population: "85M" },
  { name: "Iraq", lat: 33.2232, lon: 43.6793, capital: "Baghdad", population: "41M" },
  { name: "Poland", lat: 51.9194, lon: 19.1451, capital: "Warsaw", population: "38M" },
  { name: "Ukraine", lat: 48.3794, lon: 31.1656, capital: "Kyiv", population: "44M" },
  { name: "Sweden", lat: 60.1282, lon: 18.6435, capital: "Stockholm", population: "10M" },
  { name: "Norway", lat: 60.4720, lon: 8.4689, capital: "Oslo", population: "5M" },
  { name: "Finland", lat: 61.9241, lon: 25.7482, capital: "Helsinki", population: "6M" },
  { name: "Denmark", lat: 56.2639, lon: 9.5018, capital: "Copenhagen", population: "6M" },
  { name: "Netherlands", lat: 52.1326, lon: 5.2913, capital: "Amsterdam", population: "17M" },
  { name: "Belgium", lat: 50.5039, lon: 4.4699, capital: "Brussels", population: "12M" },
  { name: "Switzerland", lat: 46.8182, lon: 8.2275, capital: "Bern", population: "9M" },
  { name: "Austria", lat: 47.5162, lon: 14.5501, capital: "Vienna", population: "9M" },
  { name: "Greece", lat: 39.0742, lon: 21.8243, capital: "Athens", population: "11M" },
  { name: "Portugal", lat: 39.3999, lon: -8.2245, capital: "Lisbon", population: "10M" },
  { name: "Chile", lat: -35.6751, lon: -71.5430, capital: "Santiago", population: "19M" },
  { name: "Peru", lat: -9.1900, lon: -75.0152, capital: "Lima", population: "33M" },
  { name: "Colombia", lat: 4.5709, lon: -74.2973, capital: "Bogotá", population: "51M" },
  { name: "Venezuela", lat: 6.4238, lon: -66.5897, capital: "Caracas", population: "28M" },
  { name: "New Zealand", lat: -40.9006, lon: 174.8860, capital: "Wellington", population: "5M" }
];

/**
 * Calculate distance between two geographic coordinates using Haversine formula
 */
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Convert globe rotation to geographic coordinates
 * Returns the latitude and longitude at the center of the viewport
 */
function getViewportCenterCoordinates() {
  // The globe rotation is inverted from geographic coordinates
  const lat = -(globe.rotation.x * 180 / Math.PI);
  const lon = globe.rotation.y * 180 / Math.PI;
  
  // Normalize to proper ranges
  let normalizedLat = lat % 360;
  if (normalizedLat > 180) normalizedLat -= 360;
  if (normalizedLat < -180) normalizedLat += 360;
  if (normalizedLat > 90) normalizedLat = 180 - normalizedLat;
  if (normalizedLat < -90) normalizedLat = -180 - normalizedLat;
  
  let normalizedLon = lon % 360;
  if (normalizedLon > 180) normalizedLon -= 360;
  if (normalizedLon < -180) normalizedLon += 360;
  
  return { lat: normalizedLat, lon: normalizedLon };
}

/**
 * Find the nearest country to given coordinates
 */
function findCountryAtCoordinates(lat, lon) {
  let nearestCountry = null;
  let minDistance = Infinity;
  
  for (const country of countries) {
    const distance = calculateDistance(lat, lon, country.lat, country.lon);
    if (distance < minDistance) {
      minDistance = distance;
      nearestCountry = country;
    }
  }
  
  // Only return a country if we're reasonably close (within configured distance)
  if (minDistance < config.detection.maxDistanceKm) {
    return nearestCountry;
  }
  
  return { name: "Ocean", capital: "N/A", population: "N/A" };
}

// ==========================================
// SECTION 4: MEDIAPIPE HAND TRACKING
// ==========================================

const video = document.getElementById('video-preview');

// Initialize MediaPipe Hands
const hands = new Hands({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
  }
});

hands.setOptions({
  maxNumHands: 1,
  modelComplexity: 1,
  minDetectionConfidence: config.detection.minConfidence,
  minTrackingConfidence: config.detection.minConfidence
});

// Hand tracking results callback
hands.onResults(onHandsDetected);

function onHandsDetected(results) {
  if (!results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
    state.hand.detected = false;
    updateStatus('No hand detected', false);
    return;
  }
  
  state.hand.detected = true;
  updateStatus('Hand detected - Move to rotate', true);
  
  // Get palm center (landmark 0 is wrist, 9 is middle finger base)
  const landmarks = results.multiHandLandmarks[0];
  const palmCenter = landmarks[9]; // Middle of palm
  
  // Update hand position
  state.hand.previousPosition.x = state.hand.position.x;
  state.hand.previousPosition.y = state.hand.position.y;
  state.hand.position.x = palmCenter.x;
  state.hand.position.y = palmCenter.y;
  
  // Calculate movement delta
  const deltaX = state.hand.position.x - state.hand.previousPosition.x;
  const deltaY = state.hand.position.y - state.hand.previousPosition.y;
  
  // Check if hand is moving
  const movementMagnitude = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
  state.hand.isMoving = movementMagnitude > config.gesture.movementThreshold;
  
  if (state.hand.isMoving) {
    // Update target rotation based on hand movement
    // Horizontal movement rotates longitude (Y axis)
    // Vertical movement rotates latitude (X axis)
    state.globe.targetRotation.y += deltaX * config.gesture.sensitivity;
    state.globe.targetRotation.x -= deltaY * config.gesture.sensitivity;
    
    // Clamp latitude rotation to prevent over-rotation
    const maxLatRotation = Math.PI / 2;
    state.globe.targetRotation.x = Math.max(
      -maxLatRotation,
      Math.min(maxLatRotation, state.globe.targetRotation.x)
    );
    
    state.lastMovementTime = Date.now();
    
    // Hide country display during movement
    hideCountryDisplay();
  }
}

// Initialize camera
const camera2D = new Camera(video, {
  onFrame: async () => {
    await hands.send({ image: video });
  },
  width: 640,
  height: 480,
  facingMode: 'user'
});

camera2D.start().then(() => {
  document.getElementById('loading').style.display = 'none';
  updateStatus('Ready - Move your hand', true);
});

// ==========================================
// SECTION 5: ANIMATION AND ROTATION LOGIC
// ==========================================

function updateGlobeRotation() {
  // Apply inertia to smooth out rotation
  state.globe.velocity.x = (state.globe.targetRotation.x - globe.rotation.x) * 0.1;
  state.globe.velocity.y = (state.globe.targetRotation.y - globe.rotation.y) * 0.1;
  
  // Update globe rotation
  globe.rotation.x += state.globe.velocity.x;
  globe.rotation.y += state.globe.velocity.y;
  
  // Apply damping to velocity for smooth stop
  if (!state.hand.isMoving) {
    state.globe.velocity.x *= config.gesture.inertiaDamping;
    state.globe.velocity.y *= config.gesture.inertiaDamping;
    
    // Update target to current rotation for smooth deceleration
    state.globe.targetRotation.x = globe.rotation.x + state.globe.velocity.x;
    state.globe.targetRotation.y = globe.rotation.y + state.globe.velocity.y;
  }
  
  // Sync highlight sphere rotation
  highlightSphere.rotation.x = globe.rotation.x;
  highlightSphere.rotation.y = globe.rotation.y;
  
  // Update coordinate display
  const coords = getViewportCenterCoordinates();
  document.getElementById('lat-display').textContent = coords.lat.toFixed(2) + '°';
  document.getElementById('lon-display').textContent = coords.lon.toFixed(2) + '°';
  
  // Check if globe has stopped moving
  const velocityMagnitude = Math.sqrt(
    state.globe.velocity.x ** 2 + 
    state.globe.velocity.y ** 2
  );
  
  if (velocityMagnitude < config.gesture.stopThreshold && 
      !state.hand.isMoving &&
      Date.now() - state.lastMovementTime > config.gesture.stopDelay) {
    
    if (!state.country.detected) {
      detectCountry();
    }
  } else {
    state.country.detected = false;
  }
}

function detectCountry() {
  const coords = getViewportCenterCoordinates();
  const country = findCountryAtCoordinates(coords.lat, coords.lon);
  
  if (country && country !== state.country.current) {
    state.country.current = country;
    state.country.detected = true;
    showCountryDisplay(country);
  }
}

// Main animation loop
function animate() {
  requestAnimationFrame(animate);
  
  updateGlobeRotation();
  
  // Slowly rotate stars for visual effect
  stars.rotation.y += 0.0001;
  
  renderer.render(scene, camera);
}

animate();

// ==========================================
// SECTION 6: UI UPDATE FUNCTIONS
// ==========================================

function showCountryDisplay(country) {
  const display = document.getElementById('country-display');
  const nameElement = document.getElementById('country-name');
  const infoElement = document.getElementById('country-info');
  
  nameElement.textContent = country.name;
  
  if (country.capital && country.population) {
    infoElement.textContent = `Capital: ${country.capital} • Population: ${country.population}`;
  } else {
    infoElement.textContent = '';
  }
  
  display.style.display = 'block';
  
  // Fade out after configured time
  setTimeout(() => {
    display.style.display = 'none';
  }, config.ui.countryDisplayTime);
  
  // Highlight effect (pulse the atmosphere)
  let pulseCount = 0;
  const pulseInterval = setInterval(() => {
    atmosphereMaterial.opacity = config.ui.atmosphereBaseOpacity + 
      Math.sin(pulseCount * config.ui.atmospherePulseFrequency) * config.ui.atmospherePulseAmplitude;
    pulseCount++;
    if (pulseCount > 10) {
      clearInterval(pulseInterval);
      atmosphereMaterial.opacity = config.ui.atmosphereBaseOpacity;
    }
  }, 100);
}

function hideCountryDisplay() {
  document.getElementById('country-display').style.display = 'none';
  state.country.detected = false;
}

function updateStatus(message, isActive) {
  const statusText = document.getElementById('status-text');
  const statusDot = document.getElementById('status-dot');
  
  statusText.textContent = message;
  
  if (isActive) {
    statusDot.classList.remove('status-inactive');
    statusDot.classList.add('status-active');
  } else {
    statusDot.classList.remove('status-active');
    statusDot.classList.add('status-inactive');
  }
}

// ==========================================
// SECTION 7: WINDOW RESIZE HANDLER
// ==========================================

window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
});

// ==========================================
// INITIALIZATION COMPLETE
// ==========================================

console.log('3D Globe Application initialized successfully');
console.log('Move your hand to rotate the globe');
console.log('Stop moving to detect the country at the center');
