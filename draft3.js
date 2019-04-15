const mz = require('./mz_coord_max.json');
const mzCoord = require('./mzCentroid.json');

const fs = require('fs');

let finalArray = {};

for(origin in mz){


  var newArray = [];

  var mainObj = mz[origin];

  var maxObj = {
    "destiny":"self",
    "TC_total_max":mainObj.TC_total_max,
    "TI_total_max":mainObj.TI_total_max,
    "TC_PPM_max":mainObj.TC_PPM_max,
    "TI_PPM_max":mainObj.TI_PPM_max,
    "coordinates": mzCoord.coordinates
  }

  newArray.push(maxObj);

  for(destiny in mainObj ){

    var obj = mainObj[destiny];

    var newObj = {
      "destiny":destiny,
      "TC_total":obj.TC_total,
      "TI_total":obj.TI_total,
      "TC_PPM":obj.TC_PPM,
      "TI_PPM":obj.TI_PPM,
      "coordinates":mzCoord[destiny]
    }

    if(parseInt(destiny)>0){
      newArray.push(newObj);
    }

  }

  finalArray[origin]=newArray;
}

var json = JSON.stringify(finalArray);


fs.writeFile("./macrozona_array.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
