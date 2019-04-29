const mzod = require('./macrozona_od.json');
const fs = require('fs');

const zippedDO = {};

for(mzOrigem in mzod){

  for(mzDestino in mzod[mzOrigem]){

    if(!zippedDO[mzDestino]){
      zippedDO[mzDestino] = {};
    }
      zippedDO[mzDestino][mzOrigem]= {
                              "TC_total": mzod[mzOrigem][mzDestino].TC_total,
                              "TI_total": mzod[mzOrigem][mzDestino].TI_total,
                              "TC_PPM": mzod[mzOrigem][mzDestino].TC_PPM,
                              "TI_PPM": mzod[mzOrigem][mzDestino].TI_PPM
                            };
}
  }
}



var json = JSON.stringify(zippedDO);


fs.writeFile("./test.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
