/**
 * main.js is the main driver that sets up and utilizes
 * user input on the page.
 * 
 * @author Pirjot Atwal
 */

import MimirNet from "./MimirNet.js";
import displayMimir from "./displayMimir.js";
import readySketch from "./sketch.js";

let mimir = null;

// HELPER FUNCTIONS
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
 * TODO
 */
function readyCollapsibles() {
    for (let collapsible of document.getElementsByClassName("collapsible")) {
        collapsible.addEventListener("click", (evt) => {
            collapsible.classList.toggle("active");
            let styleOfContent = collapsible.nextElementSibling.style;
            styleOfContent.display == "block" ? styleOfContent.display = "none" : styleOfContent.display = "block";
        });
    }
}

/**
 * TODO
 */
function prepareInputs() {
    // Helper Function
    let getVal = (id) => Number(document.getElementById(id).value);
    
    // Configuration Submit Setup
    let submit = document.getElementById("configurationSubmit");
    submit.addEventListener("click", (evt) => {
        // IDs for Config Setup (change upon page update)
        let inputNodes = getVal("inputInput");
        let hiddenLayerCount = getVal("hiddenLayerInput");
        let hiddenLayerChoice = getVal("hiddenChoice");
        let hiddenNodes = getVal("hiddenInput");
        let outputNodes = getVal("outputInput");

        // Get values from table
        let table = document.getElementById("hiddenTable");
        let hiddenValues = [];
        if (hiddenLayerChoice == 2) { // If table is active
            for (let input of table.getElementsByTagName("input")) {
                hiddenValues.push(Number(input.value));
            }
        }
        setupMimir(inputNodes, hiddenLayerCount, hiddenLayerChoice, hiddenValues, hiddenNodes, outputNodes);
    });

    // Configuration Hidden Layer Choice Setup
    let select = document.getElementById("hiddenChoice");
    let hiddenInputDiv = document.getElementById("hiddenInputDiv");
    let hiddenTableDiv = document.getElementById("hiddenTableDiv");
    select.onchange = (evt) => {
        if (select.value == 1) { // Display field only
            hiddenInputDiv.style.display = "block";
            hiddenTableDiv.style.display = "none";
        } else { // Ready and Display Table
            // Ready Table
            let hiddenTable = document.getElementById("hiddenTable");
            hiddenTable.innerHTML = "";
            let hiddenLayerCount = getVal("hiddenLayerInput");
            
            // Check Bounds
            if (hiddenLayerCount < 1 || hiddenLayerCount > 20) {
                alert("You can't input a layer count out of the bounds!\nMake sure you have atleast 1 hidden layer count above to select this option.");
                select.value = 1;
                select.onchange();
                return;
            }

            for (let i = 0; i < hiddenLayerCount; i++) {
                if (i % 3 == 0) {
                    hiddenTable.append(quickCreate("tr"));
                }
                let tr = hiddenTable.children[Math.floor(i / 3)];
                let td = quickCreate("td");
                let label = quickCreate("label", null, "Hidden Layer " + (i + 1) + ": ");
                let input = quickCreate("input", {"min": 1, "max": 20, "value": 1, "type": "number"});
                td.append(label, input);
                tr.append(td);
            }
            
            // Display Table
            hiddenInputDiv.style.display = "none";
            hiddenTableDiv.style.display = "block";
        }
    };
    // Phony event for hidden layer count change
    document.getElementById("hiddenLayerInput").addEventListener("change", (evt) => select.onchange());

    // Training Setup
    document.getElementById("trainSubmit").addEventListener("click", (evt) => {
        if (mimir == null) {
            alert("Please Initialize your Neural Network First!");
            return;
        }
        let textarea = document.getElementById("trainingData");
        let training_data = null;
        try {
            training_data = JSON.parse("[" + textarea.value + "]");
            if (training_data.length == 0) {
                throw "Training Data is of 0 length";
            }
            for (let data of training_data) {
                if (data.length != 2) {
                    throw "Data Length is not correct.";
                }
                if (typeof data[0] != "object" || typeof data[1] != "object") {
                    throw "Data is not of correct type";
                }
                if (data[0].length != mimir.numOfInputs || data[1].length != mimir.numOfOutputs) {
                    throw "Data Input Output Length is incorrect";
                }
                function throwErr(x) {
                    if (typeof x != "number") {
                        throw "Data in Array is not of correct type";
                    }
                }
                data[0].map(throwErr);
                data[1].map(throwErr);
            }
        } catch (e) {
            alert("There was a problem with your inputted training data.\nMake sure you follow the format and provide atleast one data point.\nAlso, make sure the number of inputs and outputs for each data point are correct.");
            console.error(e);
            return;
        }

        let trainingType = document.getElementById("trainingChoice").value;
        let trainingAmount = document.getElementById("trainingInput").value;

        trainMimir(training_data, Number(trainingType), Number(trainingAmount));
    });

    // Output
    document.getElementById("inputButton").addEventListener("click", (evt) => {
        let inputs = [];
        for (let input of document.getElementById("outputTable").getElementsByTagName("input")) {
            inputs.push(Number(input.value) || 0);
        }
        if (mimir == null) {
            alert("Your Neural Network is not initialized yet!");
        } else {
            mimir.output(inputs);
            displayMimir(mimir);
        }
    });

}

/**
 * Performs checks on all inputs to ensure validity and sets
 * the global mimir variable accordingly. Sets up the output menu.
 * @param {*} inputNodes 
 * @param {*} hiddenLayerCount 
 * @param {*} hiddenLayerChoice 
 * @param {*} hiddenValues 
 * @param {*} hiddenNodes 
 * @param {*} outputNodes 
 */
function setupMimir(inputNodes, hiddenLayerCount, hiddenLayerChoice, hiddenValues, hiddenNodes, outputNodes) {
    if (hiddenLayerChoice == 1) { 
        mimir = MimirNet.createMimir(inputNodes, hiddenLayerCount, outputNodes, hiddenNodes);
    } else {
        mimir = new MimirNet(inputNodes, outputNodes, hiddenValues);
    }

    // Set the output menu
    let table = document.getElementById("outputTable");
    table.innerHTML = "<tr><td>Input Count</td><td>Value</td></tr>";
    for (let i = 0; i < mimir.numOfInputs; i++) {
        let tr = quickCreate("tr");
        let title = quickCreate("td", null, "Input " + (i + 1));
        let td = quickCreate("td");
        let input = quickCreate("input", {"type": "number", value: "0"});
        
        td.append(input);
        tr.append(title, td);
        table.append(tr);
    }
    displayMimir(mimir);
}

let trainingIndex = 0;
/**
 * 
 * @param {*} training_data 
 * @param {*} trainingType 
 * @param {*} trainingAmount 
 */
function trainMimir(training_data, trainingType, trainingAmount) {
    // TODO RANDOMIZE COUNT (CHANGE ON PAGE MESSAGE TO NOTE THIS)
    if (trainingType == 1) { // Train All Data
        for (let i = 0; i < trainingAmount; i++) {
            for (let data of training_data) {
                // TODO ERROR CATCHING
                mimir.train(data[0], data[1]);
                trainingIndex++;
            }
        }
    } else { // Train one at a time
        document.getElementById("trainingDisplay").value = trainingIndex;
        // TODO ERROR CATCHING
        mimir.train(training_data[trainingIndex % training_data.length][0], training_data[trainingIndex % training_data.length][1]);
        trainingIndex++;
    }
    // Display the trainingIndex
    document.getElementById("trainingDisplay").value = trainingIndex;

    displayMimir(mimir);
}

// DOM scripts
document.addEventListener("DOMContentLoaded", (evt) => {
    // Collapsible Script
    readyCollapsibles();
    // Prepare Inputs
    prepareInputs();
    // Ready p5 sketches
    readySketch();

    console.log("Ready to Go!");
});

// Set displayMimir accessible to all other scripts
self.displayMimir = displayMimir;