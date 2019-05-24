var zoom = d3.behavior
.zoom()
.scaleExtent([1, 20])
.on("zoom", move);

var width = document.getElementById("container").offsetWidth;
var height = width * 0.55;

var lastPlot = "none";
var lastZone = "none";

var scaleResize = 1;

// Origin or Destiny selector
var mouseSelectorOD = "origin";

// Rectangle legends
const rectColors = ["hsla(0, 20%, 50%,0.4)","hsla(120, 20%, 50%,0.4)","hsla(240, 20%, 50%,0.4)"];
const rectColorsText = ["hsla(0, 20%, 20%, 1)","hsla(120, 20%, 20%, 1)","hsla(240, 20%, 20%, 1)"];
const rectText = ["COLETIVO","INDIVIDUAL"];

const mapCenter = [-47.797089, -15.77526];

var listColors = [["hsla(340, 35%, 55%, 0.95)", "hsla(380, 35%, 55%, 0.95)"],["hsla(220, 30%, 60%, 0.95)", "hsla(170, 30%, 60%, 0.95)"],["hsla(230, 35%, 55%, 0.95)", "hsla(310, 35%, 55%, 0.95)"],["#FFF", "#DDD"]]
var gradientsArray = [];

let totalSum = 0;
let matODdownload;
var topo,
lagosTopo,
manchaTopo,
eixosTopo,
originOD,
destinyOD,
projection,
path,
svg,
g,
legendSVGright,
legendSVGleft,
gLegend,
defs,
offsetL,
offsetT;

var graticule = d3.geo.graticule();

var tooltip = d3
.select("#container")
.append("div")
.attr("class", "tooltip hidden");

var tooltipZone = tooltip
                .append("p")
                .attr("class","tooltipZone");

var tooltipMunicipio = tooltip
                .append("p")
                .attr("class","tooltipMunicipio");

var tooltipNum = tooltip
                .append("p")
                .attr("class","tooltipNum");

var canChangeColor = true;

var offsetL = document.getElementById("container").offsetLeft + 20;
var offsetT = document.getElementById("container").offsetTop + 10;

d3.select(window).on("resize", throttle);

var throttleTimer;
function throttle() {
  offsetL = document.getElementById("container").offsetLeft + 20;
  offsetT = document.getElementById("container").offsetTop + 10;
}

setup(width, height);

function setup(width, height) {
  
  projection = d3.geo
  .mercator()
  .translate([33.9 * width, - 19.8* height])
  .scale(40 * width);

  path = d3.geo.path().projection(projection);

  svg = d3
  .select("#container")
  .append("svg")
  .attr("width", width)
  .attr("height", height)
  .call(responsivefy)
  .attr("id","svgChart")
  .call(zoom)
  .on("click", click);

  g = svg.append("g");
}

function focusArea(width, height, lnCenter) {

  var s =3;

  var kx = 2;
  var ky = -4;
  var tx = -width*(1 - 0.5/s - kx*(mapCenter[0] - lnCenter[0]));
  var ty = -height*(1 - 0.5/s - ky*(mapCenter[1] - lnCenter[1]));

  var t = [tx, ty];
  g = d3.select("#container g");
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");
}

function setupGradients(listColors){

  //listColors is an array like: [[initial_color_1, final_color_1], [initial_color_2, final_color_2], . . . ]
  defs = svg.append("defs");

  for(var i = 0; i < listColors.length; i++){

    var gradient = defs
    .append("linearGradient")
    .attr("id", "svgGradient"+(i+1).toString())
    .attr("x1", "0%")
    .attr("x2", "100%")
    .attr("y1", "0%")
    .attr("y2", "100%");

    gradient
    .append("stop")
    .attr("class", "start")
    .attr("offset", "0%")
    .attr("stop-color", listColors[i][0])
    .attr("stop-opacity", 1);

    gradient
    .append("stop")
    .attr("class", "end")
    .attr("offset", "100%")
    .attr("stop-color", listColors[i][1])
    .attr("stop-opacity", 1);

    gradientsArray.push(gradient);
  }
}

setupGradients(listColors);

d3.json(
  "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/area_verde.json",
  function(error, jsonFile) {
    var verde = topojson.feature(jsonFile, jsonFile.objects.verde).features;
    ambienteTopo = verde;
    ambiente(ambienteTopo);

d3.json(
  "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/mancha.json",
  function(error, jsonFile) {
    var urban = topojson.feature(jsonFile, jsonFile.objects.manchaurbana)
    .features;
    manchaTopo = urban;
    mancha(manchaTopo);

  d3.json(
    "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/eixo.json",
    function(error, jsonFile) {
      var eixos = topojson.feature(jsonFile, jsonFile.objects.eixo).features;
      eixosTopo = eixos;
      eixo(eixosTopo);

    d3.json(
      "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/mczona.json",
      function(error, world) {
        var countries = topojson.feature(world, world.objects.MacrozonasDF)
        .features;
        topo = countries;
        draw(topo);

        d3.json(
          "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/lagos.json",
          function(error, jsonFile) {
            var lakes = topojson.feature(jsonFile, jsonFile.objects.Lagos)
            .features;
            lagosTopo = lakes;
            lagos(lagosTopo);

          d3.json(
            "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/originOD.json",
            function(error, jsonFile) {
              originOD = jsonFile;

             d3.json(
              "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/destinyOD.json",
              function(error, jsonFile) {
                destinyOD = jsonFile;

              });
            });
          });
      });
    });
  });
});

function selectAsZone(node){

  if($("#originEsp").is(":checked")  || $("#destEsp").is(":checked") ){

  var inputID = "#MZ_Z_"+node.attr("macrozona");

  $("#zona-url input").each(function(){
    $(this).prop( "checked", false );
  });

  $(inputID).prop( "checked", true );

  nodeClicked = node.attr("clicked")>0;

   $(".macrozona").each(function() {
        $(this).attr("clicked", 0);
        $(this).css("fill", "rgba(219,220,222,0.5)");
      });

      if(nodeClicked == 0){
        node.style("fill", "#AAC");
      }else{
        node.style("fill", "rgba(219,220,222,0.5)");
      }

      node.attr("clicked", 1);

   var nextBlock = $("#dv-rep");
      nextBlock.fadeTo(200, 1.0);
      nextBlock.show();
  }
}

function selectAsOrigin(node){

   node.attr("isOrigin", 1-node.attr("isOrigin"));

   let isDestiny =  node.attr("isDestiny")>0;
   let isOrigin =  node.attr("isOrigin")>0;

    if(isDestiny && !isOrigin){
      node.style("fill", "url(#svgGradient1)");
    } else if(!isDestiny && isOrigin){
      node.style("fill", "url(#svgGradient2)");
    } else if(isDestiny && isOrigin){
       node.style("fill", "url(#svgGradient3)");
    } else{
      node.style("fill", "rgba(219,220,222,0.5)");
    }

   var nextBlock = $("#destino-block");
                  nextBlock.fadeTo(200, 1.0);
                  nextBlock.show();
}

function selectAsDestiny(node){

   node.attr("isDestiny", 1-node.attr("isDestiny"));

   let isDestiny =  node.attr("isDestiny")>0;
   let isOrigin =  node.attr("isOrigin")>0;

    if(isDestiny && !isOrigin){
      node.style("fill", "url(#svgGradient1)");
    } else if(!isDestiny && isOrigin){
      node.style("fill", "url(#svgGradient2)");
    } else if(isDestiny && isOrigin){
       node.style("fill", "url(#svgGradient3)");
    } else{
      node.style("fill", "rgba(219,220,222,0.5)");
    }

   var nextBlock =  $("#destino-block").parent(".grid-container").find(".container-block").last();
  nextBlock.fadeTo(200, 1.0);
  nextBlock.show();
}

d3.json("https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/NOME_ID_MCZ_CENTER_name_sorted.json",
function(error, jsonFile) {

  var blockZona = d3.select('#zona-url');
   var lisZona =  blockZona.selectAll('li')
                                .data(jsonFile.data)
                                .enter()
                                .append('li');

   lisZona
              .append('input')
              .attr("type", "radio")
              .attr("name", "zn")
              .on("click", function(d,i){
                  var node =  d3.select("#MZ_"+d.ID);
                  selectAsZone(node);

                  // free the next block
                  var thisBlock = $("#zona-block");
                  thisBlock.css("border-left","2px solid #e6e4ec");

              })
              .attr("id", function(d,i){
                  return "MZ_Z_" + d.MACROZONA;
              });

  lisZona
              .append('label')
              .attr("for", function(d,i){
                  return "MZ_Z_" + d.MACROZONA;
              })
              .html(function(d){
                var text = d.RA_NOME + " : " + d.MACROZONA;
                return text;
              });


   var blockOrigem = d3.select('#origem-url');
   var lisOrigem =  blockOrigem.selectAll('li')
                                .data(jsonFile.data)
                                .enter()
                                .append('li');

   lisOrigem
              .append('input')
              .attr("type", "checkbox")
              .on("click", function(d,i){
                  var node =  d3.select("#MZ_"+d.ID);
                  selectAsOrigin(node);

                  // free the next block
                  var thisBlock = $("#origem-block");
                  thisBlock.css("border-left","2px solid #e6e4ec");


              })
              .attr("id", function(d,i){
                  return "MZ_O_" + d.MACROZONA;
              });

  lisOrigem
              .append('label')
              .attr("for", function(d,i){
                  return "MZ_O_" + d.MACROZONA;
              })
              .html(function(d){
                var text = d.RA_NOME + " : " + d.MACROZONA;
                return text;
              });


   var blockDestino = d3.select('#destino-url');
    var lisDestino =  blockDestino.selectAll('li')
                                .data(jsonFile.data)
                                .enter()
                                .append('li');

   lisDestino
              .append('input')
              .attr("type", "checkbox")
              .on("click", function(d,i){
                 var node =  d3.select("#MZ_"+d.ID);
                 selectAsDestiny(node);

                 // free the next block
                 var thisBlock = $("#destino-block");
                 thisBlock.css("border-left","2px solid #e6e4ec");


              })
              .attr("id", function(d,i){
                  return "MZ_D_" + d.MACROZONA;
              });

  lisDestino
              .append('label')
              .attr("for", function(d,i){
                  return "MZ_D_" + d.MACROZONA;
              })
              .html(function(d){
                var text = d.RA_NOME + " : " + d.MACROZONA;
                return text;
              });

 // " <input type="checkbox" value="TC" id="coletivo"> <label for="coletivo">Coletivo</label>"

  var ul = d3.select('#search-wrapper').append('ul').attr("id","search-url");

  ul.selectAll('li')
  .data(jsonFile.data)
  .enter()
  .append('li')
  .attr("id", function(d,i){
       return "search_ID_" + d.ID;
   })
  .on("mousemove", function(d,i){
    let node = d3.select("#MZ_"+d.ID);
    
    //TODO implement
     node.style("stroke","#779");
     node.style("stroke-width","3");
   })
  .on("mouseout", function(d, i) {
     let node = d3.select("#MZ_"+d.ID);
     node.style("stroke","");
     node.style("stroke-width","");
  })
  .on("click",function(d){

    $("#search").val(d.RA_NOME + " : " + d.MACROZONA);
    $("#search-wrapper li").hide();

    width = document.getElementById("container").offsetWidth;
    height = width * 0.55;
    focusArea(width, height, d.center);

    setupGradients(listColors);
    mancha(manchaTopo);
    ambiente(ambienteTopo);
    eixo(eixosTopo);
    draw(topo);
    d3.selectAll(".eixo").style("stroke-width", 0.3);
    lagos(lagosTopo);

    var mzID = "#MZ_"+d.ID;
    //TODO implement rest
    $(".macrozona").each(function() {
      $(this).css("stroke", "");
      $(this).css("stroke-width", "");
    });

    $(mzID).attr("stroke","#A53");
    $(mzID).attr("stroke-width","2");

  })
  .append('a')
  .html(function(d){
    var text = d.RA_NOME + " : " + d.MACROZONA;
    return text;
  });
});

$("#clear-search").on("click",function(){
  
  $("#search").val('');
  $("#search-url li").hide();
  $(this).css('opacity','0');
  
   $(".macrozona").each(function() {
     node = d3.select("#"+ $(this).attr("id"));
     node.attr("stroke","");
     node.attr("stroke-width","");
  });
  
});

function searchFunction(){
  var input, filter, ul, li, a, i, txtValue;

  input = document.getElementById("search");
  filter = input.value.toUpperCase();
  ul = document.getElementById("search-url");
  li = ul.getElementsByTagName("li");

  if(filter.length){
   $("#clear-search").css('opacity','1');
  }else{
    $("#clear-search").css('opacity','0');
    $(".macrozona").each(function() {
     node = d3.select("#"+ $(this).attr("id"));
     node.attr("stroke","");
     node.attr("stroke-width","");
    });
  }

  for (i = 0; i < li.length; i++) {
    a = li[i].getElementsByTagName("a")[0];
    txtValue = a.textContent || a.innerText;
    if (filter.length && txtValue.toUpperCase().indexOf(filter) > -1) {
      li[i].style.display = "block";
    } else {
      li[i].style.display = "none";
    }
  }
}

function eixo(jsonFile) {
  var eixoviario = g.selectAll(".eixo").data(jsonFile);

  eixoviario
  .enter()
  .insert("path")
  .attr("class", "eixo")
  .attr("d", path)
  .attr("stroke", "#ccc")
  .attr("stroke-width", "1")
  .style("fill", "none");
}


function ambiente(jsonFile) {

  var verde = g.selectAll(".verde").data(jsonFile);
  
  verde
  .enter()
  .insert("path")
  .attr("class", "verde")
  .attr("d", path)
  .style("fill", "#c7e5d8");
}

function mancha(jsonFile) {
  var urban = g.selectAll(".urban").data(jsonFile);
  
  urban
  .enter()
  .insert("path")
  .attr("class", "urban")
  .attr("d", path)
  .style("fill", "#999");
}

function lagos(jsonFile) {
  var lakes = g.selectAll(".lagos").data(jsonFile);

  lakes
  .enter()
  .insert("path")
  .attr("class", "lagos")
  .attr("d", path)
  .style("fill", "#bcd8e8");
}

function draw(topo) {

  var country = g.selectAll(".macrozona").data(topo);

  country
  .enter()
  .insert("path")
  .attr("class", "macrozona")
  .attr("d", path)
  .attr("checked", 0)
  .attr("isDestiny",0)
  .attr("isOrigin",0)
  .attr("plottedValue",0)
  .attr("macrozona", function(d) {
    return d.properties.MACROZONA;
  })
  .attr("id", function(d) {
    return ("MZ_"+d.properties.ID);
  })
  .attr("title", function(d, i) {
    return d.properties.RA_NOME;
  })
  .style("fill", function(d, i) {
    //todo modify
    return "rgba(219,220,222,0.5)";
  });

  //offsets for tooltips
  offsetL = document.getElementById("container").offsetLeft + 20;
  offsetT = document.getElementById("container").offsetTop + 10;

  //tooltips
  country
  .on("mousemove", function(d, i) {
    
    var mouse = d3.mouse(svg.node()).map(function(d) {
      return parseInt(d*scaleResize);
    });
    
    tooltip
    .classed("hidden", false)
    .attr(
      "style",
      "left:" +
      (mouse[0] + offsetL) +
      "px;top:" +
      (mouse[1] + offsetT) +
      "px"
    );

    tooltipZone
    .classed("hidden", false)
    .html(d.properties.RA_NOME);

    tooltipNum
    .classed("hidden", false)
    .html("zona: <i style='color:#2a2559;'>#"+ d.properties.MACROZONA+"</i> | Área <i style='color:#2a2559;'>"+ Math.round(d.properties.AREA) +"</i> km²");
    
    let node = d3.select(this);
    let nodeValue = node.attr("plottedValue");
    
    if(lastPlot=="destinyTrips" || lastPlot=="originTrips"){
      tooltipMunicipio
        .classed("hidden", false)
        .html("nº de viagens: <i style='color:#2a2559;'>"+ nodeValue +"</i> ");
    }else{
         tooltipMunicipio
        .classed("hidden", false)
        .html(d.properties.MUNICIPIO_);
    }

  })
  .on("mouseout", function(d, i) {
    tooltip.classed("hidden", true);
  })
  .on("click", function(d) {
    let node = d3.select(this);
    let nodeClicked = node.attr("clicked");

    // TODO:  use conditional
    if($("#origemDestinoBox").attr("class")=="grid-container"){

      if($("#horapico").is(":checked") || $("#total").is(":checked")){

        if(mouseSelectorOD=="origin"){

          if(!$("#MZ_O_"+d.properties.MACROZONA).is(":checked")){
               $("#MZ_O_"+d.properties.MACROZONA).prop( "checked", true );
                node.attr("isOrigin",1);
                scrollToLi("MZ_O_"+d.properties.MACROZONA);
              }else{
              $("#MZ_O_"+d.properties.MACROZONA).prop( "checked", false );
               node.attr("isOrigin",0);
           }

          var nextBlock = $("#destino-block");
          if(nextBlock.is(":hidden")){
            nextBlock.fadeTo(200, 1.0);
            nextBlock.show();
          }

        } else if(mouseSelectorOD=="destiny"){
          if(!$("#MZ_D_"+d.properties.MACROZONA).is(":checked")){
               $("#MZ_D_"+d.properties.MACROZONA).prop( "checked", true );
               node.attr("isDestiny",1);
               scrollToLi("MZ_D_"+d.properties.MACROZONA);
              }else{
              $("#MZ_D_"+d.properties.MACROZONA).prop( "checked", false );
              node.attr("isDestiny",0);
           }

          var nextBlock = $("#destino-block").parent(".grid-container").find(".container-block").last();
          if(nextBlock.is(":hidden")){
            nextBlock.fadeTo(200, 1.0);
            nextBlock.show();
          }
        }

       let isDestiny =  $("#MZ_D_"+d.properties.MACROZONA).is(":checked");
       let isOrigin =  $("#MZ_O_"+d.properties.MACROZONA).is(":checked");

        if(isDestiny && !isOrigin){
          node.style("fill", "url(#svgGradient1)");
        }else if(!isDestiny && isOrigin){
          node.style("fill", "url(#svgGradient2)");
        } else if(isDestiny && isOrigin){
           node.style("fill", "url(#svgGradient3)");
        } else{
          node.style("fill", "rgba(219,220,222,0.5)");
        }
      }

    }else if($("#interesseBox").attr("class")=="grid-container"){

      selectAsZone(node);
      scrollToLi("MZ_Z_"+d.properties.MACROZONA);
      lastZone = "#MZ_" + d.properties.ID;
      
      //TODO change
      if(lastPlot=="interest"){
        interestPlot();
        var inputID = "#MZ_Z_"+node.attr("macrozona");
        $(inputID).prop( "checked", true );
      }

    } else if($("#indicadoresBox").attr("class")=="grid-container"){
      var value = node.attr("title");
      if($("#container-legend svg").length){
           $("#mode-distribution").remove();

            var val1 = 0;

            if(lastPlot=="originTrips"){
               var origin = originOD[node.attr("macrozona")];

               if ($("#horapico").is(":checked")) {
                 val1 = Math.round(100*origin.TC_total/(origin.TC_total + origin.TI_total));
                } else {
                  val1 = Math.round(100*origin.TC_PPM/(origin.TC_PPM + origin.TI_PPM));
                }

            }else if(lastPlot=="destinyTrips"){
               var destiny = destinyOD[node.attr("macrozona")];
              if ($("#horapico").is(":checked")) {
                 val1 = Math.round(100*destiny.TC_total/(destiny.TC_total + destiny.TI_total));
                } else {
                  val1 = Math.round(100*destiny.TC_PPM/(destiny.TC_PPM + destiny.TI_PPM));
                }
            }

            var val2 = 100-val1;
            zoneLegend("",legendSVGright,val1, val2);
      }
    }

    node.attr("clicked", 1 - nodeClicked);
  });
}


function centerMap(){

  var s =1;
  var tx = 0;
  var ty = 0;

  var t = [tx, ty];
  g = d3.select("#container g");
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

}

$("#centerMap").on("click", function(){
  centerMap();
});

function move() {
  //prevent scrolling
  canChangeColor = false;

  var t = d3.event.translate;
  var s = d3.event.scale;
  zscale = s;
  var h = height / 4;

  t[0] = Math.min(width / height * (s - 1), Math.max(width * (1 - s), t[0]));

  t[1] = Math.min(
    h * (s - 1) + h * s,
    Math.max(height * (1 - s) - h * s, t[1])
  );

  zoom.translate(t);
  g.attr("transform", "translate(" + t + ")scale(" + s + ")");

  //adjust the country hover stroke width based on zoom level
  d3.selectAll(".macrozona").style("stroke-width", 2 / s);
  d3.selectAll(".verde").style("stroke-width", 1.5 / s);
  d3.selectAll(".lagos").style("stroke-width", 1.5 / s);

  d3.selectAll(".centroid").attr("r", function() {
    let node = d3.select(this);
    let ratio = node.attr("ratio");
    let radius = 16 / s * ratio;
    return radius;
  });

  d3.selectAll(".line-centroid").style("stroke-width", function() {
    let node = d3.select(this);
    let ratio = node.attr("ratio");
    return 10 * ratio / s;
  });

  d3.selectAll(".eixo").style("stroke-width", function() {
    return 1  / s;
  });

   d3.selectAll(".centroid").style("stroke-width", function() {
    return 1  / s;
  });

  canChangeColor = true;
}


//geo translation on mouse click in map
function click() {
  var latlon = projection.invert(d3.mouse(this));
}

//function to add points and text to the map (used in plotting capitals)
function addpoint(longitude, latitude, text) {
  var gpoint = g.append("g").attr("class", "gpoint");
  var x = projection([longitude, latitude])[0];
  var y = projection([longitude, latitude])[1];

  gpoint
  .append("svg:circle")
  .attr("cx", x)
  .attr("cy", y)
  .attr("class", "point")
  .attr("r", 2)
  .style("fill", "#fff");

  //conditional in case a point has no associated text
  if (text.length > 0) {
    gpoint
    .append("text")
    .attr("x", x + 2)
    .attr("y", y + 2)
    .attr("class", "text")
    .text(text)
    .style("fill", "#fff");
  }
}

(function($) {
  $.fn.goTo = function() {
    $("html, body").animate(
      {
        scrollTop: $(this).offset().top + "px"
      },
      "fast"
    );
    return this; // for chaining...
  };
})(jQuery);

function fetchJSONFile(path, callback) {
  var httpRequest = new XMLHttpRequest();
  httpRequest.onreadystatechange = function() {
    if (httpRequest.readyState === 4) {
      if (httpRequest.status === 200) {
        var data = JSON.parse(httpRequest.responseText);
        if (callback) callback(data);
      }
    }
  };
  httpRequest.open("GET", path);
  httpRequest.send();
}

function createOD(testData) {
  // set up the table
  var table = d3.select("#results").append("table");
  var thead = table
  .append("thead")
  .attr("class", "thead-row")
  .append("tr");
  var thead2 = table.append("thead").attr("class", "thead-col");
  var thead3 = table.append("thead").attr("class", "thead-corner");
  var tbody = table.append("tbody");
  $("#ODtitle").css("visibility", "visible");
  $("#table-wrapper").css("visibility", "visible");

  var colData = testData.slice();
  colData.shift();

  var rowData = testData.slice();
  var roeDataLine = rowData[0];
  roeDataLine.shift();

  var cornerData = ["OD"];

  var tr0 = thead
  .selectAll("tr")
  .data(roeDataLine)
  .enter()
  .append("th")
  .append("div")
  .attr("class","table-cell")
  .text(function(d) {
    return d;
  });

  var tr1 = thead2
  .selectAll("thead")
  .data(colData)
  .enter()
  .append("tr")
  .append("th")
  .append("div")
  .attr("class","table-cell")
  .text(function(d) {
    return d[0];
  });

  var tr2 = thead3
  .selectAll("thead")
  .data(cornerData)
  .enter()
  .append("tr")
  .append("th")
  .append("div")
  .attr("class","table-cell")
  .text(function(d) {
    return d;
  });

  // first create the table rows (3 needed)

  var bodyData = testData.slice();
  bodyData.shift();
  bodyData.map(x => x.shift());

  var tr = tbody
  .selectAll("tr")
  .data(bodyData)
  .enter()
  .append("tr");

  // Now create the table cells

  var td = tr
  .selectAll("td")
  .data(function(d) {
    return d;
  })
  .enter()
  .append("td")
  .append("div")
  .attr("class","table-cell")
  .html(function(d) {
    return d;
  });
}

function baseColorFunction(baseColor, ratio){
  var color =
  "hsla(" +
  (baseColor - 44 * Math.pow(ratio, 0.4)) +
  ",41%," +
  100 * (0.75 - 0.5 * Math.pow(ratio, 0.4)) +
  "%," +
  Math.pow(ratio, 0.4) +
  ")";

  return color;
}

function baseColorFunctionMin(baseColor, ratio){
  var color =
  "hsla(" +
  (baseColor - 44 * Math.pow(ratio, 0.4)) +
  ",41%," +
  100 * (0.85 - 0.5 * Math.pow(ratio, 0.4)) +
  "%," +
  Math.pow(ratio, 0.1) +
  ")";

  return color;
}

function blueColorFunction(ratio){
  var color =
  "hsla(" +
  (130 + 110 * Math.pow(ratio, 0.4)) +
  ",25%," +
  100 * (0.99 - 0.5 * Math.pow(ratio, 0.4)) +
  "%,1)";

  return color;
}

function redColorFunction(ratio){
  var color =
  "hsla(" +
  (60 - 50 * Math.pow(ratio, 0.4)) +
  ",40%," +
  100 * (0.99 - 0.6 * Math.pow(ratio, 0.4)) +
  "%,1)";

  return color;
}


function zoneLegend(zoneName, legendSVG, val1, val2){

   var info = legendSVG.append("g").attr("id","mode-distribution");

    var rectData = [val1, val2];

    info.selectAll("text")
        .data(rectData)
        .enter()
        .append("text")
        .attr("font-size", "0.75em")
        .attr("x", function(d,i){
          if(d<1){
            return 28+3*d;
          }else if(d<10){
            return 21+3*d;
          }else{
            return 3*d;
          }
        })
        .attr("y", function(d,i){
          return 35+12*(i+(i/5));
        })
        .text(function(d,i){
           return d.toString()+" % "+rectText[i];
        })
        .style("fill",function(d,i){
          return rectColorsText[i];
        });
    
   var textLegend = zoneName ;
   if($("#destEsp").is(":checked")){
     textLegend  += " Indicador de destino: ";
   }else if($("#originEsp").is(":checked")){
     textLegend  += " Indicador de origem: ";
   }

    if ($("#coletivo").is(":checked") && !$("#individual").is(":checked")) {
      textLegend += "coletivo";
    }else if($("#individual").is(":checked") && !$("#coletivo").is(":checked")){
      textLegend += "coletivo";
    }else{
      textLegend += "coletivo e individual";
    };

    if ($("#horapico").is(":checked")) {
      textLegend += " - hora pico.";
    } else {
      textLegend += " - total.";
    }

    info  .append("text")
    .attr("font-size", "0.95em")
    .attr("x", 0)
    .attr("y", 15)
    .text(textLegend)
    .style("fill","#555");

    info.selectAll("rect")
    .data(rectData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", function(d,i){
      return 25+12*(i+(i/5));
    })
    .attr("width", function(d,i){
      return 3*d;
    })
    .style("fill", function(d,i){
      return rectColors[i];
    })
    .attr("height", 12);

}

function tripsLegend(colorFunction, maxLegend){

    var colorGrad =[];

    for(var i = 0; i < 5; i++){
      var color = colorFunction(i/4);
      colorGrad.push(color);
    }

    $("#container-legend svg").remove();

    legendSVGleft = d3.select('#container-legend')
                      .append("svg")
                      .attr("id", "legendLeft")
                      .attr("width", 600)
                      .attr("height", height/5);

    //legedHere

    var legendLeft = legendSVGleft.append("g");

    legendLeft.selectAll("rect")
    .data(colorGrad)
    .enter()
    .append("rect")
    .attr("x", function(d,i){
      return (51*i+51);
    })
    .attr("y", 22)
    .attr("width", 50)
    .attr("height", 10)
    .style("stroke", "#ccc")
    .style("fill", function(d){
      return d;
    });

    legendLeft.selectAll("text")
    .data(colorGrad)
    .enter()
    .append("text")
    .attr("font-size", "0.75em")
    .attr("x", function(d,i){
      return (51*i+51);
    })
    .attr("y", 15)
    .text(function(d,i){
      return (Math.round((i/4)*maxLegend));
    })
    .style("fill",function(d,i){
      if(i%2){
        return "#777";
      }else{
        return "#444";
      }
    });

    legendLeft.append("text")
    .attr("font-size", "0.75em")
    .attr("x", function(){
      return (0);
    })
    .attr("y", 30)
    .text("viagens")
    .style("fill","#555");
}

function tripsRepresentation(jsonFile,colorFunction){

    var maxLegend = 0;
    // Coloring the zones
    $(".macrozona").each(function() {
      var node = d3.select("#"+$(this).attr("id"));
      var macrozona = $(this).attr("macrozona");
      var value = 0;
      var max = 1;

      var tc_total_max = jsonFile.max.TC_total;
      var ti_total_max = jsonFile.max.TI_total;
      var tc_ppm_max = jsonFile.max.TC_PPM;
      var ti_ppm_max = jsonFile.max.TI_PPM;

      if (jsonFile[macrozona]) {
        var obj = jsonFile[macrozona];
        var tc_total = obj.TC_total;

        if ($("#coletivoInd").is(":checked")) {
          if ($("#horapicoInd").is(":checked")) {
            value += obj.TC_PPM;
            max += tc_ppm_max;
          } else {
            value += obj.TC_total;
            max += tc_total_max;
          }
        }
        if ($("#individualInd").is(":checked")) {
          if ($("#horapicoInd").is(":checked")) {
            value += obj.TI_PPM;
            max += ti_ppm_max;
          } else {
            value += obj.TI_total;
            max += ti_total_max;
          }
        }
      }

      maxLegend = max;

      var color = colorFunction(value/max);
      node.attr("plottedValue", Math.ceil(value));

      $(this).css("fill", color);
      //todo change
      $(this).css("stroke", "rgba(150,150,150,0.2)");

      
    });

   // LEGEND
   tripsLegend(colorFunction, maxLegend);
}

function plotOriginTrips(){
    clearAll();
  lastPlot = "originTrips";

  d3.json(
    "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/originOD.json",
    function(error, jsonFile) {
      originOD = jsonFile;
      tripsRepresentation(originOD,blueColorFunction);
       $("#container-legend").css('display','flex');
       $("#top-content").hide();
    }
  );

}

$("#originTripsBtn").click(function() {
  plotOriginTrips();
});

function plotDestinyTrips(){
  clearAll();
  lastPlot = "destinyTrips";

  d3.json(
    "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/destinyOD.json",
    function(error, jsonFile) {
      destinyOD = jsonFile;
      tripsRepresentation(destinyOD,redColorFunction);
      $("#container-legend").css('display','flex');
      $("#top-content").hide();
    }
  );
}

$("#destinyTripsBtn").click(function() {
   plotDestinyTrips();
});

function plotFlowOD(){
  clearAll();
  //redraw();

  lastPlot = "flowOD";

  d3.json(
    "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/flow_od.json",
    function(error, jsonFile) {

      var dataFile;

       if ($("#coletivo").is(":checked") && !$("#individual").is(":checked")) {
            if ($("#horapico").is(":checked")) {
              dataFile = jsonFile.TC_PPM;
            } else {
              dataFile = jsonFile.TC_total;
            }
          }
          else if ($("#individual").is(":checked") && !$("#coletivo").is(":checked")) {
            if ($("#horapico").is(":checked")) {
              dataFile = jsonFile.TI_PPM;
            } else {
              dataFile = jsonFile.TI_total;
            }
          } else{
            if ($("#horapico").is(":checked")) {
              dataFile = jsonFile.TCI_PPM;
            } else {
              dataFile = jsonFile.TCI_total;
            }
          }

      var shortData = dataFile.slice();
      var max = shortData[0][1];

      g
        .selectAll("line")
        .data(shortData)
        .enter()
        .append("line")
        .attr("class", "line-centroid")
        .attr("x1", function(d) {
        return projection(d[0].originCoord)[0];
      })
        .attr("y1", function(d) {
        return projection(d[0].originCoord)[1];
      })
        .attr("x2", function(d) {
        return projection(d[0].destinyCoord)[0];
      })
        .attr("y2", function(d) {
        return projection(d[0].destinyCoord)[1];
      })
        .attr("stroke-linecap", "round")
        .attr("stroke-width", function(d,i) {
        var ratio = d[1]/max;
        return (1 + 10 * ratio);
      })
      .on("mousemove", function(d, i) {

        var mouse = d3.mouse(svg.node()).map(function(d) {
          return parseInt(d);
        });

        tooltip
          .classed("hidden", false)
          .attr(
          "style",
          "left:" +
          (mouse[0] + offsetL) +
          "px;top:" +
          (mouse[1] + offsetT) +
          "px"
        );

        tooltipNum
          .html("nº de viagens: <i style='color:#2a2559;'>"+ d[1]+"</i>");
        
        tooltipMunicipio.classed("hidden", true);
        tooltipZone.classed("hidden", true);

      })
        .on("mouseout", function(d, i) {
        tooltip.classed("hidden", true);
      })
        .attr("stroke", function(d,i) {
        var ratio = d[1]/max;
        var color = baseColorFunctionMin(300, ratio);
        return color;
      })
        .attr("ratio", function(d,i) {
        var ratio = d[1]/max;
        return (ratio || 0);
      });

      var centroids = g
                      .selectAll("circle")
                      .data(shortData, function(d){return d})
                      .enter();

      offsetL = document.getElementById("container").offsetLeft + 20;
      offsetT = document.getElementById("container").offsetTop + 10;

      centroids
        .append("circle")
        .attr("class", "centroid")
        .attr("cx", function(d) {
        return projection(d[0].originCoord)[0];
      })
        .attr("cy", function(d) {
        return projection(d[0].originCoord)[1];
      })
        .attr("r", function(d,i) {
        var ratio = d[1]/max;
        var radius =( 1 + 15 * ratio);
        return (radius||0);
      })
        .attr("fill",function(d,i) {
        var ratio = d[1]/max;
        var color = baseColorFunctionMin(300, ratio);
        return color;
      })
        .attr("ratio", function(d,i) {
        var ratio = d[1]/max;
        return (ratio || 0);
      });

      centroids
        .append("circle")
        .attr("class", "centroid")
        .attr("cx", function(d) {
        return projection(d[0].destinyCoord)[0];
      })
        .attr("cy", function(d) {
        return projection(d[0].destinyCoord)[1];
      })
        .attr("r", function(d,i) {
        var ratio = d[1]/max;
        var radius = (1 + 15 * ratio);
        return (radius||0);
      })
        .attr("fill",function(d,i) {
        var ratio = d[1]/max;
        var color = baseColorFunctionMin(300, ratio);
        return color;
      })
      .on("mousemove", function(d, i) {

        var mouse = d3.mouse(svg.node()).map(function(d) {
          return parseInt(d);
        });

        tooltip
          .classed("hidden", false)
          .attr(
          "style",
          "left:" +
          (mouse[0] + offsetL) +
          "px;top:" +
          (mouse[1] + offsetT) +
          "px"
        );

        tooltipNum
          .html("nº de viagens: <i style='color:#2a2559;'>"+ d[1]+"</i>");
        
        tooltipMunicipio.classed("hidden", true);
        tooltipZone.classed("hidden", true);

      })
        .on("mouseout", function(d, i) {
        tooltip.classed("hidden", true);
      })
        .attr("ratio", function(d,i) {
        var ratio = d[1]/max;
        return (ratio || 0);
      });

      var colorGrad =[];

      for(var i = 0; i < 6; i++){
        var color = baseColorFunctionMin(300, i/5);
        colorGrad.push(color);
      }

      var legendSVGleft = d3.select('#container-legend')
                            .append("svg")
                            .attr("id","legendLeft")
                            .attr("width", 600)
                            .attr("height", height/5);

      var legendLeft = legendSVGleft.append("g");

          legendLeft.selectAll("circle")
          .data(colorGrad)
          .enter()
          .append("circle")
          .attr("cx", function(d,i){
            return (10+ 51*(7-i));
          })
          .attr("cy", 35)
          .attr("r", function(d,i){
            return(16*(i/5))
          })
          .style("stroke", "#ccc")
          .style("fill", function(d){
            return d;
          });

          legendLeft.selectAll("text")
          .data(colorGrad)
          .enter()
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", function(d,i){
            return (52*(7-i) - 12);
          })
          .attr("y", 15)
          .text(function(d,i){
            if(i){
              return max*i/5;
            }
          })
          .style("fill",function(d,i){
            if(i%2){
              return "#777";
            }else{
              return "#666";
            }
          });

          legendLeft
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", 0 )
          .attr("y", 27)
          .text("nº de viagens")
          .style("fill","#555");
      
          legendLeft
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", 0 )
          .attr("y", 43)
          .text("intra-zonal")
          .style("fill","#555");
      
      
      var legendSVGright = d3.select('#container-legend')
                            .append("svg")
                            .attr("id","legendRight")
                            .attr("width", 600)
                            .attr("height", height/5);

      var legendRight = legendSVGright.append("g");

          legendRight.selectAll("rect")
          .data(colorGrad)
          .enter()
          .append("rect")
          .attr("x", function(d,i){
            return (51*(7-i));
          })
          .attr("y", 25)
          .attr("height", function(d,i){
            return(2*i)
          })
          .attr("width", 40)
          .style("fill", function(d){
            return d;
          });

          legendRight.selectAll("text")
          .data(colorGrad)
          .enter()
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", function(d,i){
            return (52*(7-i) - 4);
          })
          .attr("y", 15)
          .text(function(d,i){
            if(i){
              return max*i/5;
            }
          })
          .style("fill",function(d,i){
            if(i%2){
              return "#777";
            }else{
              return "#666";
            }
          });

          legendRight
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", 0 )
          .attr("y", 27)
          .text("nº de viagens")
          .style("fill","#555");
      
          legendRight
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", 0 )
          .attr("y", 43)
          .text("entre zonas")
          .style("fill","#555");

  });

  $("#container-legend").css('display','flex');
  $("#top-content").hide();
}

$("#flowODBtn").click(function() {
    plotFlowOD();
});

$("#selectAllBtn").click(function() {
  $(".macrozona").each(function() {
    if (
       document.getElementById("inputDestino").checked &&
      !document.getElementById("inputOrigem").checked
    ) {
      $(this).css("fill", "url(#svgGradient1)");
      $(this).attr("od", 1);
      $(this).attr("clicked", 1);
    } else if (
      !document.getElementById("inputDestino").checked &&
      document.getElementById("inputOrigem").checked
    ) {
      $(this).css("fill", "url(#svgGradient2)");
      $(this).attr("od", 2);
      $(this).attr("clicked", 1);
    } else if (
      document.getElementById("inputDestino").checked &&
      document.getElementById("inputOrigem").checked
    ) {
      $(this).css("fill", "url(#svgGradient3)");
      $(this).attr("od", 3);
      $(this).attr("clicked", 1);
    }
  });
});

function clearAll(){

  $(".macrozona").css("stroke","");
  $("#container-legend").hide();
  $("#top-content").fadeIn();
  $('#heatMapBtn').prop('checked', false);
  $("#origem-block").css("background-image", "linear-gradient( rgba(100,250,250,0.1), rgba(255, 255, 255,0))");
  $("#destino-block").css("background-image", "none");

  $(".macrozona").each(function() {
    $(this).css("fill", "rgba(219,220,222,0.5)");

    var node = d3.select("#"+$(this).attr("id"));
    node.attr("isOrigin", 0);
    node.attr("isDestiny", 0);
    
    $(this).css("stroke", "rgba(255,255,255,0)");
  });
   
  matODdownload = [];

  if ($("table").length != 0) {
    $("table").remove();
  }

  $("#ODtitle").css("visibility", "hidden");
  $("#table-wrapper").css("visibility", "hidden");
  $("#container-legend svg").fadeOut(200, function() { $(this).remove(); });
  $( ".centroid" ).remove();
  $( ".line-centroid" ).remove();

  $("#origem-block li input").each(function(){
     $(this).prop( "checked", false );
  });

  $("#destino-block li input").each(function(){
     $(this).prop( "checked", false);
  });

    $("#zona-block li input").each(function(){
     $(this).prop( "checked", false);
  });

  lastPlot = "none";

}

$(".resetBtn").click(function() {
  //code before the pause
    clearAll();
});

$("#downloadOD").click(function() {
  const rows = matODdownload;

  let csvContent = "data:text/csv;charset=utf-8,";

  rows.forEach(function(rowArray) {
    let row = rowArray.join(",");
    csvContent += row + "\r\n";
  });

  var encodedUri = encodeURI(csvContent);
  var link = document.createElement("a");
  link.setAttribute("href", encodedUri);
  link.setAttribute("download", "Matriz_OD.csv");
  document.body.appendChild(link); // Required for FF

  link.click();
});

function arrayOD(originArray, destinyArray, odJson) {
  matODdownload = [];

  totalSum = 0;

  var matrixOD = [];

  for (var i = 0; i < originArray.length + 1; i++) {
    var origin = originArray[i - 1];
    var lineOD = [];

    if (i == 0) {
      lineOD = destinyArray.slice();
      lineOD.unshift("");
    } else {
      lineOD.push(originArray[i - 1]);
      for (var j = 0; j < destinyArray.length; j++) {
        var destiny = destinyArray[j];
        if (origin != "" && destiny != "") {
          if (
            odJson[origin] != undefined &&
            odJson[origin][destiny] != undefined
          ) {
            var value = 0;

            if ($("#coletivo").is(":checked")) {
              if ($("#horapico").is(":checked")) {
                value += odJson[origin][destiny].TC_PPM;
              } else {
                value += odJson[origin][destiny].TC_total;
              }
            }
            if ($("#individual").is(":checked")) {
              if ($("#horapico").is(":checked")) {
                value += odJson[origin][destiny].TI_PPM;
              } else {
                value += odJson[origin][destiny].TI_total;
              }
            }

            lineOD.push(Math.round(value));
            totalSum += value;
          } else {
            lineOD.push(0);
          }
        } else {
          lineOD.push(0);
        }

      }
    }
    matrixOD.push(lineOD);
    if (i == 0) {
      matODdownload.push(["OD"]);
      matODdownload[0].push(destinyArray);
    } else {
      matODdownload.push([].concat(lineOD));
    }
  }

  $("#ODtotal").html("Total: " + Math.round(totalSum));
  return matrixOD;
}

function interestPlot(){
  
  offsetL = document.getElementById("container").offsetLeft + 20;
  offsetT = document.getElementById("container").offsetTop + 10;
  
  $( ".centroid" ).remove();
  $( ".line-centroid" ).remove();

  var fileURL = "";
  $(".macrozona").each(function() {
    if ($(this).attr("clicked") > 0) {

      var val1 = 0;
      var mz = $(this).attr("macrozona").toString();
      var mzName = " "+$(this).attr("title").toString()+" : "+ $(this).attr("macrozona").toString()+" - ";
      var baseColor;
      var filePath = '';

      // creating the legend

       if ($("#destEsp").is(":checked")) {

         var destiny = destinyOD[mz];

         if ($("#horapicoDV").is(":checked")) {
           val1 = Math.round(100*destiny.TC_total/(destiny.TC_total + destiny.TI_total));
         } else {
           val1 = Math.round(100*destiny.TC_PPM/(destiny.TC_PPM + destiny.TI_PPM));
         }

          baseColor = 380;
          filePath = "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/mz_array_do.json";

        }else{

          var origin = originOD[mz];

          if ($("#horapicoDV").is(":checked")) {
            val1 = Math.round(100*origin.TC_total/(origin.TC_total + origin.TI_total));
          } else {
            val1 = Math.round(100*origin.TC_PPM/(origin.TC_PPM + origin.TI_PPM));
          }

          baseColor = 250;
          filePath = "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/mz_array.json";
        }

      if($("#container-legend svg").length){
        $("#container-legend svg").remove();
      }

      var val2 = 100-val1;

      // creating the main representation

      d3.json(filePath,function(error, jsonFile) {

          var dataFile = jsonFile[mz];

          var coords = dataFile[0].coordinates;

          var tc_total_max = dataFile[0].TC_total_max;
          var ti_total_max = dataFile[0].TI_total_max;
          var tc_ppm_max = dataFile[0].TC_PPM_max;
          var ti_ppm_max = dataFile[0].TI_PPM_max;

          var max = 0;
          var ratios = [];

          if ($("#coletivoDV").is(":checked")) {
            if ($("#horapicoDV").is(":checked")) {
              max += tc_ppm_max;
            } else {
              max += tc_total_max;
            }
          }
          if ($("#individualDV").is(":checked")) {
            if ($("#horapicoDV").is(":checked")) {
              max += ti_ppm_max;
            } else {
              max += ti_total_max;
            }
          }

          for(var i=1; i < dataFile.length; i++){

            var obj = dataFile[i];
            var value = 0;

            if ($("#coletivoDV").is(":checked")) {
              if ($("#horapicoDV").is(":checked")) {
                value += obj.TC_PPM;
              } else {
                value += obj.TC_total;
              }
            }
            if ($("#individualDV").is(":checked")) {
              if ($("#horapicoDV").is(":checked")) {
                value += obj.TI_PPM;
              } else {
                value += obj.TI_total;
              }
            }

            var ratio  = value/max;
            ratios.push(ratio);
          }

          //correcting an error
          dataFile.shift();

          g
          .selectAll("line")
          .data(dataFile)
          .enter()
          .append("line")
          .attr("class", "line-centroid")
          .attr("x1", function(d) {
            return projection(coords)[0];
          })
          .attr("y1", function(d) {
            return projection(coords)[1];
          })
          .attr("x2", function(d) {
            if (d.destiny != "self" && d.coordinates) {
              return projection(d.coordinates)[0];
            }
          })
          .attr("y2", function(d) {
            if (d.destiny != "self" && d.coordinates) {
              return projection(d.coordinates)[1];
            }
          })
          .on("mousemove", function(d, i) {

            var mouse = d3.mouse(svg.node()).map(function(d) {
              return parseInt(d);
            });

            tooltip
              .classed("hidden", false)
              .attr(
              "style",
              "left:" +
              (mouse[0] + offsetL) +
              "px;top:" +
              (mouse[1] + offsetT) +
              "px"
            );

            tooltipNum
              .html("nº de viagens: <i style='color:#2a2559;'>"+ Math.round(ratios[i]*max)+"</i>");

            tooltipMunicipio.classed("hidden", true);
            tooltipZone.classed("hidden", true);

          })
            .on("mouseout", function(d, i) {
            tooltip.classed("hidden", true);
          })
          .attr("stroke-linecap", "round")
          .attr("stroke-width", function(d,i) {
            return (10 * ratios[i]);
          })
          .attr("stroke", function(d,i) {
            var color = baseColorFunction(baseColor, ratios[i]);
            return color;
          })
          .attr("ratio", function(d,i) {
            return (ratios[i] || 0);
          });

          g
          .selectAll("circle")
          .data(dataFile)
          .enter()
          .append("circle")
          .attr("class", "centroid")
          .attr("cx", function(d) {
            if (d.destiny != "self" && d.coordinates) {
              return projection(d.coordinates)[0];
            }
          })
          .attr("cy", function(d) {
            if (d.destiny != "self" && d.coordinates) {
              return projection(d.coordinates)[1];
            }
          })
          .attr("r", function(d,i) {
            var radius = 16 * ratios[i];
            return (radius||0);
          })
          .on("mousemove", function(d, i) {

            var mouse = d3.mouse(svg.node()).map(function(d) {
              return parseInt(d);
            });

            tooltip
              .classed("hidden", false)
              .attr(
              "style",
              "left:" +
              (mouse[0] + offsetL) +
              "px;top:" +
              (mouse[1] + offsetT) +
              "px"
            );

            tooltipNum
              .html("nº de viagens: <i style='color:#2a2559;'>"+ Math.round(ratios[i]*max)+"</i>");

            tooltipMunicipio.classed("hidden", true);
            tooltipZone.classed("hidden", true);

          })
            .on("mouseout", function(d, i) {
            tooltip.classed("hidden", true);
          })
          .attr("fill",function(d,i) {
              var color = baseColorFunction(baseColor, ratios[i]);
              if(mz == d.destiny){
                   color = "url(#svgGradient4)"
                }
              return color;
          })
          .style("stroke", function(d,i){
            if(mz == d.destiny){
                   return baseColorFunction(baseColor, ratios[i]);
                }
          })
          .style("stroke-width", function(d,i){
              if(mz == d.destiny){
                     return 1;
                  }
          })
          .attr("ratio", function(d,i) {
              return (ratios[i] || 0);
          });

          var colorGrad =[];

          for(var i = 0; i < 6; i++){
            var color = baseColorFunction(baseColor, i/5);
            colorGrad.push(color);
          }

          var legendSVGright = d3.select('#container-legend')
                            .append("svg")
                            .attr("id","legendRight")
                            .attr("width",600)
                            .attr("height", height/5);

          zoneLegend(mzName, legendSVGright,val1, val2);

          var legendSVGleft = d3.select('#container-legend')
                              .append("svg")
                              .attr("id","legendLeft")
                              .attr("width", 600)
                              .attr("height", height/5);

          var legendLeft = legendSVGleft.append("g");

          legendLeft.selectAll("circle")
          .data(colorGrad)
          .enter()
          .append("circle")
          .attr("cx", function(d,i){
            return (10+ 51*(7-i));
          })
          .attr("cy", 35)
          .attr("r", function(d,i){
            return(16*(i/5))
          })
          .style("stroke", "#ccc")
          .style("fill", function(d){
            return d;
          });

          legendLeft.selectAll("text")
          .data(colorGrad)
          .enter()
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", function(d,i){
            return (51*(7-i));
          })
          .attr("y", 15)
          .text(function(d,i){
            if(i){
              return (Math.round((i/5)*max));
            }
          })
          .style("fill",function(d,i){
            if(i%2){
              return "#888";
            }else{
              return "#666";
            }
          });

          legendLeft
          .append("text")
          .attr("font-size", "0.75em")
          .attr("x", function(){
            return (30);
          })
          .attr("y", 35)
          .text("viagens")
          .style("fill","#888");

        });
      }
    });
  
  //redraw();
  $("#container-legend").css('display','flex');
  $("#top-content").hide();
  
  lastPlot = "interest";
}

$("#interestBtn").click(function() {
     interestPlot();
});

  $("#selectedBtn").click(function() {
    if ($("table").length != 0) {
      $("table").remove();
    }

    let selectedArray = [];
    let originArray = [];
    let destinyArray = [];

    $(".macrozona").each(function() {
      var id = $(this).attr("macrozona");
      var node = d3.select(this);

        if (node.attr("isOrigin")>0) {
          selectedArray.push(id);
          originArray.push(id);
        };

        if(node.attr("isDestiny")>0) {
          selectedArray.push(id);
          destinyArray.push(id);
        };
    });

    originArray.join("").split("");
    destinyArray.join("").split("");

    fetchJSONFile(
      "https://raw.githubusercontent.com/lucaspdfborges/geojson/master/support/macrozona_od.json",
      function(data) {
        var matOD = [];
        matOD = arrayOD(originArray, destinyArray, data);
        createOD(matOD);
        $("#results").goTo();
      }
    );
  });

  function turnBoxOn(idString){
    $('#'+idString).height('inherit');
    $("#"+idString+" :button").attr("disabled", false);
    $("#"+idString+" :input").attr("disabled", false);
    $("#"+idString).addClass('grid-container').removeClass('grid-container-blocked');

    $('#'+idString+" div.container-block").first().fadeTo(200, 1.0);
    $('#'+idString+" div.container-block").first().show();
    $('#'+idString+" div.container-title h3").first().css("color","#2a2559");
    $('#'+idString+" div.container-title").first().css("background","repeating-linear-gradient(45deg,#e6e4ec,#e6e4ec 10px,#f5f5f5 10px,#f5f5f5 20px)");

  }

  function turnBoxOff(idString){
    $('#'+idString).height('3.5em');
    $("#"+idString+" :button").attr("disabled", true);
    $("#"+idString+" :input").attr("disabled", true);
    $("#"+idString).addClass('grid-container-blocked').removeClass('grid-container');
    $('#'+idString+" div.container-title h3").first().css("color","#7b7887");
    $('#'+idString+" div.container-title").first().css("background","#fff");
    $('#'+idString+" div.container-block").each(function(){
      $(this).hide();
    });
    $('#'+idString+" input").each(function(){
      $(this).prop( "checked", false );
    });
  }

$(".container-title").on("click",function(){
  //Turning off all active boxes
  var isOn = $(this).parent().attr("class") == "grid-container-blocked";
  var boxesOn = $(".grid-container");
  for(var i = 0; i < boxesOn.length; i++){
      var boxID = boxesOn.attr('id');
      turnBoxOff(boxID);
  }

  //Turning On/Off the clicked box
  var thisBoxID = $(this).parent().attr('id');
  if(isOn){
    turnBoxOn(thisBoxID);
  }else{
    turnBoxOff(thisBoxID);
  }

  clearAll();

});

  document.querySelector(".table-scroll").addEventListener("scroll", function(e) {
    this.querySelector(".thead-col").style.left = this.scrollLeft + "px";
    this.querySelector(".thead-row").style.top = this.scrollTop + "px";
    this.querySelector(".thead-corner").style.top = this.scrollTop + "px";
    this.querySelector(".thead-corner").style.left = this.scrollLeft + "px";
  });

//container blocks

$(".container-block").find("input").on("click", function(){

  var thisBlock = $(this).closest(".container-block");

 if($(this).is(":checked")){
  thisBlock.css("border-left","2px solid #e6e4ec");
 }

  var nextBlock = $(".container-block").eq( $(".container-block").index(thisBlock) + 1 );

  nextBlock.fadeTo(200, 1.0);
  nextBlock.show();
});

  //Download SVG

  function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], {type:"image/svg+xml;charset=utf-8"});
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
  }

  $("#downloadSvg").on("click",function(){
    var svgEl = document.getElementById("svgChart");
    saveSvg(svgEl, "mapa.svg");
  });

  // Mobile corrections
$("#heatMapBtn").change(function(){

  var matOD = [];
  var max = 0;

    if ($(this).is(":checked")){

      $("td").each(function(){
        var value = $(this).find("div").first().html();
        matOD.push(value);
      });

      max = Math.max(...matOD);

      $("td").each(function(){
         var value = $(this).find("div").first().html();
        var color = "rgba(220,80,50,"+(0.6*value/max)+")";
        $(this).find("div").first().css("background-color", color);
      });

    }else{
         $("td").each(function(){
            var color = "rgba(250,250,250,0)";
            $(this).find("div").first().css("background-color", color);
          });
    }
});

$("#origem-block").on("click", function(){
  mouseSelectorOD = "origin";
  $(this).find("h4").css("color","#167");
  $(this).css("background-image","linear-gradient( rgba(100,250,250,0.1), rgba(255, 255, 255,0))");
  $("#destino-block").css("background-image","none");
  $("#destino-block").find("h4").css("color","#2a2559");
});

$("#destino-block").on("click", function(){
  mouseSelectorOD = "destiny";
  $("#origem-block").css("background-image","none");
  $("#origem-block").find("h4").css("color","#2a2559");
  $(this).find("h4").css("color","#A55");
  $(this).css("background-image","linear-gradient( rgba(250,120,150,0.1), rgba(255, 255, 255,0))");

  if($("#destino-block input:checkbox:checked").length > 0 && $("#origem-block input:checkbox:checked").length > 0){
    $("#selectedBtn").attr("disabled", false);
    $("#selectedBtn").css("opacity", "1.0");
  }else{
     $("#selectedBtn").attr("disabled", true);
     $("#selectedBtn").css("opacity", "0.3");
  };
});


$("#origem-todos").on("change", function(){

  if($(this).is(":checked")){

     $(this).parent("li").siblings().each(function(index, element){
       $(element).find("input").prop("checked", true);
    });

    $(".macrozona").each(function(){
      var node = d3.select("#"+$(this).attr("id"));
      node.attr("isOrigin", 1);

      let isDestiny = node.attr("isDestiny")>0;
      let isOrigin =  node.attr("isOrigin")>0;

        if(isDestiny && !isOrigin){
          node.style("fill", "url(#svgGradient1)");
        }else if(!isDestiny && isOrigin){
          node.style("fill", "url(#svgGradient2)");
        } else if(isDestiny && isOrigin){
           node.style("fill", "url(#svgGradient3)");
        } else{
          node.style("fill", "rgba(219,220,222,0.5)");
        }
    });

  }else{
     $(this).parent("li").siblings().each(function(index, element){
       $(element).find("input").prop("checked", false);
    });

    $(".macrozona").each(function(){
      var node = d3.select("#"+$(this).attr("id"));
      node.attr("isOrigin", 0);

       let isDestiny = node.attr("isDestiny")>0;
      let isOrigin =   node.attr("isOrigin")>0;

        if(isDestiny && !isOrigin){
          node.style("fill", "url(#svgGradient1)");
        }else if(!isDestiny && isOrigin){
          node.style("fill", "url(#svgGradient2)");
        } else if(isDestiny && isOrigin){
           node.style("fill", "url(#svgGradient3)");
        } else{
          node.style("fill", "rgba(219,220,222,0.5)");
        }
    });
  }
});


$("#destino-todos").on("change", function(){

  if($(this).is(":checked")){

     $(this).parent("li").siblings().each(function(index, element){
       $(element).find("input").prop("checked", true);
    });

    $(".macrozona").each(function(){
      var node = d3.select("#"+$(this).attr("id"));
      node.attr("isDestiny", 1);

      let isDestiny = node.attr("isDestiny")>0;
      let isOrigin =   node.attr("isOrigin")>0;

        if(isDestiny && !isOrigin){
          node.style("fill", "url(#svgGradient1)");
        }else if(!isDestiny && isOrigin){
          node.style("fill", "url(#svgGradient2)");
        } else if(isDestiny && isOrigin){
           node.style("fill", "url(#svgGradient3)");
        } else{
          node.style("fill", "rgba(219,220,222,0.5)");
        }
    });

  }else{
     $(this).parent("li").siblings().each(function(index, element){
       $(element).find("input").prop("checked", false);
    });

    $(".macrozona").each(function(){
      var node = d3.select("#"+$(this).attr("id"));
      node.attr("isDestiny", 0);

      let isDestiny = node.attr("isDestiny")>0;
      let isOrigin =   node.attr("isOrigin")>0;

        if(isDestiny && !isOrigin){
          node.style("fill", "url(#svgGradient1)");
        }else if(!isDestiny && isOrigin){
          node.style("fill", "url(#svgGradient2)");
        } else if(isDestiny && isOrigin){
           node.style("fill", "url(#svgGradient3)");
        } else{
          node.style("fill", "rgba(219,220,222,0.5)");
        }
    });
  }
});

$(".scroll-pad-left").first().height($("#container").height());
$(".scroll-pad-right").first().height($("#container").height());

function scrollToLi(elementID) {
  var elmnt = document.getElementById(elementID);
  elmnt.scrollIntoView({ block: 'end', behavior: 'smooth' });
}

$("#indicadoresBox input").on("change",function(){
  if(lastPlot=="originTrips"){
    plotOriginTrips();
  } else if (lastPlot=="destinyTrips"){
    plotDestinyTrips();
  } else if (lastPlot=="flowOD"){
    plotFlowOD();
  }
});

$("#interesseBox input").on("change",function(){
  if(lastPlot=="interest"){
    
    var node = d3.select(lastZone);
    node.attr("clicked", 1);
    
    interestPlot();
    
    $(inputID).prop( "checked", true );
  }
});

function responsivefy(svg) {
  
  var oldWidth = $("#container").width();

  const container = d3.select(svg.node().parentNode),
      width = parseInt(svg.style('width'), 10),
      height = parseInt(svg.style('height'), 10),
      aspect = width / height;

  svg.attr('viewBox', `0 0 ${width} ${height}`)
      .attr('preserveAspectRatio', 'xMinYMid')
      .call(resize);
 
  d3.select(window).on(
      'resize.' + container.attr('id'), 
      resize
  );
 
  function resize() {
      const w = parseInt(container.style('width'));
      scaleResize = w/oldWidth;
      svg.attr('width', w);
      svg.attr('height', Math.round(w / aspect));
  }
  
}

