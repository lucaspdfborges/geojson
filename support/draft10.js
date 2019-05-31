const mz = require('./NOME_ID_MCZ_CENTER.json');
const fs = require('fs');

const mzData = mz.data;
finalObj ={};

for( element in mzData){
  var ra = mzData[element].RA_NOME;
  var id = mzData[element].MACROZONA;
  console.log(ra," : ",id);
  finalObj[id] = ra;

}


var json = JSON.stringify(finalObj);

fs.writeFile("./ID_RA.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
