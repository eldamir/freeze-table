// lacking features:
// 1. update on resize
// 2. what if the table cells have colspan?
// 3. update on DOM changes to colgroup cols

class FreezeTable extends HTMLElement {
    connectedCallback() {
        const table = this.querySelector("table");
        if (!table) {
            console.log("No table found");
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
        console.log(colFlags);

        // this logic could be improved by looping through all table.rows and their cells
        for (let i = 0, columnInset = 0; i < colFlags.length; i++) {
            if (!colFlags[i].has("freeze")) continue;
            console.log(`Index ${colFlags[i]} has freeze`);

            // in rare cases the main headings are in tfoot instead of thead
            const th = table.querySelector(`:is(thead, tfoot) > tr > :nth-child(${i + 1})`);
            if (!th) continue;

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
            const { width } = th.getBoundingClientRect();
            columnInset += width;
        }
    }
}

customElements.define("freeze-table", FreezeTable);
