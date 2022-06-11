/**
 * Making a neural network from scratch.
 * Based off of Chapter 10 of Daniel Shiffman's Coding Train videos.
 * 
 */


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

let training_data = [
    {
        inputs: [0, 0],
        targets: [0]
    },
    {
        inputs: [0, 1],
        targets: [1]
    },
    {
        inputs: [1, 0],
        targets: [1]
    },
    {
        inputs: [1, 1],
        targets: [0]
    },
];

function main() {
    // Initialize a Neural Network
    let brain = new NeuralNetwork(2, 2, 1);

    for (let i = 0; i < 100000; i++) {
        let data = canvas.random(training_data)
        brain.train(data.inputs, data.targets);
        
        // 
        // 
    }

    console.log(brain.feedforward([0, 0]));
    console.log(brain.feedforward([0, 1]));
    console.log(brain.feedforward([1, 0]));
    console.log(brain.feedforward([1, 1]));


    // let input = [1, 0];
    // let target = [3];

    // let output = brain.feedforward(input);
    // brain.train(input, target);
    // console.log(output);
}


