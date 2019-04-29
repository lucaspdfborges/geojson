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
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TC_total]
    );

    tci_total.push([
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TCI_total]
    );

    ti_total.push([
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TI_total]
    );

    tc_ppm.push([
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TC_PPM]
    );

    tci_ppm.push([
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TCI_PPM]
    );

    ti_ppm.push([
      {"origin": origem, "destiny": mz[origem][destino].destiny}, mz[origem][destino].TI_PPM]
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
  "TC_total": tc_total,
  "TCI_total": tci_total,
  "TI_total": ti_total,
  "TC_ppm": tc_ppm,
  "TCI_ppm": tci_ppm,
  "TI_ppm": ti_ppm
};

console.log(finalObj);

var json = JSON.stringify(finalObj);

fs.writeFile("./flow_od.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
