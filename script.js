// Video Loop and Control Module
class VideoLoopManager {
  constructor(videoElement) {
    this.video = videoElement;
    this.startTime = 0;
    this.endTime = 0;
    this.isIntroVideo = false;

    this._initializeEventListeners();
  }

  _initializeEventListeners() {
    this.video.addEventListener("loadedmetadata", () => {
      if (this.endTime === 0) {
        this.endTime = this.video.duration;
      }
    });

    this.video.addEventListener("timeupdate", () => {
      // Only apply looping if not the intro video
      if (!this.isIntroVideo) {
        if (this.video.currentTime >= this.endTime) {
          this.video.currentTime = this.startTime;
        }
      }
    });

    this.video.addEventListener("seeking", () => {
      // Only apply seeking restrictions if not the intro video
      if (!this.isIntroVideo) {
        if (
          this.video.currentTime < this.startTime ||
          this.video.currentTime > this.endTime
        ) {
          this.video.currentTime = this.startTime;
        }
      }
    });
  }

  setLoopPoints(start, end) {
    this.startTime = start;
    this.endTime = end;

    if (this.video.currentTime < start || this.video.currentTime > end) {
      this.video.currentTime = start;
    }
  }

  // New method to set intro video mode
  setIntroVideoMode(isIntro) {
    this.isIntroVideo = isIntro;
  }
}

// Sound Management Module
class SoundManager {
  constructor() {
    this.sounds = {
      hover: new Audio("./sounds/buttonrollover.wav"),
      click: new Audio("./sounds/buttonclickrelease.wav"),
    };
  }

  play(soundType) {
    const sound = this.sounds[soundType];
    if (sound) {
      sound.currentTime = 0;
      sound.play().catch((error) => console.error("Sound play error:", error));
    }
  }
}

// Menu Management Module
class MenuManager {
  constructor(soundManager, modalManager) {
    this.soundManager = soundManager;
    this.modalManager = modalManager;
    this.navigation = document.getElementById("navigation"); // Corrected line
    this.overlay = document.getElementById("overlay");
    this.video = document.querySelector(".video-container video");
    this.videoSource = document.querySelector(".video-container video source");
    this.menuContainer = {
      menu1: document.getElementById("menu-1"),
      menu2: document.getElementById("menu-2"),
    };

    this.menuTemplates = {
      main: {
        menu1: ["HALF-LIFE 2", "HL2: EPISODE ONE", "HL2: EPISODE TWO"],
        menu2: ["EXTRAS", "OPTIONS", "QUIT"],
      },
      halfLife2: {
        menu1: ["NEW GAME", "LOAD GAME", "ACHIEVEMENTS"],
        menu2: ["BACK"],
      },
    };

    this._initializeMenuItemEventListeners();
  }

  _createMenuHTML(items) {
    return items
      .map(
        (item) =>
          `<li><a href="#" class="menu-item" id="${item
            .toLowerCase()
            .replace(/\s+/g, "-")}">${item}</a></li>`
      )
      .join("");
  }

  _updateMenus(menu1Items, menu2Items) {
    this.menuContainer.menu1.innerHTML = this._createMenuHTML(menu1Items);
    this.menuContainer.menu2.innerHTML = this._createMenuHTML(menu2Items);
    this._initializeMenuItemEventListeners();
  }

  _initializeMenuItemEventListeners() {
    document.removeEventListener("mouseenter", this._handleMouseEnter);
    document.removeEventListener("click", this._handleClick);

    this._handleMouseEnter = (event) => {
      if (event.target.classList.contains("menu-item")) {
        this.soundManager.play("hover");
      }
    };

    this._handleClick = (event) => {
      if (event.target.classList.contains("menu-item")) {
        this.soundManager.play("click");
        this._handleMenuItemClick(event.target.textContent);
      }
    };

    document.addEventListener("mouseenter", this._handleMouseEnter);
    document.addEventListener("click", this._handleClick);
  }

  _handleMenuItemClick(text) {
    switch (text) {
      case "HALF-LIFE 2":
        this._updateMenus(
          this.menuTemplates.halfLife2.menu1,
          this.menuTemplates.halfLife2.menu2
        );
        break;
      case "NEW GAME":
        this._startNewGame();
        break;
      case "BACK":
        this._updateMenus(
          this.menuTemplates.main.menu1,
          this.menuTemplates.main.menu2
        );
        break;
      case "OPTIONS":
        this.modalManager.open();
        break;
      case "QUIT":
        window.close();
        break;
    }
  }

  _startNewGame() {
    // Disable looping for intro video
    window.videoLoopManager.setIntroVideoMode(true);

    // Hide navigation and overlay
    this.navigation.style.display = "none";
    this.overlay.style.display = "none";

    // Load and play intro video
    this._loadVideo("./vids/hl2-intro.mp4");

    // Remove any existing event listeners to prevent multiple bindings
    this.video.removeEventListener("ended", this._handleVideoEnd);
    document.removeEventListener("click", this._handleIntroSkip);

    // Bind the video end and skip handlers
    this._handleVideoEnd = this._handleVideoEnd.bind(this);
    this._handleIntroSkip = this._handleIntroSkip.bind(this);

    this.video.addEventListener("ended", this._handleVideoEnd);
    document.addEventListener("click", this._handleIntroSkip);
  }

  _handleIntroSkip(event) {
    // Check if the current video is the intro video
    if (window.videoLoopManager.isIntroVideo) {
      // Prevent triggering if clicking on menu items
      if (!event.target.classList.contains("menu-item")) {
        // Immediately reset to main menu
        this._resetToMainMenu();
      }
    }
  }

  _handleVideoEnd() {
    // Open a new link (replace with actual desired link)
    window.open("https://store.steampowered.com/app/220/HalfLife_2/", "_blank");

    // Reset to original menu state
    this._resetToMainMenu();
  }

  _resetToMainMenu() {
    // Re-enable looping for background video
    window.videoLoopManager.setIntroVideoMode(false);

    // Remove the intro skip event listener
    document.removeEventListener("click", this._handleIntroSkip);

    // Show navigation and overlay
    this.navigation.style.display = "flex";
    this.overlay.style.display = "block";

    // Reset to main menu
    this._updateMenus(
      this.menuTemplates.main.menu1,
      this.menuTemplates.main.menu2
    );

    // Reset video to main background
    this._loadVideo("./vids/main.mp4");

    // Reset loop points to default
    window.videoLoopManager.setLoopPoints(0, 60);
  }

  _loadVideo(src) {
    this.videoSource.src = src;
    this.video.load();
    this.video.play();
  }
}

// Modal Management Module
class ModalManager {
  constructor() {
    this.optionsModal = document.getElementById("options-modal");
    this._initializeGlobalEventListeners();
  }

  _initializeGlobalEventListeners() {
    // Use addEventListener with a single listener that persists
    const optionsButton = document.getElementById("options");
    const closeOptionsButton = document.getElementById("close-options");
    const backgroundSelect = document.getElementById("background-select");

    // Remove any existing listeners first to prevent duplicates
    optionsButton.removeEventListener("click", this.open);
    closeOptionsButton.removeEventListener("click", this.close);
    backgroundSelect.removeEventListener(
      "change",
      this._handleBackgroundChange
    );

    // Bind methods to ensure correct 'this' context
    this.open = this.open.bind(this);
    this.close = this.close.bind(this);
    this._handleBackgroundChange = this._handleBackgroundChange.bind(this);

    // Add new listeners
    optionsButton.addEventListener("click", this.open);
    closeOptionsButton.addEventListener("click", this.close);
    backgroundSelect.addEventListener("change", this._handleBackgroundChange);
  }

  open() {
    this.optionsModal.style.display = "flex";
  }

  close() {
    this.optionsModal.style.display = "none";
  }

  _handleBackgroundChange(event) {
    const value = event.target.value;
    const loopPoints = {
      option1: [0, 60],
      option2: [61, 120],
      option3: [121, 180],
      option4: [181, 240],
      option5: [241, 300],
      option6: [301, 360],
      option7: [361, 420],
    };

    const points = loopPoints[value] || [
      0,
      window.videoLoopManager.video.duration,
    ];
    window.videoLoopManager.setLoopPoints(...points);
  }
}

// Application Initialization
document.addEventListener("DOMContentLoaded", () => {
  const video = document.querySelector(".video-container video");
  window.videoLoopManager = new VideoLoopManager(video);
  window.soundManager = new SoundManager();
  window.modalManager = new ModalManager();
  window.menuManager = new MenuManager(
    window.soundManager,
    window.modalManager
  );

  // Default start configuration
  window.videoLoopManager.setLoopPoints(0, 60);
});
