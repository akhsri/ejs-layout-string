# ejs-layout-string

`ejs-layout-string` is a utility module for rendering EJS templates with layouts, allowing for dynamic extraction of `<script>`, `<style>`, and `<meta>` tags. It simplifies content organization and improves code reusability. 

The module facilitates performance optimization by providing the ability to use the rendered HTML for caching and also facilitates **server-side rendering (SSR)** by returning the rendered HTML as a string.

---

## Features

- 🎯 Layout-based template rendering
- 🛠️ Configurable extraction options for scripts, styles, and meta tags
- ⚡ Promise-based async rendering
- 🔍 TypeScript support

---

## Installation

Install the package:

```bash
npm install ejs-layout-string
```

---

## API Reference

### `renderWithLayout(view, options)`

Renders an EJS view with a specified layout and options.

#### Parameters

1. **`view`** (string): Path to the EJS view file to render.
2. **`options`** ([RenderOptions](#renderoptions)): Options for rendering.

### `RenderOptions`

```typescript
interface RenderOptions {
  layoutsPath: string; // Path to the layout EJS file
  extractScripts?: boolean; // Extract <script> tags to end of body (default: false)
  extractStyles?: boolean;  // Extract <style> tags to head (default: false)
  extractStylesToBody?: boolean; // Extract <style> tags to end of body (default: false)
  extractMetas?: boolean;   // Extract <meta> tags to head (default: false)
  [key: string]: any; // Additional dynamic properties
}
```

#### Returns

A Promise that resolves to the rendered HTML string.

---

## Quick Start

### Example Code

```javascript
import path from 'path';
import { renderWithLayout } from 'ejs-layout-string';

const ejsPath = path.resolve(__dirname, '../views/pages/ind/page.ejs');

const html = await renderWithLayout(ejsPath, {
  // Layout options
  layoutsPath: path.resolve(__dirname, '../views/layouts/layout.ejs'),
  extractScripts: false,      // extract <script> tags to end of body
  extractStyles: false,       // extract <style> tags to head
  extractStylesToBody: false,  // extract <style> tags to end of body
  extractMetas: false   // extract <meta> tags to head
  
  
  // Additional properties required for ejs
  title: 'User Dashboard',
  pageDescription: 'View your account details and statistics',
  keywords: 'dashboard, user profile, statistics',
  user: {
    name: 'John Doe',
    accountType: 'Premium',
    isAdmin: true
  },
  memberSince: new Date('2023-01-15').toLocaleDateString(),
  supportEmail: 'support@example.com',        
});

console.log("Rendered HTML:", html);
```

---

### EJS Templates

#### Page Template (`page.ejs`)

```ejs
<h1>Welcome, <%= user.name %>!</h1>
<p>Thank you for being a premium user since <%= memberSince %>.</p>

<script>
  console.log('Welcome to the dashboard!');
</script>

<style>
  body {
    font-family: Arial, sans-serif;
  }
</style>
```

#### Layout Template (`layout.ejs`)

```ejs
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="description" content="<%= pageDescription %>">
  <meta name="keywords" content="<%= keywords %>">
  <title><%= title %></title>
  <%- style %>  <%# This variable should be present here when extractStyles = true %>
</head>
<body>
  <header>
    <h1>Site Header</h1>
  </header>

  <main>
    <%- body %>
  </main>

  <footer>
    <p>Contact support at <%= supportEmail %></p>
  </footer>

  <%- script %>
</body>
</html>
```

---

#### Usage Note

To render the returned HTML string as part of an HTTP response:

```javascript
app.get('/', async (req, res) => {
  const htmlString = await renderWithLayout(ejsPath, {
    layoutsPath: layoutPath,
    title: 'Home Page',
    user: { name: 'John Doe' },
  });
  res.send(htmlString);
});
```


---

#### License

This project is licensed under the MIT License. See the LICENSE file for details.

