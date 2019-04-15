const mz = require('./mz_coord_max.json');
const fs = require('fs');

let finalArray = [];

for(origin in mz){


  var newArray = [];

  var mainObj = mz[origin];

  var maxObj = {
    "destiny":"max",
    "TC_total":mainObj.TC_total_max,
    "TI_total":mainObj.TI_total_max,
    "TC_PPM":mainObj.TC_PPM_max,
    "TI_PPM":mainObj.TI_PPM_max
  }

  newArray.push(maxObj);

  for(destiny in mainObj ){

    console.log(destiny);
    var obj = mainObj[destiny];
    console.log(obj);

    var newObj = {
      "destiny":destiny,
      "TC_total":obj.TC_total,
      "TI_total":obj.TI_total,
      "TC_PPM":obj.TC_PPM,
      "TI_PPM":obj.TI_PPM
    }

    newArray.push(newObj);
  }

  var finalObj ={
    "origin":origin,
    "info":newArray
  };


  finalArray.push(finalObj);
}

var json = JSON.stringify(finalArray);


fs.writeFile("./mz_array.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
