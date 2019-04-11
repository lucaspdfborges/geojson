const mzod = require('./macrozona_do.json');
const fs = require('fs');
const zippedOD = {};
console.log(mzod);

var tc_total_max = 0;
var ti_total_max = 0;
var tc_ppm_max = 0;
var ti_ppm_max = 0;

for(mzOrigem in mzod){

  var tc_total_sum = 0;
  var ti_total_sum = 0;
  var tc_ppm_sum = 0;
  var ti_ppm_sum = 0;

  for(mzDestino in mzod[mzOrigem]){

    tc_total_sum += mzod[mzOrigem][mzDestino].TC_total;
    ti_total_sum += mzod[mzOrigem][mzDestino].TI_total;
    tc_ppm_sum += mzod[mzOrigem][mzDestino].TC_PPM;
    ti_ppm_sum += mzod[mzOrigem][mzDestino].TI_PPM;

  }

  tc_total_max = (tc_total_sum > tc_total_max ? tc_total_sum : tc_total_max);
  ti_total_max = (ti_total_sum > ti_total_max ? ti_total_sum : ti_total_max);
  tc_ppm_max = (tc_ppm_sum > tc_ppm_max ? tc_ppm_sum : tc_ppm_max);
  ti_ppm_max = (ti_ppm_sum > ti_ppm_max ? ti_ppm_sum : ti_ppm_max);


  zippedOD[mzOrigem] = {
                          "TC_total": tc_total_sum,
                          "TI_total": ti_total_sum,
                          "TC_PPM": tc_ppm_sum,
                          "TI_PPM": ti_ppm_sum
                        };
}

console.log('Maximo TC_TOTAL',tc_total_max);
console.log('Maximo TI_TOTAL',ti_total_max);
console.log('Maximo TC_PPM',tc_ppm_max);
console.log('Maximo TI_PPM',ti_ppm_max);

var json = JSON.stringify(zippedOD);


fs.writeFile("./destinyOD.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
