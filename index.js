var express = require('express');
var app = express();


app.use(express.static('public'));

let server = app.listen(process.env.PORT || 3000, () => {
    console.log("Starting to listen at localhost:" + server.address().port);
});