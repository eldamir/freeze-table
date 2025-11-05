// lacking features:
// 1. update on resize
// 2. what if the table cells have colspan?
// 3. update on DOM changes to colgroup cols

class FreezeTable extends HTMLElement {
  connectedCallback() {
    const table = this.querySelector("table");
    if (!table) {
      return;
    }

    const colFlags = [];
    // repurpose existing colgroup to hold new data
    for (const col of table.querySelectorAll("col")) {
      // treat data-col as if it is a classList of sorts
      const flags = (col.dataset.col || "").split(" ");
      // create new Set for each item so each column has it's own data
      for (let i = 0; i < col.span; i++) {
        colFlags.push(new Set(flags));
      }
    }

    // this logic could be improved by looping through all table.rows and their cells
    for (let i = 0, columnInset = 0; i < colFlags.length; i++) {
      if (!colFlags[i].has("freeze")) continue;

      // in rare cases the main headings are in tfoot instead of thead
      let th = table.querySelector(`:is(thead, tfoot) > tr > :nth-child(${i + 1})`);
      if (!th) continue;
      
      // If the th has colspan, we can't calculate the width properly here.
      // Instead, we need to find the next row where there isn't a colspan
      if (th.colSpan > 1) {
        // Find the next table row that have no colspans
        let row = null;
        let found = false;
        for (row of table.rows) {
          const cell = row.cells[i];
          if (cell && cell.colSpan > 1) {
            continue;
          }
          found = true;
          break;
        }
        if (!found) {
          // Unable to find a suitable cell, skip this column
          console.log(`Skipping frozen column ${i + 1} due to colspan complications.`);
          continue;
        }
        th = row.cells[i];
      }

      // using custom property allows for all styles to remain in CSS
      for (const cell of table.querySelectorAll(
        `tr > :nth-child(${i + 1})`
      )) {
        cell.style.setProperty(
          "--TableContainer-columnInset",
          `${columnInset}`
        );
      }

      // using subpixel values should help avoid tearing issues when zooming (offsetWidth = full pixels only)
      const {width} = th.getBoundingClientRect();
      columnInset += width;
    }
  }
}

customElements.define("freeze-table", FreezeTable);
