const mz = require('./mz_array_do.json');
const fs = require('fs');

const finalObj = {};

for(origem in mz){

  var newArray = [];
  console.log(origem);

  for(destino in mz[origem]){

    var obj = {
                "origin": mz[origem][destino].destiny,
                "TC_total": mz[origem][destino].TC_total,
                "TI_total": mz[origem][destino].TI_total,
                "TCI_total": mz[origem][destino].TC_total+mz[origem][destino].TI_total,
                "TC_PPM": mz[origem][destino].TC_PPM,
                "TI_PPM": mz[origem][destino].TI_PPM,
                "TCI_PPM": mz[origem][destino].TC_PPM + mz[origem][destino].TI_PPM,
                "coordinates": mz[origem][destino].coordinates
              };

    if(mz[origem][destino].destiny != 'self'){
      newArray.push(obj);
    }
  }

  finalObj[origem] = newArray;

}



/*
var json = JSON.stringify(finalObj);

fs.writeFile("./pre_flow_do.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
*/
