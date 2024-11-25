const video = document.querySelector(".video-container video");
let startTime = 0; // in seconds
let endTime = 0; // in seconds

// Initialize when video metadata is loaded
video.addEventListener("loadedmetadata", () => {
  // Set default end time to video duration if not already set
  if (endTime === 0) {
    endTime = video.duration;
  }
});

// Check time and loop if necessary
video.addEventListener("timeupdate", () => {
  if (video.currentTime >= endTime) {
    video.currentTime = startTime;
  }
});

// Example function to set loop points
function setLoopPoints(start, end) {
  startTime = start;
  endTime = end;

  // If video is currently outside new bounds, reset to start
  if (video.currentTime < startTime || video.currentTime > endTime) {
    video.currentTime = startTime;
  }
}

// Ensure video stays within bounds when seeking
video.addEventListener("seeking", () => {
  if (video.currentTime < startTime) {
    video.currentTime = startTime;
  }
  if (video.currentTime > endTime) {
    video.currentTime = startTime;
  }
});

// Create audio objects
const hoverSound = new Audio("./sounds/buttonrollover.wav");
const clickSound = new Audio("./sounds/buttonclickrelease.wav");

// Get all menu items
const menuItems = document.querySelectorAll(".menu-item");

// Function to play sound
function playSound(audio) {
  // Reset the audio to start
  audio.currentTime = 0;
  // Play the sound
  audio.play().catch((error) => {
    console.log("Error playing sound:", error);
  });
}

// Add event listeners to each menu item
menuItems.forEach((item) => {
  // Hover sound
  item.addEventListener("mouseenter", () => {
    playSound(hoverSound);
  });

  // Click sound
  item.addEventListener("click", () => {
    playSound(clickSound);
  });
});

// Add event listener to the quit button
const quitButton = document.getElementById("quit");
quitButton.addEventListener("click", () => {
  // Quit the game
  window.close();
});

const optionsButton = document.getElementById("options");
optionsButton.addEventListener("click", () => {
  openOptionsModal();
});

// Function to open the options modal
function openOptionsModal() {
  const optionsModal = document.getElementById("options-modal");
  optionsModal.style.display = "flex";
}

const closeButton = document.getElementById("close-options");
closeButton.addEventListener("click", () => {
  closeOptionsModal();
});

// Function to close the options modal
function closeOptionsModal() {
  const optionsModal = document.getElementById("options-modal");
  optionsModal.style.display = "none";
}

// Add event listener to the background select
const backgroundSelect = document.getElementById("background-select");
backgroundSelect.addEventListener("change", () => {
  switch (backgroundSelect.value) {
    case "option1":
      setLoopPoints(0, 60);
      break;
    case "option2":
      setLoopPoints(61, 120);
      break;
    case "option3":
      setLoopPoints(121, 180);
      break;
    case "option4":
      setLoopPoints(181, 240);
      break;
    case "option5":
      setLoopPoints(241, 300);
      break;
    case "option6":
      setLoopPoints(301, 360);
      break;
    case "option7":
      setLoopPoints(361, 420);
      break;
    default:
      setLoopPoints(startTime, endTime);
  }
});

window.onload = () => {
  setLoopPoints(0, 60);
};
