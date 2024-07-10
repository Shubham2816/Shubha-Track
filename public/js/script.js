const socket = io();
const map = L.map("map").setView([0, 0], 10);
const markers = {};

// Initialize the map tile layer
L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "Shubham-Map"
}).addTo(map);

// Function to handle receiving location updates
socket.on("receive-location", (data) => {
    const { id, latitude, longitude } = data;

    // Set the view of the map to the new location
    map.setView([latitude, longitude], 16);

    // Check if marker already exists for this ID
    if (markers[id]) {
        markers[id].setLatLng([latitude, longitude]); // Update existing marker's position
    } else {
        markers[id] = L.marker([latitude, longitude]).addTo(map); // Create a new marker
    }
});

// Function to handle user disconnecting
socket.on("user-disconnected", (id) => {
    if (markers[id]) {
        map.removeLayer(markers[id]); // Remove marker from the map
        delete markers[id]; // Remove marker from the markers object
    }
});

// Geolocation handling (watchPosition)
if (navigator.geolocation) {
    navigator.geolocation.watchPosition(
        (position) => {
            const { latitude, longitude } = position.coords;
            socket.emit("send-location", { latitude, longitude }); // Emit location to server
        },
        (error) => {
            console.error(error); // Handle geolocation error
        },
        {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0
        }
    );
} else {
    console.error("Geolocation is not supported by this browser.");
}
