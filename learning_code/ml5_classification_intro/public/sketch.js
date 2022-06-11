let modelReady = false;
function main() {
    setupUserInput();
}

let mobilenet = ml5.imageClassifier('MobileNet', () => {
    modelReady = true;
});

// let draw = () => console.log("DRAWING");
let canvas = new p5((p) => {
    p.setup = () => {
        p.createCanvas(500, 500);
        p.background("gray");
        main();
    }
    // p.draw = () => {};
});


function setupUserInput() {
    let input = document.getElementById("fileinput");
    input.addEventListener("change", (evt) => {
        let reader = new FileReader();
        reader.addEventListener("load", (evt) => {
            img = canvas.createImg(reader.result, () => {
                canvas.image(img, 0, 0, canvas.width, canvas.height);
            });
            displayClassification(img);
            img.hide();
        });
        reader.readAsDataURL(input.files[0]);
    });
}


function displayClassification(img) {
    if (modelReady) {
        // Create prediction, takes a DOM Image and returns results through callback
        mobilenet.predict(img, (err, res) => {
            console.log(res);
            document.getElementById("classification").innerHTML = "";
            for (result of res) {
                let newP = document.createElement("p");
                newP.textContent = result.label + ", confidence: " + result.confidence;
                document.getElementById("classification").append(newP);
            }
        });
    } else {
        alert("The Model is not ready yet, please try again.");
    }
}

// let pelican; // DOM image instance

// // ml5 Scripts
// let mobilenet = ml5.imageClassifier('MobileNet', () => {
//     console.log("Model is ready");
//     // Create prediction, takes a DOM Image and returns results through callback
//     mobilenet.predict(pelican, (err, res) => {
//         console.log(res);
//     });
// });


// // p5 Scripts
// function setup() {
//     console.log("Setting up your canvas...");
    
//     // Create the DOM element, once done importing, draw into current canvas
//     pelican = createImg('pelican.jpg', () => {
//         image(pelican, 0, 0, width, height);
//     });

//     createCanvas(640, 480);
//     background("gray");
//     pelican.hide(); // Hide the version of the image that is on the page
// }