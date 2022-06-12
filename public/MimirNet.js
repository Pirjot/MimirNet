/**
 * MimirNet a Neural Network created with emphasis on separate layers
 * for construction.
 * 
 * Supports multi-layered Neural Network with the sigmoid function 
 * as an activator (assumes output is in the range 0 - 1).
 * 
 * @author Pirjot Atwal
 */

import Matrix from "./Matrix.js";

function sigmoid(x) {
    return 1 / (1 + Math.exp(-x));
}

function dsigmoid(x) {
    return x * (1 - x);
}

class MimirNet {
    /**
     * Construct a neural network with the given number of inputs, hidden layers
     * and outputs. The user can either specify that all hidden layers have the
     * same amount of hidden nodes or use the alternate constructor to specify the
     * number of hidden nodes per layer.
     * 
     * @param {Number} numOfInputs The number of inputs in the input layer
     * @param {Number} numOfHidden The number of inbetween hidden layers
     * @param {Number} numOfOutputs The number of outputs in the output layer
     * @param {Number} hiddenNodeAmount The amount of nodes (neurons) in each hidden layer
     * @param {Number} learningRate
     */
    static createMimir(numOfInputs, numOfHidden, numOfOutputs, hiddenNodeAmount, learningRate = .5) {
        let hiddenLayout = [];
        for (let i = 0; i < numOfHidden; i++) {
            hiddenLayout.push(hiddenNodeAmount);
        }
        return new MimirNet(numOfInputs, numOfOutputs, hiddenLayout, learningRate);
    }

    /**
     * Construct a neural network, specifying the number of hidden nodes
     * unique to each layer in a number array.
     * @param {Number} numOfInputs The number of inputs in the input layer
     * @param {Number} numOfOutputs The number of outputs in the output layer
     * @param {Number[]} hiddenLayout An array describing the amount of hidden neurons per each hidden layer
     */
    constructor(numOfInputs, numOfOutputs, hiddenLayout=[], learningRate = .5) {
        if (numOfInputs < 1 || numOfOutputs < 1) {
            console.error("There must be atleast one input and atleast one output");
            return;
        }

        this.numOfInputs = numOfInputs;
        this.numOfOutputs = numOfOutputs;
        this.learningRate = learningRate;
        this.layers = [];

        // Create input layer (always this.layers[0])
        if (hiddenLayout.length == 0) {
            this.layers[0] = new Layer(this.numOfInputs, this.numOfOutputs);
        } else {
            this.layers[0] = new Layer(this.numOfInputs, hiddenLayout[0]);
        }

        // Fill in extra layers
        for (let i = 0; i < hiddenLayout.length; i++) {
            if (i == hiddenLayout.length - 1) { // This is the last hidden layer
                this.layers.push(new Layer(hiddenLayout[i], this.numOfOutputs));
            } else {
                this.layers.push(new Layer(hiddenLayout[i], hiddenLayout[i + 1]));
            }
        }
    }

    /**
     * Output an array of outputs from the current state of the neural
     * network using the passed in number array.
     * @param {Number[]} input An inputted amount of values
     */
    output(input) {
        if (input.length != this.numOfInputs) {
            throw "The amount of inputs should match the number required: " + this.numOfInputs;
        }

        // Convert input to a Matrix
        let output = Matrix.fromArray(input.map((x) => [x]));

        // Calculate outputs through all layers and return
        for (let i = 0; i < this.layers.length; i++) {
            output = this.layers[i].output(output);
        }
        return output.toSArray();
    }

    /**
     * Train the neural network given some array of inputs and targets.
     * @param {number[]} input
     * @param {target[]} target
     */
    train(input, target) {
        if (input.length != this.numOfInputs || target.length != this.numOfOutputs) {
            throw "Input and Output Lengths are not correct";
        }

        // Set the inputs and outputs of all layers
        this.output(input);

        // Convert target to a matrix
        target = Matrix.fromArray(target.map((x) => [x]));
        
        // Calculate Error
        let error = Matrix.combine(target, this.layers[this.layers.length - 1].outputVector, (x, y) => x - y);

        // Identity Matrix to start for hidden error calculation
        let nextLayerMatrix = Matrix.identity(this.numOfOutputs);

        for (let i = this.layers.length - 1; i > -1; i--) {
            // Calculate error
            let transposedWeights = Matrix.transpose(nextLayerMatrix);
            error = Matrix.multiply(transposedWeights, error);
            
            // Calculate gradient
            let gradient = Matrix.map(this.layers[i].outputVector, dsigmoid);
            gradient.combine(error, (x, y) => x * y);
            gradient.map((x) => x * this.learningRate);

            // Calculate Deltas
            let transposedInput = Matrix.transpose(this.layers[i].inputVector);
            let weightsDelta = Matrix.multiply(gradient, transposedInput);

            // Adjust weights and bias
            this.layers[i].matrix.combine(weightsDelta, (x, y) => x + y);
            this.layers[i].bias.combine(gradient, (x, y) => x + y);

            // Set next layer matrix as we move back
            nextLayerMatrix = this.layers[i].matrix;
        }
    }

    print() {
        for (let i = 0; i < this.layers.length; i++) {
            console.log("Layer", i, "Matrix and Bias");
            this.layers[i].matrix.print();
            this.layers[i].bias.print();
        }
    }
}

/**
 * A Layer keeps track of some input vector of neurons, a bias vector,
 * and a matrix of weights. The matrix has columns equal to the number 
 * of inputs and rows equal to the number of outputs.
 */
class Layer {
    constructor(numOfInputs, numOfOutputs) {
        this.numOfInputs = numOfInputs;
        this.numOfOutputs = numOfOutputs;
        
        this.inputVector = null;
        this.outputVector = null;
        this.matrix = new Matrix(this.numOfOutputs, this.numOfInputs);
        this.bias = new Matrix(this.numOfOutputs, 1);

        // Randomize weights & bias
        this.matrix.randomize();
        this.bias.randomize();
    }

    /**
     * Returns a vector of outputs from calculating the weighted sum
     * using the matrix of weights and bias vector and finally applying
     * the sigmoid function.
     * @param {Matrix} inputs A input vector that matches this.numOfInputs
     */
    output(inputs) {
        if (inputs.rows != this.numOfInputs || inputs.cols != 1) {
            console.error("The inputted matrix does not match this Layer's requirements!");
            return;
        }
        this.inputVector = inputs;

        // Compute and return
        let result = Matrix.multiply(this.matrix, this.inputVector); // Compute standard output
        result.combine(this.bias, (x, y) => x + y); // Add Bias
        result.map(sigmoid); // Apply Sigmoid
        this.outputVector = result;
        return result;
    }
}


// Export the MimirNet class for importing
export default MimirNet;