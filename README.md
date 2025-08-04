# 2048 Game

A modern, web-based implementation of the popular 2048 puzzle game with smooth animations, responsive design, and modular architecture. Built with vanilla HTML, CSS, and JavaScript.

![2048 Game Screenshot](https://user-images.githubusercontent.com/placeholder/2048-screenshot.png)

## 🎮 Play Online

**[Play the game here →](https://hacklabworks.github.io/2048/)**

## ✨ Features

- **🎯 Classic 2048 Gameplay** - Join tiles with the same number to reach 2048
- **📱 Mobile Responsive** - Optimized for both desktop and mobile devices
- **🎨 Smooth Animations** - Fluid tile movements and merge effects
- **💾 Persistent Storage** - Automatically saves your progress and best score
- **⌨️ Multiple Controls** - Arrow keys, WASD, and touch gestures
- **🏗️ Modular Architecture** - Clean, maintainable code structure
- **🎵 Visual Feedback** - Score animations and game state indicators
- **🌐 Cross-Browser Compatible** - Works on all modern browsers

## 🚀 Quick Start

### Option 1: Play Online
Simply visit **[hacklabworks.github.io/2048](https://hacklabworks.github.io/2048/)** to start playing immediately.

### Option 2: Run Locally
1. **Clone the repository:**
   ```bash
   git clone https://github.com/HackLabWorks/2048.git
   cd 2048
   ```

2. **Open in browser:**
   - Double-click `index.html`, or
   - Serve with a local server:
     ```bash
     # Using Python
     python -m http.server 8000
     
     # Using Node.js
     npx serve .
     
     # Using any other static file server
     ```

3. **Start playing!** 🎯

## 🎯 How to Play

- **Goal**: Combine tiles with the same number to reach the **2048** tile
- **Controls**:
  - **Desktop**: Use arrow keys (↑↓←→) or WASD
  - **Mobile**: Swipe in any direction
  - **Restart**: Click "New Game" button
- **Scoring**: Each merge adds the new tile's value to your score
- **Win**: Reach the 2048 tile to win (but you can keep playing!)
- **Lose**: When no more moves are possible

## 🏗️ Architecture

This implementation follows the original 2048 game's modular architecture with modern improvements:

### Core Classes

```
📁 Project Structure
├── 🎮 Game2048          # Main game controller
├── 🔲 Tile              # Individual tile representation  
├── 🎯 Grid              # Game board management
├── ⌨️ KeyboardInputManager # Input handling
├── 🖥️ HTMLActuator      # DOM manipulation and rendering
└── 💾 LocalStorageManager # Persistent storage
```

### Key Features

- **Modular Design**: Separation of concerns with dedicated classes
- **Event-Driven**: Clean communication between components
- **State Management**: Proper game state serialization and restoration
- **Animation System**: CSS transform-based smooth animations
- **Input Abstraction**: Unified handling for keyboard and touch inputs

## 🛠️ Technical Details

### Technologies Used
- **HTML5** - Semantic markup and structure
- **CSS3** - Modern styling with animations and responsive design
- **Vanilla JavaScript** - No frameworks, just clean ES6+ code
- **LocalStorage API** - Persistent game state and scoring

### Browser Support
- Chrome 60+
- Firefox 55+
- Safari 12+
- Edge 79+
- Mobile browsers (iOS Safari, Chrome Mobile)

### Performance Optimizations
- **RequestAnimationFrame** for smooth 60fps animations
- **CSS Transforms** for hardware-accelerated tile movements
- **Event Delegation** for efficient input handling
- **Minimal DOM Manipulation** with virtual state management

## 🎨 Customization

The game is designed to be easily customizable:

### Styling
- Modify `style.css` to change colors, fonts, and animations
- Tile colors are defined in CSS custom properties
- Responsive breakpoints can be adjusted for different screen sizes

### Game Logic
- Grid size can be modified in the `Game2048` constructor
- Win condition can be changed (default: 2048)
- Tile spawn probability can be adjusted (default: 90% for 2, 10% for 4)

### Controls
- Add new input methods by extending `KeyboardInputManager`
- Touch sensitivity can be tuned in the touch event handlers

## 🤝 Contributing

We welcome contributions! Here's how you can help:

1. **Fork** the repository
2. **Create** a feature branch (`git checkout -b feature/amazing-feature`)
3. **Commit** your changes (`git commit -m 'Add amazing feature'`)
4. **Push** to the branch (`git push origin feature/amazing-feature`)
5. **Open** a Pull Request

### Development Guidelines
- Follow the existing code style and architecture
- Test on multiple browsers and devices
- Update documentation for significant changes
- Ensure animations remain smooth and responsive

## 📝 License

This project is licensed under the **MIT License** - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **[Gabriele Cirulli](https://github.com/gabrielecirulli/2048)** - Creator of the original 2048 game
- **[Veewo Studio](http://veewo.com/)** - Creators of the 1024 game that inspired 2048
- **[Asher Vollmer](http://asherv.com/)** - Creator of Threes, the original inspiration

## 📊 Project Stats

![GitHub stars](https://img.shields.io/github/stars/HackLabWorks/2048?style=social)
![GitHub forks](https://img.shields.io/github/forks/HackLabWorks/2048?style=social)
![GitHub issues](https://img.shields.io/github/issues/HackLabWorks/2048)
![GitHub license](https://img.shields.io/github/license/HackLabWorks/2048)

---

<div align="center">
  <p>Made with ❤️ by <a href="https://github.com/HackLabWorks">HackLabWorks</a></p>
  <p>🎮 <strong><a href="https://hacklabworks.github.io/2048/">Play Now!</a></strong> 🎮</p>
</div>