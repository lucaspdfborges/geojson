const mz = require('./pre_flow_od.json');
const fs = require('fs');

var finalObj = {};

var tc_total_max = 0;
var ti_total_max = 0;
var tci_total_max = 0;
var tc_ppm_max = 0;
var ti_ppm_max = 0;
var tci_ppm_max = 0;

var origin_tc_total_max = '';
var origin_ti_total_max = '';
var origin_tci_total_max = '';
var origin_tc_ppm_max = '';
var origin_ti_ppm_max = '';
var origin_tci_ppm_max = '';

var destiny_tc_total_max = '';
var destiny_ti_total_max = '';
var destiny_tci_total_max = '';
var destiny_tc_ppm_max = '';
var destiny_ti_ppm_max = '';
var destiny_tci_ppm_max = '';

for(origem in mz){

  var newArray = [];

  for(destino in mz[origem]){

    if( mz[origem][destino].TC_total > tc_total_max){
      tc_total_max =  mz[origem][destino].TC_total;
      origin_tc_total_max = origem;
      destiny_tc_total_max = mz[origem][destino].destiny;
    };
    if( mz[origem][destino].TCI_total > tci_total_max){
      tci_total_max =  mz[origem][destino].TCI_total;
      origin_tci_total_max = origem;
      destiny_tci_total_max = mz[origem][destino].destiny;
    };
    if( mz[origem][destino].TI_total > ti_total_max){
      ti_total_max =  mz[origem][destino].TI_total;
      origin_ti_total_max = origem;
      destiny_ti_total_max = mz[origem][destino].destiny;
    };

    if( mz[origem][destino].TC_PPM > tc_ppm_max){
      tc_total_max =  mz[origem][destino].TC_PPM;
      origin_tc_ppm_max = origem;
      destiny_tc_ppm_max = mz[origem][destino].destiny;
    };
    if( mz[origem][destino].TCI_PPM > tci_ppm_max){
      tci_ppm_max =  mz[origem][destino].TCI_PPM;
      origin_tci_ppm_max = origem;
      destiny_tci_ppm_max = mz[origem][destino].destiny;
    };
    if( mz[origem][destino].TI_PPM > ti_ppm_max){
      ti_ppm_max =  mz[origem][destino].TI_PPM;
      origin_ti_ppm_max = origem;
      destiny_ti_ppm_max = mz[origem][destino].destiny;
    };

  }

}

finalObj = {
    "TC_total":{
      "value": tc_total_max,
      "origin": origin_tc_total_max,
      "destiny": destiny_tc_total_max
    },
    "TCI_total":{
      "value": tci_total_max,
      "origin": origin_tci_total_max,
      "destiny": destiny_tci_total_max
    },
    "TI_total":{
      "value": ti_total_max,
      "origin": origin_ti_total_max,
      "destiny": destiny_ti_total_max
    },
    "TC_PPM":{
      "value": tc_ppm_max,
      "origin": origin_tc_ppm_max,
      "destiny": destiny_tc_ppm_max
    },
    "TCI_PPM":{
      "value": tci_ppm_max,
      "origin": origin_tci_ppm_max,
      "destiny": destiny_tci_ppm_max
    },
    "TI_PPM":{
      "value": ti_ppm_max,
      "origin": origin_ti_ppm_max,
      "destiny": destiny_ti_ppm_max
    },
};

var json = JSON.stringify(finalObj);

fs.writeFile("./flow_od.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
