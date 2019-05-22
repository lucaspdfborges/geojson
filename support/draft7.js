const mz = require('./pre_flow_od.json');
const ct = require('./mzCentroid.json');
const area = require('./mczona_area.json');
const fs = require('fs');

var tc_total = [];
var tci_total = [];
var ti_total = [];

var tc_ppm = [];
var tci_ppm = [];
var ti_ppm = [];

var finalObj = {};

for(origem in mz){
  for(destino in mz[origem]){

    var dest = mz[origem][destino].destiny;
    console.log(origem);
    console.log(area[origem]);
    var ar = 1;
   //var ar = parseInt(area[origem]) || 1000000000;

    tc_total.push([
      {"origin": origem, "originCoord": ct[origem], "destiny": dest,  "destinyCoord": ct[dest]}, parseInt(mz[origem][destino].TC_total) / ar ]
    );

    tci_total.push([
      {"origin": origem, "originCoord":ct[origem], "destiny": dest,  "destinyCoord": ct[dest]}, parseInt( mz[origem][destino].TCI_total ) / ar ]
    );

    ti_total.push([
      {"origin": origem, "originCoord":ct[origem], "destiny": dest,  "destinyCoord": ct[dest]},  parseInt(mz[origem][destino].TI_total) / ar]
    );

    tc_ppm.push([
      {"origin": origem, "originCoord": ct[origem], "destiny":dest,  "destinyCoord": ct[dest]}, parseInt( mz[origem][destino].TC_PPM ) / ar ]
    );

    tci_ppm.push([
      {"origin": origem, "originCoord": ct[origem], "destiny": dest,  "destinyCoord": ct[dest]},  parseInt(mz[origem][destino].TCI_PPM  )/ar ]
    );

    ti_ppm.push([
      {"origin": origem, "originCoord": ct[origem], "destiny": dest,  "destinyCoord": ct[dest]}, parseInt( mz[origem][destino].TI_PPM )/ ar ]
    );

  }
}

tc_total.sort(function(a, b) {
    return b[1] - a[1];
});

tci_total.sort(function(a, b) {
    return b[1] - a[1];
});

ti_total.sort(function(a, b) {
    return b[1] - a[1];
});

tc_ppm.sort(function(a, b) {
    return b[1] - a[1];
});

tci_ppm.sort(function(a, b) {
    return b[1] - a[1];
});

ti_ppm.sort(function(a, b) {
    return b[1] - a[1];
});

var numValues = 500;

finalObj = {
  "TC_total": tc_total.splice(0,numValues),
  "TCI_total": tci_total.splice(0,numValues),
  "TI_total": ti_total.splice(0,numValues),
  "TC_ppm": tc_ppm.splice(0,numValues),
  "TCI_ppm": tci_ppm.splice(0,numValues),
  "TI_ppm": ti_ppm.splice(0,numValues)
};

console.log(finalObj);

var json = JSON.stringify(finalObj);

fs.writeFile("./flow_od.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
