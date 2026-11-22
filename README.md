# Worldbox - Ancient Kingdoms

A world-building strategy game inspired by Worldbox, created with HTML5 Canvas 2D.

## Features

- **Multiple Races**: Humans, Elves, Dwarves, Goblins, Giants, and more
- **Giant Race**: Massive creatures with unique abilities
- **Animals**: 15+ species including deer, wolves, bears, eagles, and more
- **Buildings**: 20+ structure types including houses, farms, temples, forts, and more
- **Politics**: 5 political systems (Democracy, Monarchy, Theocracy, Dictatorship, Anarchy)
- **Kingdom Structures**: Capitol, Palace, Tower, Amphitheater, Library, and more
- **Sub-structures**: Add complexity to your buildings
- **Weather System**: Storms, rain, clear, and dry conditions
- **Season Cycle**: Spring, Summer, Autumn, Winter

## Running the Game

### Web Version
```bash
# Serve locally
python3 -m http.server 8080

# Open http://localhost:8080 in your browser
```

### Android APK
To package as an APK:

1. **Install Cordova:**
```bash
npm install -g cordova
```

2. **Initialize Cordova project:**
```bash
mkdir worldbox-android
cd worldbox-android
cordova create . com.yourcompany.worldbox Worldbox
```

3. **Copy game files:**
```bash
cp -r /c/Users/milly/Worldbox-game/* .
```

4. **Add Android platform:**
```bash
cordova platform add android
```

5. **Build the APK:**
```bash
cordova build --release
```

6. **Sign the APK:**
```bash
jarsign -verbose -sigalg SHA1withRSA -digestalg SHA1 -keystore my-release-key.keystore build/outputs/apk/android-armv7-release-unsigned.apk my-release-key
```

7. **Deploy to device:**
```bash
cordova run android
```

## Game Overview

### Races
- **Human**: Balanced stats, curious, adventurous
- **Giant**: Unmatched strength, Stone Skin, strong
- **Elf**: Elegant, mystical, wealthy
- **Dwarf**: Gnomish skill, strong, miners
- **Gnome**: Fast growth, skilled builders, strong
- **Orc**: Fast reproduction, strong, warlike

### Animals
- Herbivores: Deer, Rabbit, Cow, Sheep, Goat, Panda, Koala, Yak
- Carnivores: Wolf, Bear, Eagle
- Omnivores: Pig, Rooster, Spider, Rat, Fish
- Tameable: Deer, Rabbit, Cow, Sheep, Pig, Rooster, Goat, Yak
- Wild: Wolf, Bear, Eagle, Panda, Koala
- Pests: Spider, Rat

### Buildings
- **Residential**: House, Living Room
- **Agricultural**: Farm, Garden, Fishing
- **Commercial**: Market, Plaza, Harbor, Pier
- **Defensive**: Watchtower, Fort, Training Hood
- **Economic**: Mine, Workshop, Lab
- **Religious**: Temple, Place of Worship
- **Aesthetic**: Forest, School, Laboratory

### Politics
- **Democracy**: Happy citizens, higher growth
- **Monarchy**: Centralized rule, stable
- **Theocracy**: Religious rule, steady growth
- **Dictatorship**: Strict control, high allegiance but unhappy
- **Anarchy**: No rule, productive but unstable

## Controls

- **Left Click**: Select and interact with cells
- **Right Click**: Context menu for exploration
- **Zoom**: Use the zoom controls (or mouse wheel)
- **Tools**:
  - Select: Click to inspect
  - Build: Place buildings
  - Research: Research new technologies
  - Diplomacy: Manage relations

## Game Mechanics

### Resources
- Gold: Used for building and trading
- Food: Required for population growth
- Wood: Used for building

### Turn System
- Each turn represents a day
- 30 days = 1 month
- 4 months = 1 season
- Weather affects resource production

### Scoring
- Population count
- Wealth generated
- Reputation gained
- Number of territories controlled

## Attribution

This is an original game inspired by the Worldbox concept. No copyrighted assets are used.

## License

This project is for educational purposes. All rights reserved.
