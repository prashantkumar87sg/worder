# Word Reader - Early Reading App

A mobile-optimized web application designed to help early readers practice reading 3-letter CVC (consonant-vowel-consonant) words through speech recognition.

## Features

- **6 Vertical Blocks**: Screen divided into 6 large, touch-friendly blocks
- **Random CVC Words**: Curated list of 3-letter words appropriate for early readers
- **Speech Recognition**: Click any block to activate microphone for 3 seconds
- **Visual Feedback**: 
  - Green background for correct words
  - Red flash animation for incorrect attempts
  - Recording indicator with countdown
- **Celebration**: Confetti animation and celebratory sound when all words are completed
- **Auto-Reset**: New random words after completion
- **Mobile Optimized**: Responsive design for all screen sizes

## How to Use

1. **Open the app** in a modern browser (Chrome recommended for best speech recognition)
2. **Click any word block** to start recording
3. **Speak the word** clearly within the 3-second countdown
4. **Watch for feedback**:
   - Green background = correct
   - Red flash = incorrect (can try again)
5. **Complete all 6 words** to see the celebration
6. **New words** will automatically load for the next round

## Technical Requirements

- **Browser**: Chrome (recommended) or any modern browser with Web Speech API support
- **Microphone**: Device must have microphone access
- **Internet**: Required for Google Fonts and speech recognition

## File Structure

```
worder/
├── index.html          # Main HTML structure
├── styles.css          # CSS styling and animations
├── words.js           # CVC word database
├── script.js          # Main JavaScript functionality
└── README.md          # This file
```

## Word Categories

The app includes CVC words from various categories:
- Animals (cat, dog, pig, cow, fox, etc.)
- Body parts (eye, ear, arm, leg, etc.)
- Food items (egg, jam, pie, nut, etc.)
- Nature (sun, moon, star, tree, etc.)
- Colors (red, blue, pink, etc.)
- Actions (run, sit, jump, hop, etc.)
- Common objects (hat, bag, box, map, etc.)
- Family words (mom, dad, boy, girl, etc.)

## Browser Compatibility

- **Chrome**: Full support with best speech recognition
- **Firefox**: Good support
- **Safari**: Limited speech recognition support
- **Edge**: Good support

## Development

To run locally:
1. Clone or download the files
2. Open `index.html` in a web browser
3. Allow microphone access when prompted

## Speech Recognition Notes

- Works best in quiet environments
- Clear pronunciation improves accuracy
- Case-insensitive matching
- Handles slight pronunciation variations
- 3-second recording window per attempt

## Educational Benefits

- **Phonemic Awareness**: Helps children connect sounds to letters
- **Blending Skills**: Practice combining letter sounds into words
- **Confidence Building**: Immediate positive feedback
- **Engagement**: Interactive and fun learning experience
- **Repetition**: Multiple attempts allowed for mastery 