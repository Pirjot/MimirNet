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
        this.buttonSlate.append(this.createLineButton, this.cancelLine);
        this.setButtons();

        // Create Line Variables
        this.firstPoint = null;
        this.secondPoint = null;
        this.equation = null;

        // The Mode Decides what the next user interaction does
        this.mode = "Standby";
        this.canvasDisplay.append(this.coordinates, this.buttonSlate);
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

        // True Mouse Coordinates
        this.mouseCoords = this.mapToAxis(canvas.mouseX, canvas.mouseY);

        Object.values(this.drawFuncs).map((func) => func != null ? func() : 0);
        
        this.updateDisplay();
    }

    updateDisplay() {
        this.coordinates.textContent = "Mouse Coordinates: " + this.mouseCoords[0] + ", " + this.mouseCoords[1];
    }

    setButtons() {
        this.createLineButton.addEventListener("click", (evt) => {
            this.cancelLine.click();
            this.mode = "Line Drawing First";
            this.createLineButton.style.background = "green";
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
            this.createLineButton.style.background = "";
        });
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
        
        if (this.inCanvas() && this.mode == "Line Drawing Second") {
            this.drawFuncs["First Point Draw"] = null;
            this.secondPoint = [this.canvas.mouseX, this.canvas.mouseY];
            
            let firstMapped = this.mapToAxis(this.firstPoint[0], this.firstPoint[1]);
            let secondMapped = this.mapToAxis(this.secondPoint[0], this.secondPoint[1]);
            let slope = (secondMapped[1] - firstMapped[1]) / (secondMapped[0] - firstMapped[0]);
            this.equation = (x) => slope * (x - firstMapped[0]) + firstMapped[1];

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
    let canvasHandler = new CanvasHandler("example1");
}


function readySketch() {
    readyExample1();
}

export default readySketch;