// Avatar upload
const avatarInput = document.getElementById('avatarInput');
const avatar = document.getElementById('avatar');
const avatarContainer = document.querySelector('.avatar-container');

avatarContainer.addEventListener('click', () => avatarInput.click());

avatarInput.addEventListener('change', function() {
  const file = avatarInput.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = function(e) {
      avatar.src = e.target.result;
    };
    reader.readAsDataURL(file);
  }
});

// Font size adjustment
const fontSize = document.getElementById('fontSize');
const fontSizeValue = document.getElementById('fontSizeValue');
fontSize.addEventListener('input', function() {
  document.body.style.fontSize = fontSize.value + 'px';
  fontSizeValue.textContent = fontSize.value + 'px';
});

// High contrast mode
const contrastToggle = document.getElementById('contrastToggle');
contrastToggle.addEventListener('change', function() {
  document.body.classList.toggle('high-contrast', contrastToggle.checked);
});

// Theme customization
const primaryColor = document.getElementById('primaryColor');
const accentColor = document.getElementById('accentColor');

function updateThemeColor(color, type) {
  document.documentElement.style.setProperty(`--${type}`, color);
}

primaryColor.addEventListener('input', (e) => updateThemeColor(e.target.value, 'primary'));
accentColor.addEventListener('input', (e) => updateThemeColor(e.target.value, 'secondary'));

// Save settings
const saveBtn = document.getElementById('saveBtn');
saveBtn.addEventListener('click', function() {
  const settings = {
    displayName: document.getElementById('displayName').value,
    bio: document.getElementById('bio').value,
    studyTime: document.getElementById('studyTime').value,
    dailyGoal: document.getElementById('dailyGoal').value,
    fontSize: fontSize.value,
    highContrast: contrastToggle.checked,
    primaryColor: primaryColor.value,
    accentColor: accentColor.value
  };
  
  localStorage.setItem('edulifeSettings', JSON.stringify(settings));
  showNotification('Settings saved successfully!');
  updateStreak();
});

// Load saved settings
function loadSettings() {
  const savedSettings = localStorage.getItem('edulifeSettings');
  if (savedSettings) {
    const settings = JSON.parse(savedSettings);
    document.getElementById('displayName').value = settings.displayName || '';
    document.getElementById('bio').value = settings.bio || '';
    document.getElementById('studyTime').value = settings.studyTime || 'Morning';
    document.getElementById('dailyGoal').value = settings.dailyGoal || 4;
    fontSize.value = settings.fontSize || 16;
    fontSizeValue.textContent = (settings.fontSize || 16) + 'px';
    contrastToggle.checked = settings.highContrast || false;
    if (settings.highContrast) {
      document.body.classList.add('high-contrast');
    }
    primaryColor.value = settings.primaryColor || '#003366';
    accentColor.value = settings.accentColor || '#00aeef';
    updateThemeColor(settings.primaryColor || '#003366', 'primary');
    updateThemeColor(settings.accentColor || '#00aeef', 'secondary');
  }
}

// Notification system
function showNotification(message) {
  const notification = document.createElement('div');
  notification.className = 'notification';
  notification.textContent = message;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Initialize
document.addEventListener('DOMContentLoaded', loadSettings);

// Pomodoro timer
let pomodoroInterval;
const pomodoroInput = document.getElementById('pomodoro');
const pomodoroTimer = document.getElementById('pomodoroTimer');
const startPomodoro = document.getElementById('startPomodoro');

startPomodoro.addEventListener('click', function() {
  clearInterval(pomodoroInterval);
  let time = parseInt(pomodoroInput.value) * 60;
  updatePomodoroDisplay(time);
  pomodoroInterval = setInterval(() => {
    time--;
    updatePomodoroDisplay(time);
    if (time <= 0) {
      clearInterval(pomodoroInterval);
      pomodoroTimer.textContent = "Time's up! Take a break 🎉";
    }
  }, 1000);
});

function updatePomodoroDisplay(time) {
  const min = Math.floor(time / 60);
  const sec = time % 60;
  pomodoroTimer.textContent = `${min}:${sec.toString().padStart(2, '0')}`;
}

// Achievement System
const achievements = {
  consistency: {
    id: 'consistency',
    title: 'Consistency',
    icon: 'fa-medal',
    description: 'Maintain a study streak',
    levels: [
      { days: 7, text: '7 day streak', unlocked: false },
      { days: 30, text: '30 day streak', unlocked: false },
      { days: 100, text: '100 day streak', unlocked: false }
    ]
  },
  goalSetter: {
    id: 'goalSetter',
    title: 'Goal Setter',
    icon: 'fa-bullseye',
    description: 'Complete study goals',
    levels: [
      { goals: 5, text: '5 goals completed', unlocked: false },
      { goals: 20, text: '20 goals completed', unlocked: false },
      { goals: 50, text: '50 goals completed', unlocked: false }
    ]
  },
  bookworm: {
    id: 'bookworm',
    title: 'Bookworm',
    icon: 'fa-book-reader',
    description: 'Read books and complete them',
    levels: [
      { books: 10, text: '10 books read', unlocked: false },
      { books: 25, text: '25 books read', unlocked: false },
      { books: 50, text: '50 books read', unlocked: false }
    ]
  }
};

// Track user progress
let userProgress = {
  currentStreak: 0,
  completedGoals: 0,
  booksRead: 0,
  lastStudyDate: null
};

// Load user progress from localStorage
function loadUserProgress() {
  const savedProgress = localStorage.getItem('edulifeProgress');
  if (savedProgress) {
    userProgress = JSON.parse(savedProgress);
    updateAchievements();
  }
}

// Save user progress to localStorage
function saveUserProgress() {
  localStorage.setItem('edulifeProgress', JSON.stringify(userProgress));
  updateAchievements();
}

// Update streak
function updateStreak() {
  const today = new Date().toDateString();
  if (userProgress.lastStudyDate) {
    const lastDate = new Date(userProgress.lastStudyDate);
    const diffDays = Math.floor((new Date() - lastDate) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) {
      userProgress.currentStreak++;
    } else if (diffDays > 1) {
      userProgress.currentStreak = 1;
    }
  } else {
    userProgress.currentStreak = 1;
  }
  
  userProgress.lastStudyDate = today;
  saveUserProgress();
}

// Complete a goal
function completeGoal() {
  userProgress.completedGoals++;
  saveUserProgress();
}

// Complete a book
function completeBook() {
  userProgress.booksRead++;
  saveUserProgress();
}

// Update achievements display
function updateAchievements() {
  const badgesContainer = document.querySelector('.badges');
  badgesContainer.innerHTML = '';

  // Check and update each achievement
  Object.values(achievements).forEach(achievement => {
    let currentLevel = null;
    
    switch(achievement.id) {
      case 'consistency':
        currentLevel = achievement.levels.find(level => 
          userProgress.currentStreak >= level.days && !level.unlocked
        );
        break;
      case 'goalSetter':
        currentLevel = achievement.levels.find(level => 
          userProgress.completedGoals >= level.goals && !level.unlocked
        );
        break;
      case 'bookworm':
        currentLevel = achievement.levels.find(level => 
          userProgress.booksRead >= level.books && !level.unlocked
        );
        break;
    }

    if (currentLevel) {
      currentLevel.unlocked = true;
      showAchievementNotification(achievement.title, currentLevel.text);
    }

    // Get the highest unlocked level
    const highestLevel = achievement.levels.reduce((highest, current) => {
      if (current.unlocked) {
        switch(achievement.id) {
          case 'consistency':
            return userProgress.currentStreak >= current.days ? current : highest;
          case 'goalSetter':
            return userProgress.completedGoals >= current.goals ? current : highest;
          case 'bookworm':
            return userProgress.booksRead >= current.books ? current : highest;
        }
      }
      return highest;
    }, null);

    // Create badge element
    const badge = document.createElement('div');
    badge.className = 'badge';
    badge.innerHTML = `
      <i class="fas ${achievement.icon}"></i>
      <span>${achievement.title}</span>
      <small>${highestLevel ? highestLevel.text : 'Not started'}</small>
    `;
    badgesContainer.appendChild(badge);
  });
}

// Show achievement notification
function showAchievementNotification(title, level) {
  const notification = document.createElement('div');
  notification.className = 'notification achievement-notification';
  notification.innerHTML = `
    <i class="fas fa-trophy"></i>
    <div>
      <strong>Achievement Unlocked!</strong>
      <p>${title} - ${level}</p>
    </div>
  `;
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.classList.add('show');
  }, 100);
  
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 5000);
}

// Initialize achievements
document.addEventListener('DOMContentLoaded', () => {
  loadSettings();
  loadUserProgress();
});