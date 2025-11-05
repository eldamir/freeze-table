const randomStrings = [
  "Lorem ipsum dolor sit amet.",
  "Consectetur adipiscing elit.",
  "Sed do eiusmod tempor incididunt.",
  "Ut labore et dolore magna aliqua.",
  "Ut enim ad minim veniam.",
  "Quis nostrud exercitation ullamco laboris.",
  "Nisi ut aliquip ex ea commodo consequat.",
  "Duis aute irure dolor in reprehenderit.",
  "In voluptate velit esse cillum dolore.",
]

function randomizeCellValues(tableElement) {
  const rows = tableElement.rows;
  for (let i = 0; i < rows.length; i++) {
    const cells = rows[i].cells;
    for (let j = 0; j < cells.length; j++) {
      // Pick a new random string for the cell
      const randomIndex = Math.floor(Math.random() * randomStrings.length);
      cells[j].textContent = randomStrings[randomIndex];
    }
  }
}