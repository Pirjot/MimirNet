/**
 * A Matrix library for simple Neural Network work.
 * 
 * Reference:
 * Daniel Shiffman's matrix library for his Neural Network series.
 * 
 * @author Pirjot Atwal
 */

class Matrix {
    /**
     * Construct a matrix of zeroes with the given dimensions.
     * @param {*} rows 
     * @param {*} cols 
     */
    constructor(rows, cols) {
        this.rows = rows;
        this.cols = cols;
        this.data = [];

        // Initialize the matrix with zeroes
        for (let i = 0; i < this.rows; i++) {
            this.data.push([]);
            for (let j = 0; j < this.cols; j++) {
                this.data[i].push(0);
            }
        }
    }

    /**
     * Map a function to all values and set them to their corresponding values
     * @param {Function} func A function that takes one number and returns a number
     */
    map(func) {
        let newMatrix = Matrix.map(this, func);
        this.data = newMatrix.data;
    }

    /**
     * A static function that returns a new matrix where the values are equal to 
     * the function applied to each value in the passed matrix.
     * @param {Matrix} matrix 
     * @param {Function} func A function that takes one number and returns a number
     * @returns 
     */
    static map(matrix, func) {
        let result = new Matrix(matrix.rows, matrix.cols);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[i][j] = func(matrix.data[i][j]);
            }
        }
        return result;
    }

    /**
    * Sets all elements in this matrix to random float numbers between -1 and 1.
    */
    randomize() {
        this.map((x) => Math.random() * 2 - 1);
    }

    /**
     * Performs a element wise combination between this matrix and the one
     * passed in using the passed function.
     * @param {Matrix} other A matrix with the same dimensions as this one.
     * @param {Function} fn A function that takes two numbers and returns a single number
     */
    combine(other, fn) {
        let newMatrix = Matrix.combine(this, other, fn);
        this.data = newMatrix.data;
    }

    /**
     * Performs a element wise combination between the given matrices
     * passed in using the passed function.
     * @param {Matrix} matrixA
     * @param {Matrix} matrixB
     * @param {Function} fn A function that takes two numbers and returns a single number
     */
    static combine(matrixA, matrixB, fn) {
        if (matrixA.rows != matrixB.rows || matrixA.cols != matrixB.cols) {
            console.error("The matrix dimensions do not match!");
            return;
        }
        let result = new Matrix(matrixA.rows, matrixA.cols);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                result.data[i][j] = fn(matrixA.data[i][j], matrixB.data[i][j]);
            }
        }
        return result;
    }

    /**
     * Transposes this matrix (sets this.rows <> this.cols).
     */
    transpose() {
        let newMatrix = Matrix.transpose(this);
        this.rows = newMatrix.rows;
        this.cols = newMatrix.cols;
        this.data = newMatrix.data;
    }

    /**
     * Produces the transposed version of the passed matrix.
     * @param {Matrix} matrix 
     */
    static transpose(matrix) {
        let result = new Matrix(matrix.cols, matrix.rows);
        for (let i = 0; i < matrix.rows; i++) {
            for (let j = 0; j < matrix.cols; j++) {
                result.data[j][i] = matrix.data[i][j];
            }
        }
        return result;
    }
    
    /**
     * Performs matrixA times matrixB in that order using matrix
     * multiplication. The # of columns in matrix A must equal
     * the # of rows in matrix B.
     * @param {Matrix} matrixA 
     * @param {Matrix} matrixB 
     */
    static multiply(matrixA, matrixB) {
        if (matrixA.cols != matrixB.rows) {
            console.error("The matrix dimensions are not correct for multiplication!");
            return;
        }
        let result = new Matrix(matrixA.rows, matrixB.cols);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                let sum = 0;
                for (let k = 0; k < matrixA.cols; k++) {
                    sum += matrixA.data[i][k] * matrixB.data[k][j];
                }
                result.data[i][j] = sum;
            }
        }
        return result;
    }

    /**
     * Print the contents of this matrix to the console.
     */
    print() {
        console.table(this.data);
    }

    /**
     * Build a matrix from the given contents.
     * 
     * Format:
     * [[1, 2], [5, 2], [-2, -3]] = A 3 x 2 (3 rows, 2 columns) matrix.
     * 
     * @param {Number[][]} contents 
     */
    static fromArray(contents) {
        if (contents.length == 0) {
            return new Matrix(0, 0);
        }
        for (let row of contents) {
            if (row.length != contents[0].length) {
                console.error("Every row in the array needs to have the same # of columns!");
                return new Matrix(0, 0);
            }
        }
        let result = new Matrix(contents.length, contents[0].length);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                result.data[i][j] = contents[i][j];
            }
        }
        return result;
    }

    /**
     * Return this matrix as a single dimension array (useful for vectors or single
     * row matrices).
     */
    toSArray() {
        let result = [];
        for (let i = 0; i < this.rows; i++) {
            for (let j = 0; j < this.cols; j++) {
                result.push(this.data[i][j]);
            }
        }
        return result;
    }

    /**
     * Return the matrix in its two dimensional form.
     */
    toArray() {
        return this.data;
    }

    /**
     * Generate the identity matrix for a given
     * row/col size.
     */
    static identity(size) {
        let result = new Matrix(size, size);
        for (let i = 0; i < result.rows; i++) {
            for (let j = 0; j < result.cols; j++) {
                if (i == j) {
                    result.data[i][j] = 1;
                }
            }
        }
        return result;
    }
}

// Export the Matrix class for importing
export default Matrix;