const mz = require('./RA_NOME_ID.json');
const fs = require('fs');

const mzData = mz.data;
finalObj ={};

for( element in mzData){
  var ra = mzData[element].RA_NOME;
  var id = mzData[element].ID;
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
