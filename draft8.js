const mzFile = require('./mczona.json');
const fs = require('fs');

const macrozonas = mzFile.objects.MacrozonasDF.geometries;
var finalObj = {};

for(i in macrozonas){

  var mz = macrozonas[i];

  finalObj[mz.properties.MACROZONA] = {
    "AREA": mz.properties.AREA,
    "RA_NOME": mz.properties.RA_NOME
  };
}

var json = JSON.stringify(finalObj);

fs.writeFile("./mczona_area.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
