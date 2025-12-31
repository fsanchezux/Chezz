# Design System - Application Guidelines

## 🎨 Color Palette

**STRICT RULE: Only use these colors in the entire application**

| Color Name | Hex Code | Usage |
|------------|----------|-------|
| **Green** (Primary) | `#d2fe0b` | Titles, buttons, and primary actions |
| **Black** | `#313131` | Backgrounds of modals and cards |
| **White** | `#f9f9f9` | Normal body text |
| **Dark Grey** | `#909090` | Secondary text |
| **Light Grey** | `#b8b8b6` | Borders and subtle elements |

---

## 📋 CSS Utility Classes

**Always include these utility classes in your CSS:**

```css
/* Text Colors */
.green-text { color: #d2fe0b; }
.black-text { color: #313131; }
.white-text { color: #f9f9f9; }
.dark-grey-text { color: #909090; }
.light-grey-text { color: #b8b8b6; }

/* Background Colors */
.green-bg { background-color: #d2fe0b; }
.black-bg { background-color: #313131; }
.white-bg { background-color: #f9f9f9; }
.dark-grey-bg { background-color: #909090; }
.light-grey-bg { background-color: #b8b8b6; }
```

---

## ✍️ Typography

### Font Family
- **Primary Font:** `Delight`
- Import method: Include Delight font in your project

```css
body {
  font-family: 'Delight', sans-serif;
}
```

### Text Styles
- **Titles:** Always use `font-weight: bold;` and color `#d2fe0b` (green)
- **Body Text:** Always use color `#f9f9f9` (white)
- **Secondary Text:** Use color `#909090` (dark grey)

### Example:
```css
h1, h2, h3, h4, h5, h6 {
  font-weight: bold;
  color: #d2fe0b;
}

p, span, div {
  color: #f9f9f9;
}
```

---

## 🎯 Icons

**ONLY use Material Icons from Google**

### Implementation:
```html
<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
```

### Usage:
```html
<span class="material-icons">home</span>
<span class="material-icons">settings</span>
<span class="material-icons">search</span>
```

---

## 🎭 Design Principles

### ✅ DO:
- Keep designs minimal and clean
- Use generous whitespace
- Apply flat design approach
- Maintain simplicity in all layouts

### ❌ DON'T:
- **NO shadows** - `box-shadow: none;` everywhere
- **NO animations** - No transitions, no keyframes
- **NO gradients** - Only solid colors
- **NO extra colors** - Stick to the palette

---

## 🧩 Component Rules

### Modals
```css
.modal {
  background-color: #313131; /* Black */
  box-shadow: none;
}
```

### Cards
```css
.card {
  background-color: #313131; /* Black */
  box-shadow: none;
}
```

### Buttons
```css
.button {
  background-color: #d2fe0b; /* Green */
  color: #313131; /* Black text */
  font-weight: bold;
  box-shadow: none;
  border: none;
}
```

### Titles
```css
.title {
  color: #d2fe0b; /* Green */
  font-weight: bold;
}
```

---

## 📐 Layout Guidelines

- Use simple, clean layouts
- Avoid complex nested structures
- Maintain consistent spacing
- Use the color palette for visual hierarchy
- Keep interfaces intuitive and straightforward

---

## 🚫 Forbidden Elements

- Drop shadows
- Box shadows
- Text shadows
- Animations (`@keyframes`, `transition`, `animation`)
- Gradients
- Colors outside the defined palette
- Custom icon sets (only Material Icons)

---

## ✨ Code Quality

When generating code following this design system:

1. Always reference these color variables
2. Include the utility classes
3. Ensure no shadows or animations slip through
4. Use Material Icons exclusively
5. Apply Delight font family
6. Keep titles bold and green
7. Keep body text white
8. Use black backgrounds for modals and cards

---

**Remember:** Simplicity, cleanliness, and consistency are key. Every element should follow these guidelines without exception.
