const mczonaFile = require('./mczona.json');
const fs = require('fs');

var mczonas = mczonaFile.objects.MacrozonasDF.geometries;
var myObj = {};
var myArray =[];

console.log(mczonas[0]);

for(mczona in mczonas){
  var localObj = {};

  localObj["RA_NOME"] =   mczonas[mczona].properties.RA_NOME;
  localObj["ID"] = mczonas[mczona].properties.ID;
  localObj["bbox"] = mczonas[mczona].bbox;

  myArray.push(localObj);
}

myObj["data"] = myArray;

var json = JSON.stringify(myObj);

fs.writeFile("./NOME_ID_BBOX.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
