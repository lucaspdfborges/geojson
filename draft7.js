const mz = require('./pre_flow_od.json');
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

    tc_total.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TC_total]
    );

    tci_total.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TCI_total]
    );

    ti_total.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TI_total]
    );

    tc_ppm.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TC_PPM]
    );

    tci_ppm.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TCI_PPM]
    );

    ti_ppm.push([
      {"origin": origem, "originCoord": mz[origem][0].coordinates, "destiny": mz[origem][destino].destiny,  "destinyCoord": mz[origem][destino].coordinates}, mz[origem][destino].TI_PPM]
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

finalObj = {
  "TC_total": tc_total.splice(0,100),
  "TCI_total": tci_total.splice(0,100),
  "TI_total": ti_total.splice(0,100),
  "TC_ppm": tc_ppm.splice(0,100),
  "TCI_ppm": tci_ppm.splice(0,100),
  "TI_ppm": ti_ppm.splice(0,100)
};

console.log(finalObj);

var json = JSON.stringify(finalObj);

fs.writeFile("./flow_od.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
