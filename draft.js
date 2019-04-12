const mzod = require('./macrozona_od.json');
const mzcentroid = require('./mzCentroid.json');
const fs = require('fs');

for(mzOrigem in mzod){

  var tc_total_max = 0;
  var ti_total_max = 0;
  var tc_ppm_max = 0;
  var ti_ppm_max = 0;

  var mainObj =  mzod[mzOrigem];

  for(mzDestino in mzod[mzOrigem]){

    var obj = mainObj[mzDestino];

    tc_total = obj.TC_total;
    ti_total = obj.TI_total;
    tc_ppm = obj.TC_PPM;
    ti_ppm = obj.TI_PPM;

    tc_total_max = (tc_total > tc_total_max ? tc_total : tc_total_max);
    ti_total_max = (ti_total > ti_total_max ? ti_total : ti_total_max);
    tc_ppm_max = (tc_ppm > tc_ppm_max ? tc_ppm : tc_ppm_max);
    ti_ppm_max = (ti_ppm > ti_ppm_max ? ti_ppm : ti_ppm_max);

    obj["coordinates"] = mzcentroid[mzDestino];
  }

    mainObj["TC_total_max"] = tc_total_max;
    mainObj["TI_total_max"] = ti_total_max;
    mainObj["TC_PPM_max"] = tc_ppm_max;
    mainObj["TI_PPM_max"] = tc_ppm_max;

}
var json = JSON.stringify(mzod);


fs.writeFile("./mz_coord_max.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

/*
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


*/
