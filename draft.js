const mzod = require('./macrozona_od.json');
const fs = require('fs');
const zippedOD = {};
console.log(mzod);

for(mzOrigem in mzod){

  console.log("");
  console.log("# Macrozona:",mzOrigem);

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

  zippedOD[mzOrigem] = {
                          "TC_total": tc_total_sum,
                          "TI_total": ti_total_sum,
                          "TC_PPM": tc_ppm_sum,
                          "TI_PPM": ti_ppm_sum
                        };
}


console.log(zippedOD);
var json = JSON.stringify(zippedOD);

fs.writeFile("./test.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
