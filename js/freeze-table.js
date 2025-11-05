// lacking features:
// 1. update on resize

class FreezeTable extends HTMLElement {
  colFlags;

  connectedCallback() {
    const table = this.querySelector("table");
    if (!table) {
      return;
    }

    this.setupMutationObserver(table);

    this.colFlags = [];
    // repurpose existing colgroup to hold new data
    for (const col of table.querySelectorAll("col")) {
      // treat data-col as if it is a classList of sorts
      const flags = (col.dataset.col || "").split(" ");
      // create new Set for each item so each column has it's own data
      for (let i = 0; i < col.span; i++) {
        this.colFlags.push(new Set(flags));
      }
    }

    this.setInsetStyles(table);
  }

  setInsetStyles(table) {
    for (let i = 0, columnInset = 0; i < this.colFlags.length; i++) {
      if (!this.colFlags[i].has("freeze")) continue;

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

  setupMutationObserver(targetNode) {
    // Options for the observer (which mutations to observe)
    const config = {
      attributes: true,
      childList: true,
      subtree: true
    };

    // Callback function to execute when mutations are observed
    const callback = (mutationList, observer) => {
      for (const mutation of mutationList) {
        if (mutation.type === 'childList') {
          // Recalculate the inset styles if the contents of the table changes
          this.setInsetStyles(targetNode);
          return;
        }
      }
    };

    // Create an observer instance linked to the callback function
    const observer = new MutationObserver(callback);

    // Start observing the target node for configured mutations
    observer.observe(targetNode, config);

    // Later, you can stop observing
    // observer.disconnect();
  }
}

customElements.define("freeze-table", FreezeTable);
