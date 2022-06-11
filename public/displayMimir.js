/**
 * displayMimir.js is the driver that manages the display of Mimir visually.
 * 
 * @author Pirjot Atwal
 */

import MimirNet from "./MimirNet.js";

/**
 * Utility helper function to minimize the lines needed
 * to initialize a new document element.
 * 
 * Also provides extra help in immediately assigning classes
 * to the classList (you only need to use "class" for the
 * key of the pair in which you are assigning classes)
 * 
 * EXAMPLES: 
 * quickCreate("div", {"class": ["room"], "style": "height: auto"}, "123")
 * quickCreate("h1", null, "Hello World")
 * 
 * @param {String} tagName The name of the tag
 * @param {JSON} tags The tags in JSON format
 * @param {String} text The textContent if needed to assign
 * @author Pirjot Atwal
 */

function quickCreate(tagName, tags=null, text=null) {
    let element = document.createElement(tagName);
    if (tags != null) {
        for (let key of Object.keys(tags)) {
            if (key == "class") {
                for (let className of tags[key]) {
                    element.classList.add(className);
                }
            } else {
                element.setAttribute(key, tags[key]);
            }
        }
    }
    if (text != null) {
        element.textContent = text;
    }
    return element;
}

/**
 * Display the status of a neural network in the onscreen div.
 * @param {MimirNet} mimir 
 * @param {String} id The ID of the div (assumed to be formatted already by standard CSS)
 */
function displayMimir(mimir, id="mimirDisplay") {
    // Grab and clean display div
    let displayDiv = document.getElementById(id);
    displayDiv.innerHTML = "";

    /**
     * Displays a vector in the above display div (by adding a layer to the
     * display) and the corresponding Matrix/Bias Vector in a tooltip div.
     * @param {Matrix} vector 
     * @param {Matrix} matrix
     * @param {Matrix} bias
     * @param {String} layerLabel 
     */
    function displayVector(vector, matrix=null, bias=null, layerLabel="NO LABEL") {
        let layerLabelDiv = quickCreate("div", {"class": ["Layer_Label"]});
        
        // Convert vector to array
        let array = vector.toSArray();

        // Append all values to the layer and display it
        let layerDiv = quickCreate("div", {"class": ["Layer"]});
        for (let value of array) {
            let valueDiv = quickCreate("div", {"class": ["Value"]});
            let valueHeader = quickCreate("h2", null, value.toFixed(2));
            
            valueDiv.append(valueHeader);
            layerDiv.append(valueDiv);
        }

        // Append Label and append Layer to Display
        layerLabelDiv.append(layerDiv);

        // A Label has both the name of the layer and a link to show the matrix
        let labelDiv = quickCreate("div", {"style": "display:flex; flex-flow: column nowrap; align-items: center"});
        labelDiv.append(quickCreate("h3", null, layerLabel));
        
        // The "MatrixDiv" handles the tooltip for the corresponding matrix
        if (matrix != null) {
            // Matrix Tooltip
            let matrixDiv = quickCreate("div", {"class": ["tooltip"]});
            matrixDiv.innerHTML = "<a>Show Matrix</a>";
            labelDiv.append(matrixDiv);
            handleMatrixDisplay(matrixDiv, matrix); // Handles the tooltip animation

            // Bias Div
            let biasDiv = quickCreate("div", {"class": ["tooltip"]});
            biasDiv.innerHTML = "<a>Show Bias Vector</a>";
            labelDiv.append(biasDiv);
            handleMatrixDisplay(biasDiv, bias); // Handles the tooltip animation
        }
        
        layerLabelDiv.append(labelDiv);
        displayDiv.append(layerLabelDiv);
    }

    /**
     * Handles the tooltip element to show the matrix for this layer.
     * @param {Element} matrixDiv 
     * @param {Matrix} matrix 
     */
    function handleMatrixDisplay(matrixDiv, matrix) {
        let toolTip = quickCreate("div", {"class": ["tooldiv"]});
        let rightBorder = quickCreate("div", {"class": ["right-matrix-border"]});
        let leftBorder = quickCreate("div", {"class": ["left-matrix-border"]});
        let matrixTable = quickCreate("table");
        
        let matrixArray = matrix.toArray();
        for (let row of matrixArray) {
            let tableRow = quickCreate("tr");
            for (let value of row) {
                tableRow.append(quickCreate("td", null, value.toFixed(2)));
            }
            matrixTable.append(tableRow);
        }
        
        leftBorder.append(matrixTable);
        rightBorder.append(leftBorder);
        toolTip.append(rightBorder);
        matrixDiv.append(toolTip);

        // Add Event Listener to show Matrix Div for the link only
        matrixDiv.getElementsByTagName("a")[0].addEventListener("mouseover", (evt) => {
            toolTip.style.visibility = "visible";
            toolTip.style.opacity = "1";
        });

        // Smart Script, if mouse exited link but is on tooltip, let tooltip remain.
        let overToolTip = false;
        toolTip.addEventListener("mouseover", (evt) => {overToolTip = true});
        toolTip.addEventListener("mouseout", (evt) => {overToolTip = false});

        matrixDiv.getElementsByTagName("a")[0].addEventListener("mouseout", (evt) => {
            function smartTooltip () {
                if (!overToolTip) {
                    toolTip.style.opacity = "0";
                    setTimeout(() => toolTip.style.visibility = "hidden", parseFloat(getComputedStyle(toolTip).transitionDuration) * 1000)
                } else {
                    setTimeout(smartTooltip, 25);
                }
            }
            setTimeout(smartTooltip, 500);
        });
    }

    // Check for if mimir has not been trained yet (mimir == null)
    // TODO

    if (mimir == null) {
        console.log("Attempting to display an uninitialized neural network...");
        return;
    } else if (mimir.layers[0].inputVector == null) {
        console.log("Attempting to display an unused neural network...");
        return;
    }

    for (let i = 0; i < mimir.layers.length; i++) {
        let label = (i == 0) ? "Input Layer" : "Hidden Layer";
        // Map the input vector into divs
        displayVector(mimir.layers[i].inputVector, mimir.layers[i].matrix, mimir.layers[i].bias, label);
        
        // Display the last output vector
        if (i == mimir.layers.length - 1) {
            displayVector(mimir.layers[i].outputVector, null, null, "Output Layer");
        }
    }
}

// Export the displayMimir Function for importing
export default displayMimir;