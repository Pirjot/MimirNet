/**
 * An original idea to test neural networks, Palindromes!
 * 
 * I want to see how well a neural network can classify words
 * as palindromes (and then possibly repeat this idea on Tensorflow when I learn it.)
 */

import MimirNet from "./MimirNet.js";

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

function prepareWordList(amount = 1000) {
    let chance = .3; // Chance a palindrome is added to the list
    let maxLength = 2; // Max Length of words

    function genWord(length) {
        let word = '';
        let alpha = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        for (let i = 0; i < length; i++) {
            word += alpha.charAt(Math.floor(Math.random() * alpha.length));
        }
        return word;
    }

    let result = [];
    for (let i = 0; i < amount; i++) {
        // let word = genWord(Math.ceil(Math.random() * maxLength));
        let word = genWord(maxLength);
        if (Math.random() < chance) {
            word += word.split("").reverse().join("");
            result.push([word, 1])
        } else {
            word = genWord(maxLength * 2);
            result.push([word, 0]);
        }
    }
    return result;
}

async function readyPalindrome() {
    console.log("Palindrome!");

    let data = prepareWordList();
    
    // Convert the data into ASCII
    for (let i = 0; i < data.length; i++) {
        let converted = [];
        let word = data[i][0];
        for (let j = 0; j < word.length; j++) {
            converted.push(word.charCodeAt(j));
        }
        data[i] = [converted, data[i][1]];
    }    

    let mimir = new MimirNet(4, 1, [10, 10, 10, 10, 10], .1);

    for (let i = 0; i < 100; i++) {
        shuffleArray(data);
        for (let point of data) {
            console.log(point[0], point[1]);
            mimir.train(point[0], [point[1]]);
        }
    }
    console.log("READY");
    self.pal = mimir;
}


export default readyPalindrome;