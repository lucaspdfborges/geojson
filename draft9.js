const mzFile = require('./NOME_ID_MCZ_CENTER.json');
const fs = require('fs');

const jsonf = mzFile.data;

const jsonAsArray = Object.keys(jsonf).map(function (key) {
  return jsonf[key];
})
.sort(function (itemA, itemB) {
  return itemA.ID > itemB.ID;
});

jsonAsArray.sort(function(a, b) {
    return a.RA_NOME.normalize('NFD').replace(/[\u0300-\u036f]/g, "").charCodeAt(0) - b.RA_NOME.normalize('NFD').replace(/[\u0300-\u036f]/g, "").charCodeAt(0);
});

jsonAsArray.forEach(function(e,i){
  console.log(e.RA_NOME);
})


var json = JSON.stringify(jsonAsArray);

fs.writeFile("./NOME_ID_MCZ_CENTER_sorted.json",json, function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});
