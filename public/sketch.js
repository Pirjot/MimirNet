/**
 * Main Driver for all Sketch Canvas Related Items
 */

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

import displayMimir from "./displayMimir.js";
import MimirNet from "./MimirNet.js";


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
 * Shuffle an Object Array.
 * @param {*} array 
 * @returns 
 */
function shuffleArray(array) {
    let currentIndex = array.length,  randomIndex;
    // While there remain elements to shuffle.
    while (currentIndex != 0) {
      // Pick a remaining element.
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [
        array[randomIndex], array[currentIndex]];
    }
    return array;
}

class CanvasHandler {
    /**
     * The provided ID should be of a div that will hold the canvas and 
     * Canvas Display side by side in a flex display. This constructor
     * will create both and append them, the styling will be handled
     * by CSS.
     * @param {String} mainID 
     */
    constructor(mainID) {
        this.mainID = mainID;
        this.canvas = new p5((canvas) => {
            canvas.setup = () => this.setup(canvas);
            canvas.draw = () => this.draw(canvas);
        }, mainID);
        this.mimir = null;

        /**
         * A map of draw funcs to draw every frame.
         * 
         * Draw Func List:
         * 1. "First Point Draw" should draw a line from first point to mouseX mouseY.
         * 
         * 
         * Other: Draw Lines
         */
        this.drawFuncs = {};
        
        this.canvasDisplay = quickCreate("div", {"class": ["canvasDisplay"]});
        this.coordinates = quickCreate("p", null, "COORDINATES");
        
        this.buttonSlate = quickCreate("div", {"style": "display: flex; flex-flow: row wrap;"});
        this.createLineButton = quickCreate("button", null, "Create Line");
        this.cancelLine = quickCreate("button", null, "Cancel & Clear Line");
        this.createPoint = quickCreate("button", null, "Enter Point Creation Mode");
        this.exitPoint = quickCreate("button", null, "Exit Point Creation Mode");
        this.buttonSlate.append(this.createLineButton, this.cancelLine, this.createPoint, this.exitPoint);
        
        // Create Line Variables
        this.firstPoint = null;
        this.secondPoint = null;
        this.equation = null;

        // Create Point Variables
        this.points = [];

        // The Mode Decides what the next user interaction does
        this.mode = "Standby";

        // Neural Network Buttons
        this.equationP = quickCreate("p", null, "The Line Equation is displayed here.");
        this.setupButton = quickCreate("button", null, "Quick Setup");
        this.trainButton = quickCreate("button", null, "Train");
        this.quickTrainButton = quickCreate("button", null, "Quick Train");
        this.setButtons();

        this.canvasDisplay.append(quickCreate("h3", null, "Draw Button"),
                                  this.buttonSlate, 
                                  this.coordinates,
                                  quickCreate("hr"),
                                  quickCreate("h3", null, "Neural Network Buttons"),
                                  this.equationP,
                                  this.setupButton,
                                  this.trainButton,
                                  this.quickTrainButton);
    }

    setup(canvas) {
        // Setup Canvas and Canvas Display Divs
        canvas.createCanvas(500, 500);
        document.getElementById(this.mainID).append(this.canvasDisplay);

        // Setup Canvas Event Functions
        canvas.mousePressed = () => this.mousePressed();
    }

    draw(canvas) {
        canvas.background("pink");
        canvas.ellipse(canvas.mouseX, canvas.mouseY, 5);

        // Draw X Y Axis
        canvas.push();
        canvas.stroke(0);
        canvas.strokeWeight(5);
        canvas.line(canvas.width / 2, 0, canvas.width / 2, canvas.height);
        canvas.line(0, canvas.height / 2, canvas.width, canvas.height / 2);
        canvas.pop();

        // Draw all Points
        for (let point of this.points) {
            canvas.ellipse(point[0], point[1], 10);
        }

        // Draw Funcs (needs to happen after draw points for color in neural network training)
        Object.values(this.drawFuncs).map((func) => func != null ? func() : 0);

        // Update External Display (Coorinates etc,)
        this.updateDisplay();
    }

    updateDisplay() {
        // True Mouse Coordinates
        this.mouseCoords = this.mapToAxis(this.canvas.mouseX, this.canvas.mouseY);
        this.coordinates.textContent = "Mouse Coordinates: " + this.mouseCoords[0] + ", " + this.mouseCoords[1];
    }

    setButtons() {
        this.createLineButton.addEventListener("click", (evt) => {
            this.cancelLine.click();
            this.mode = "Line Drawing First";
            this.setButtonBackgrounds(this.createLineButton);
        });
        this.cancelLine.addEventListener("click", (evt) => {
            // Reset Draw state
            this.mode = "Standby";

            // Reset Draw Funcs
            this.drawFuncs["First Point Draw"] = null;
            this.drawFuncs["Draw Line"] = null;
            this.firstPoint = null;
            this.secondPoint = null;
            this.equation = null;
            this.setButtonBackgrounds();
        });
        this.createPoint.addEventListener("click", (evt) => {
            // Enter Point Creation Mode
            this.mode = "Create Point";
            this.setButtonBackgrounds(this.createPoint);
        });
        this.exitPoint.addEventListener("click", (evt) => {
            // Exit the Point Creation Mode
            this.mode = "Standby";
            this.setButtonBackgrounds();
        });
        this.setupButton.addEventListener("click", (evt) => {
            this.mimir = new MimirNet(2, 1, []);
            alert("Your Neural Network has been set to use 2 input nodes, 1 output node, and 0 hidden layers!");
        });
        let success = false;
        this.trainButton.addEventListener("click", (evt) => {
            success = false;
            if (this.mimir == null || this.mimir.numOfInputs != 2 || this.mimir.numOfOutputs != 1) {
                alert("Either your neural network is not initialized or has not been set to accept 2 input nodes and 1 output node.");
                return;
            }
            if (this.equation == null) {
                alert("Please draw a line first!");
                return;
            }
            if (this.points.length == 0) {
                alert("Please draw at least one point first!");
                return;
            }

            success = true;
            // First, ensure that all points know their correct label
            for (let i = 0; i < this.points.length; i++) {
                let mappedPoint = this.mapToAxis(this.points[i][0], this.points[i][1]);
                let computedY = this.equation(mappedPoint[0]);

                if (mappedPoint[1] >= computedY) { // The point is above/on the line, label = 1
                    this.points[i][2] = 1;
                } else { // Else label = 0
                    this.points[i][2] = 0;
                }
            }

            shuffleArray(this.points);
            // Manually Train Mimir one point at a time and output the correct results to the graph using drawFuncs
            for (let point of this.points) {
                let mappedPoint = this.mapToAxis(point[0], point[1]);
                this.mimir.train(mappedPoint.slice(0, 2), [point[2]]);
            }
            // console.log("TRAINING: ", mappedPoint, randPoint[2], Math.round(this.mimir.output(mappedPoint.slice(0, 2))[0]));

            // Output
            this.drawFuncs["Mimir Results"] = () => {
                if (this.equation == null) {
                    return;
                }
                for (let point of this.points) {
                    let correctLabel = point[2];
                    let mappedPoint = this.mapToAxis(point[0], point[1]);
                    let computedLabel = Math.round(this.mimir.output(mappedPoint));
                    
                    this.canvas.push();
                    if (correctLabel == computedLabel) { // Correct Guess
                        this.canvas.fill(0, 255, 0); // RGB
                    } else { // Bad Guess
                        this.canvas.fill(255, 0, 0); // RGB
                    }
                    this.canvas.noStroke();
                    this.canvas.ellipse(point[0], point[1], 5);
                    this.canvas.pop();
                }
            }
            displayMimir(this.mimir);
        });
        this.quickTrainButton.addEventListener("click", (evt) => {
            this.trainButton.click();
            for (let j = 0; j < 1000; j++) {
                if (success != false) {
                    shuffleArray(this.points);
                    this.trainButton.click();
                }
            }
        });

    }

    /**
     * Iterates through this.buttonSlate and sets the single
     * requested button's background accordingly and all others
     * to their default. If the button passed is null, all button
     * backgrounds are reset.
     * @param {HTMLElement} setMe The button whose background should be set
     * @param {String} color 
     */
    setButtonBackgrounds(setMe=null, color="green") {
        for(let button of this.buttonSlate.children) {
            if (button == setMe) {
                button.style.background = color;
            } else {
                button.style.background = "";
            }
        }
    }

    inCanvas() {
        return this.canvas.mouseX < this.canvas.width && this.canvas.mouseX > 0 && 
        this.canvas.mouseY < this.canvas.height && this.canvas.mouseY > 0;
    }

    mapToAxis(X, Y) {
        let canvas = this.canvas;
        return [canvas.map(X, 0, canvas.width, -canvas.width / 2, canvas.width/2), 
        canvas.map(Y, 0, canvas.height, canvas.height/2, -canvas.height / 2)];
    }
    
    mousePressed() {
        // If drawing first point of line.
        if (this.inCanvas() && this.mode == "Line Drawing First") {
            // Set First Point
            this.firstPoint = [this.canvas.mouseX, this.canvas.mouseY];
            this.drawFuncs["First Point Draw"] = () => {
                this.canvas.ellipse(this.firstPoint[0], this.firstPoint[1], 5);
                this.canvas.push();
                this.canvas.stroke(0);
                this.canvas.strokeWeight(5);
                this.canvas.line(this.firstPoint[0], this.firstPoint[1], this.canvas.mouseX, this.canvas.mouseY);
                this.canvas.pop();
            }
            this.mode = "Line Drawing Second";
            return;
        }
        
        // If drawing second point of line
        if (this.inCanvas() && this.mode == "Line Drawing Second") {
            this.drawFuncs["First Point Draw"] = null;
            this.secondPoint = [this.canvas.mouseX, this.canvas.mouseY];
            
            let firstMapped = this.mapToAxis(this.firstPoint[0], this.firstPoint[1]);
            let secondMapped = this.mapToAxis(this.secondPoint[0], this.secondPoint[1]);
            let slope = (secondMapped[1] - firstMapped[1]) / (secondMapped[0] - firstMapped[0]);
            this.equation = (x) => slope * (x - firstMapped[0]) + firstMapped[1];
            this.stringEquation = "f(x) = " + slope + " * " + "(x - " + firstMapped[0] + ") + " + firstMapped[1];
            this.equationP.textContent = "Equation: " + this.stringEquation;

            this.drawFuncs["Draw Line"] = () => {
                this.canvas.push();
                this.canvas.stroke(0);
                this.canvas.strokeWeight(5);
                // Using the equation, extend the line to fit the bounds
                this.canvas.line(0,  this.canvas.height / 2 - this.equation(this.canvas.width / -2), 
                this.canvas.width,  this.canvas.height / 2 - this.equation(this.canvas.width / 2));
                this.canvas.pop();
            }
            this.mode = "Standby";
            this.createLineButton.style.background = "";
        }

        // If adding a point to the screen
        if (this.inCanvas() && this.mode == "Create Point") {
            // Drawing handled by root draw function
            this.points.push([this.canvas.mouseX, this.canvas.mouseY]);
        }
    }
}


/**
 * Example 1: A Linearly Separable Example
 * 
 * In this example, the user is provided a canvas with an axis.
 * They have buttons which allow them to draw either a point or
 * a line.
 * 
 * Points above the line are labeled 1, points below are labeled 0.
 * 
 * Externally, they have a button which sets up the neural network
 * for them.
 * 
 */
function readyExample1() {
    self.canvasHandler = new CanvasHandler("example1");
}


function readySketch() {
    readyExample1();
}

export default readySketch;

