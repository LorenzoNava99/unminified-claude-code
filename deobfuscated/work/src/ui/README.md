# UI Module

Terminal user interface components and rendering for Claude Code CLI.

## Overview

This module provides UI components and rendering for the terminal interface:
- Terminal output formatting
- Interactive prompts
- Progress indicators
- Markdown rendering
- Syntax highlighting
- Tool selection interfaces

## Key Components

### Display Manager

Handles terminal output and formatting:

```javascript
class DisplayManager {
  /**
   * Render formatted output
   */
  render(content, options) { }

  /**
   * Show progress indicator
   */
  showProgress(message) { }

  /**
   * Clear screen
   */
  clear() { }

  /**
   * Show spinner
   */
  spinner(message) { }
}
```

### Prompts

Interactive user input prompts:

```javascript
// Text input
const answer = await prompt.text({
  message: 'Enter your name:',
  default: 'User'
});

// Confirmation
const confirmed = await prompt.confirm({
  message: 'Continue?',
  default: true
});

// Selection
const choice = await prompt.select({
  message: 'Choose an option:',
  choices: ['Option 1', 'Option 2', 'Option 3']
});

// Multi-select
const selections = await prompt.multiselect({
  message: 'Select tools:',
  choices: ['Tool 1', 'Tool 2', 'Tool 3']
});
```

### Markdown Rendering

Renders markdown in the terminal with formatting:

```javascript
import { renderMarkdown } from './ui/markdown.js';

const markdown = `
# Title
**Bold text** and *italic text*

- Bullet 1
- Bullet 2

\`\`\`javascript
console.log('code block');
\`\`\`
`;

console.log(renderMarkdown(markdown));
```

### Syntax Highlighting

Highlights code snippets:

```javascript
import { highlightCode } from './ui/highlight.js';

const code = `
function hello() {
  console.log('Hello, World!');
}
`;

console.log(highlightCode(code, 'javascript'));
```

## UI Components

### Welcome Message

```javascript
import { showWelcome } from './ui/welcome.js';

showWelcome({
  theme: 'dark',
  message: 'Welcome to Claude Code!'
});
```

### Tool Selection

```javascript
import { selectTool } from './ui/tool-selector.js';

const tool = await selectTool({
  tools: availableTools,
  onSelect: (tool) => console.log('Selected:', tool.name)
});
```

### Progress Bar

```javascript
import { ProgressBar } from './ui/progress.js';

const bar = new ProgressBar({
  total: 100,
  format: '{bar} {percentage}% | {value}/{total}'
});

for (let i = 0; i <= 100; i++) {
  bar.update(i);
  await sleep(50);
}
```

### Spinner

```javascript
import { Spinner } from './ui/spinner.js';

const spinner = new Spinner('Processing...');
spinner.start();

// Do work...
await processData();

spinner.stop('Done!');
```

## Theming

Support for light and dark themes:

```javascript
import { setTheme } from './ui/theme.js';

setTheme('dark'); // or 'light'
```

## Layout Components

### Columns

```javascript
import { columns } from './ui/layout.js';

console.log(columns([
  'Column 1 content',
  'Column 2 content',
  'Column 3 content'
]));
```

### Tables

```javascript
import { table } from './ui/table.js';

console.log(table([
  ['Name', 'Age', 'City'],
  ['Alice', '30', 'NYC'],
  ['Bob', '25', 'LA']
]));
```

## Output Formatting

### Colors

```javascript
import { chalk } from './ui/colors.js';

console.log(chalk.red('Error'));
console.log(chalk.green('Success'));
console.log(chalk.blue('Info'));
console.log(chalk.yellow('Warning'));
```

### Styles

```javascript
console.log(chalk.bold('Bold'));
console.log(chalk.italic('Italic'));
console.log(chalk.underline('Underline'));
console.log(chalk.dim('Dimmed'));
```

## Dependencies

- **Utilities Module** - String formatting helpers
- **Configuration Module** - UI preferences
- **Tools Module** - Tool display components
