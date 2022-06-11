let drawFuncs = [];
let canvas = new p5((p) => {
    p.setup = () => {
        p.createCanvas(500, 500);
        p.background("pink");
        main();
    }
    p.draw = () => {
        for (func of drawFuncs) {
            func();
        }
    }
});

function main() {
    // Setup display for canvas
    let displaySpan = canvas.createSpan("");
    displaySpan.position(40, canvas.height - 100);

    // let inputs = [-5, 2];
    let brain = new Perceptron();
    // let output = brain.guess(inputs);
    // displaySpan.html(output);

    // Create line
    canvas.line(0, 0, canvas.width, canvas.height);

    // Points example
    let pointCount = 100;
    let points = [];
    for (let i = 0; i < pointCount; i++) {
        points.push(new Point());
        points[i].show();
    }

    let index = 0;
    canvas.mousePressed = () => {
        // brain.train([points[index].x, points[index].y], points[index].label);
        // index++;
        if (index >= points.length) {
            index = 0;
        }
        for (let point of points) {
            brain.train([point.x, point.y], point.label);
            canvas.stroke(0);
            if (brain.guess([point.x, point.y]) == point.label) {
                canvas.fill(0, 255, 0);
            } else {
                canvas.fill(255, 0, 0);
            }
            canvas.noStroke();
            canvas.ellipse(point.x, point.y, 8, 8);
        }
        console.log(Perceptron.weights);
    }

}



// Perceptron Class
class Perceptron {
    // Every Perceptron share the same weights
    static weights = [0, 0];
    static learning_rate = .001;
    
    constructor() {
        // Initialize weights to random values in the range -1, 1
        for (let i = 0; i < Perceptron.weights.length; i++) {
            Perceptron.weights[i] = Math.random() * (Math.random() > .5 ? 1 : -1);
        }
    }

    /**
     * Compute Guess
     * @param {Number[]} inputs 
     * @returns Conformed sum (the sign of the sum)
     */
    guess(inputs) {
        let sum = 0;
        for (let i = 0; i < Perceptron.weights.length; i++) {
            sum += Perceptron.weights[i] * inputs[i];
        }
        // Return the sign of the sum (The Activator Function)
        return (sum >= 0) ? 1 : -1;
    }

    train(inputs, target) {
        let guess = this.guess(inputs);
        let error = target - guess;
        // Tune the weights
        for (let i = 0; i < Perceptron.weights.length; i++) {
            Perceptron.weights[i] += error * inputs[i] * Perceptron.learning_rate; // Tuning algorithm
        }
    }
}


class Point {
    constructor() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.label = this.x > this.y ? 1 : -1;
    }

    show() {
        canvas.stroke(0);
        if (this.label == 1) {
            canvas.fill(255);
        } else {
            canvas.fill(0);
        }
        canvas.ellipse(this.x, this.y, 16, 16);
    }
}