//-----------------------------------------------------------------------------
//  index.js
// 
//  Description:  This program parses xlsx files to construct NODE and EDGE 
//                components.  The format was adopted from Hyperscape by 
//				  Anthony Zhao. The resulting parsed data is used to render 
//                the visualization. Functional categories and subnetworks are
//				  displayed based on user selection of cellular location.
//                                
//-----------------------------------------------------------------------------
//  2020  Minh An Ho
//-----------------------------------------------------------------------------


if ('undefined' != typeof screen) {	

var element;
var cellPlace;
var familyCols = "";
var famData = {"nodes": []};

var w = screen.width*0.62;
var h = screen.height*0.62;

var error = [];

//Sets width of nodes
var circleWidth = 20;

//Sets font
var fontFamily = 'Bree Serif',
    fontSizeHighlight = '1.5em',
	fontSizeNormal = '1em';

//As outlined in COG
var funcCategories = {
	"J": " [J] Translation, ribosomal structure and biogenesis ",
	"A": " [A] RNA processing and modification ",
	"K": " [K] Transcription ",
	"L": " [L] Replication, recombination and repair ",
	"B": " [B] Chromatin structure and dynamics ",
	"D": " [D] Cell cycle control, cell division, chromosome partitioning ",
	"Y": " [Y] Nuclear structure ",
	"V": " [V] Defense mechanisms ",
	"T": " [T] Signal transduction mechanisms ",
	"M": " [M] Cell wall/membrane/envelope biogenesis ",
	"N": " [N] Cell motility ",
	"Z": " [Z] Cytoskeleton ",
	"W": " [W] Extracellular structures ",
	"U": " [U] Intracellular trafficking, secretion, and vesicular transport ",
	"O": " [O] Posttranslational modification, protein turnover, chaperones ",
	"C": " [C] Energy production and conversion ",
	"G": " [G] Carbohydrate transport and metabolism ",
	"E": " [E] Amino acid transport and metabolism ",
	"F": " [F] Nucleotide transport and metabolism ",
	"H": " [H] Coenzyme transport and metabolism ",
	"I": " [I] Lipid transport and metabolism ",
	"P": " [P] Inorganic ion transport and metabolism ",
	"Q": " [Q] Secondary metabolites biosynthesis, transport and catabolism ",
	"R": " [R] General function prediction only ",
	"S": " [S] Function unknown ",
		};


//Palette
var palette = {
				"red": "#FF0000",
				"blue": "#3E87D1",
				"green": "#33CC33",
				"yellow": "#FFFF00",
				"pink": "#FF99FF",
				"purple": "#E5CCFF",
				"black": "#000000",
				"gray": "#D2D2D2",
				"brown": "#663300",
				"orange": "#FF7519",
				"white": "#FFFFFF",
			  	};

//Polygons
var polygon = {
				"triangle": " 20,0 40,40 0,40 ",
				"triangle-up": " 20,0 40,40 0,40 ",
				"triangle-down": " 0,0 40,0 20,40 ",
				"square": " 0,0 40,0 40,40 0,40",
				"diamond": " 0,20 20,0 40,20 20,40 ",
				"pentagon": " 20,0 40,17 31,40 9,40 0,17",
				"hexagon": " 20,0 40,9 40,31 20,40 0,31 0,9 ",
				"octagon": " 12,0 28,0 40,12 40,28 28,40 12,40 0,28 0,12 "
			  };
							  
var center_polygon = {
						"triangle": "-20, -20",
					    "triangle-up": "-20, -20",
				        "triangle-down": "-20, -20",
						"square": "-20, -20",
						"diamond": "-20, -20",
						"pentagon": "-20, -20",
						"hexagon": "-20, -20",
				        "octagon": "-20, -20"
				      };

var data = {};
data["textInput"] = "\t";
data["textName"] = "\t";
data["textColor"] = "\t";
data["textShape"] = "\t";
data["textCell"] = "\t";
data["textFunc"] = "\t";

var zoom;
var zoom2;


//Path for creating a group
var groupPath;

var	margin;

//Canvas
var vis;
var network;

var groups = [];
var nodes1 = [];
var nodes2 = [];
var nodes3 = [];
var nodes4 = [];
var nodes5 = [];
var links1 = [];
var links2 = [];
var links3 = [];
var links4 = [];
var links5 = [];

//Create force for layer 1
var f1;
var f2; 
var f3; 
var f4; 
var f5; 

//Starts drag for layer 1
var drag1;

//Starts drag for each respective internal force
var drag2;
var drag3;
var drag4;
var drag5;

var inputData1;

//Creates links
var link1;
var link2;
var link3;
var link4;
var link5;

//Creates nodes
var node1;
var node2;
var node3;
var node4;
var node5;

document.getElementById("myText").innerHTML = "all nodes";

createCanvas("#canvas");

//Functions===================================================================================================================

//Next two functions taken from https://stackoverflow.com/questions/3426404/create-a-hexadecimal-colour-based-on-a-string-with-javascript
function hashCode(str) { // java String#hashCode
    var hash = 0;
    for (var i = 0; i < str.length; i++) {
       hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return hash;
}
function intToRGB(i){
    var c = (i & 0x00FFFFFF)
        .toString(16)
        .toUpperCase();

    return "00000".substring(0, 6 - c.length) + c;
}

//Adapted from https://stackoverflow.com/questions/57467704/reading-excel-file-into-array-using-javascript#comment101432232_57468260

//Open given input xlsx file and assign to variable to produce graph
$("#input").on("change", function (e) {
	var file = e.target.files[0];
	// input canceled, return
	if (!file) return;
	
	var FR = new FileReader();
	FR.onload = function(e) {
		var data = new Uint8Array(e.target.result);
		var workbook = XLSX.read(data, {type: 'array'});
		var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		
		// header: 1 instructs xlsx to create an 'array of arrays'
		xlsx_output = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
		if(xlsx_output.length <= 2000){
			parseXLSX(xlsx_output);

		}else{
			alert("Only 2000 lines allowed for rendering");
		}
	};
FR.readAsArrayBuffer(file);
});

//Open given family xlsx file and assign to variable for processing to produce pie chart colouring
$("#familyInput").on("change", function (e) {
	var file = e.target.files[0];
	// input canceled, return
	if (!file) return;
	
	var FR = new FileReader();
	FR.onload = function(e) {
		var data = new Uint8Array(e.target.result);
		var workbook = XLSX.read(data, {type: 'array'});
		var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		
		// header: 1 instructs xlsx to create an 'array of arrays'
		xlsx_output = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
		parseFamXLSX(xlsx_output);
	};
FR.readAsArrayBuffer(file);
});

//Open given cell xlsx file and assign to variable for processing to produce buttons/filtering
$("#cellInput").on("change", function (e) {
	var file = e.target.files[0];
	// input canceled, return
	if (!file) return;
	
	var FR = new FileReader();
	FR.onload = function(e) {
		var data = new Uint8Array(e.target.result);
		var workbook = XLSX.read(data, {type: 'array'});
		var firstSheet = workbook.Sheets[workbook.SheetNames[0]];
		
		// header: 1 instructs xlsx to create an 'array of arrays'
		xlsx_output = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });
		parseCellXLSX(xlsx_output);
	};
FR.readAsArrayBuffer(file);
});

function parseXLSX(file_array){
	data["textInput"] = "";
	data["textFunc"] = "";


	for (var i = 1; i< file_array.length; i++){
		data["textInput"] = data["textInput"].concat("        NODE\t", file_array[i][3], "\n");
		data["textFunc"] = data["textFunc"].concat(file_array[i][3], " = ", file_array[i][5], "\n");
		if (file_array[i][2] != "NO"){
			data["textName"] = data["textName"].concat(file_array[i][3], " = ", file_array[i][1],"\n");
		}
	}
	for (var i = 1; i< file_array.length; i++){
		if(typeof file_array[i][4] != 'undefined'){
			data["textInput"] = data["textInput"].concat("        EDGE\t", file_array[i][3], "\t", file_array[i][4],"\n");
		}
	}	
	ParseUpdateDraw(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"]);
	updateHeaders(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"], data["textFunc"]);
}

function parseCellXLSX(file_array){
	data["textCell"] = "";

	for (var i = 1; i< file_array.length; i++){
		data["textCell"] = data["textCell"].concat(file_array[i][0], " = ", file_array[i][1], "\n");
	}
	ParseUpdateDraw(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"]);

	//Clear previous buttons (if available) when cell file is changed
	while(document.getElementById("check_cells").firstChild){
		document.getElementById("check_cells").removeChild(document.getElementById("check_cells").firstChild);
	}

	var cell = data["textCell"];
	var cellButtons = [];
	cell = cell.split("\n");

	//Collect unique GO:CC terms 
	for (var k = 0; k < cell.length; k++){
		var cell_name = cell[k].split(" = ");
		if(cell_name[0] != undefined && cell_name[1] != undefined){
			cell_name[0] = cell_name[0].trim(" ");
			cell_name[1] = cell_name[1].trim(" ");
		}
		if (!cellButtons.includes(cell_name[1])&& cell_name[1] != undefined){
			cellButtons.push(cell_name[1]);
		}
	}
	
	//Variable to ensure there is no more than 10 cell location buttons
	var buttonNum = Math.min(cellButtons.length, 10);

	//Dynamically create cell location buttons
	for (var x = 0; x < buttonNum; x++){
		var currentButton = document.createElement("button");
		currentButton.id = cellButtons[x];  
		currentButton.value = cellButtons[x];  
		currentButton.innerHTML = cellButtons[x];
		currentButton.style.width = "100%";
		currentButton.type= "submit";
		currentButton.class = "btn-group button";
		var r = cellButtons[x];

		//Update cell location header and update graph
		  (function(r){
			currentButton.onclick = function () {
				document.getElementById("myText").innerHTML = r;
				cellPlace = r;
				if (!(typeof input=== 'undefined')){
					ParseUpdateDraw(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"]);
					updateHeaders(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"], data["textFunc"]);
				}
			  };
		  })(r);
		//Add buttons to document
		document.getElementById("check_cells").appendChild(currentButton); 

		//Show cell map image and functional category headers
		document.getElementById("cell_map").style = "display:inline"; 
		document.getElementById("locHeader").style = "font-family:avenir; padding-top:15px;margin-left: 10%; display:inline;"; 
	}
}


function parseFamXLSX(file_array){

	for (var i = 1; i< file_array.length; i++){
		familyCols = familyCols.concat(file_array[i][0], " = ", file_array[i][1], " = ", file_array[i][2], "\n");
	}
	familyCols = familyCols.split("\n");
	makeNodeFams();
	//ParseUpdateDraw(data["textInput"], data["textName"],data["textColor"],data["textShape"], data["textCell"]);
}

//Creating a JSON variable to hold pie chart data, recreated from:
//https://bl.ocks.org/kgeorgiou/68f864364f277720252d0329408433ae
function makeNodeFams(){
	var pieMade = [];
	for (var x = 1; x< familyCols.length; x++){
		var nodefamily = familyCols[x].split(" = ");
		if(nodefamily[0] != undefined && nodefamily[1] != undefined && nodefamily[2] != undefined){
			nodefamily[0] = nodefamily[0].trim(" ");
		}
		if (!(pieMade.includes(nodefamily[0])) && nodefamily[0] != ""){
			famData["nodes"].push({
				"id": nodefamily[0],
				"pieChart": []
			})
			pieMade.push(nodefamily[0]);
			for (var y = 1; y< familyCols.length; y++){
				var nodefamily2 = familyCols[y].split(" = ");
				if(nodefamily2[0] != undefined && nodefamily2[1] != undefined && nodefamily2[2] != undefined){
					nodefamily2[0] = nodefamily2[0].trim(" ");
					nodefamily2[1] = nodefamily2[1].trim(" ");
					nodefamily2[2] = nodefamily2[2].trim(" ");
				}
				if (nodefamily2[0] == nodefamily[0]){
					famData["nodes"][pieMade.length - 1]["pieChart"].push({ "color": nodefamily2[1], "percent": nodefamily2[2]});
				}
			}
		}
	}
}


function createCanvas(canvasname) {

zoom = d3.behavior.zoom()
            .scaleExtent([0.01, 20])
            .on("zoom", zoom);

//Path for creating a group
groupPath = function(d) {return "M" + d3.geom.hull(d.values.map(function(i) { return [i.x, i.y]; })).join("L") + "Z";};



var	margin = {top: 30, right: 20, bottom: 30, left: 50},
	width = 400 - margin.left - margin.right,
	height = 220 - margin.top - margin.bottom;

//Canvas
vis = d3.select(canvasname)
			.append("svg:svg")
			.attr("class", "canvas")
			.attr("width", width + margin.left + margin.right)
			.attr("height", height + margin.top + margin.bottom)
			.call(zoom)
			.on("dblclick.zoom", null);

d3.select("network").remove();

network = vis.append("g")
				 .attr("class", "network")
				 .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

groups = [];
nodes1 = [];
nodes2 = [];
nodes3 = [];
nodes4 = [];
nodes5 = [];
links1 = [];
links2 = [];
links3 = [];
links4 = [];
links5 = [];

//Create force for layer 1
f1 = d3.layout.force()
			.nodes(nodes1)
			.links(links1)
			.gravity(0.8)
			.charge(function(d){return d.w*-15000;})
			.linkDistance(function(d){return d.l;})
			.size([w, h])
			.on("tick", tick1)
			.start();
f2 = d3.layout.force()
				  .nodes(nodes2)
				  .links(links2)
				  .size([w, h])
				  .gravity(0)
				  .linkStrength(0)
				  .charge(-20000)
				  .on("tick", tick2)
				  .start(); 
f3 = d3.layout.force()
				  .nodes(nodes3)
				  .links([])
				  .size([w, h])
				  .gravity(0)
				  .charge(-20000)
				  .on("tick", tick3)
				  .start(); 
f4 = d3.layout.force()
				  .nodes(nodes4)
				  .links([])
				  .size([w, h])
				  .gravity(0)
				  .charge(-20000)
				  .on("tick", tick4)
				  .start(); 
f5 = d3.layout.force()
				  .nodes(nodes5)
				  .links([])
				  .size([w, h])
				  .gravity(0)
				  .charge(-20000)
				  .on("tick", tick5)
				  .start(); 

//Starts drag for layer 1
drag1 = f1.drag().on("dragstart", dragstart);

//Starts drag for each respective internal force
drag2 = iDrag(f2);
drag3 = iDrag(f3);
drag4 = iDrag(f4);
drag5 = iDrag(f5);

inputData1 = parseInput(data["textInput"], data["textName"], data["textColor"], data["textShape"], data["textCell"]);

addData(groups, inputData1["groups"]);
addData(nodes1, inputData1["nodes1"]);
addData(nodes2, inputData1["nodes2"]);
addData(nodes3, inputData1["nodes3"]);
addData(nodes4, inputData1["nodes4"]);
addData(nodes5, inputData1["nodes5"]);

addData(links1, inputData1["links1"]);
addData(links2, inputData1["linksOther"]);

//Creates links
link1 = createLink(links1, 1);
link2 = createLink(links2, 2);
link3 = createLink(links3, 3);
link4 = createLink(links4, 4);
link5 = createLink(links5, 5);

//Creates nodes
node1 = createNodes(nodes1, 1);
node2 = createNodes(nodes2, 2);
node3 = createNodes(nodes3, 3);
node4 = createNodes(nodes4, 4);
node5 = createNodes(nodes5, 5);
	
draw();
}

//Print selected cell location	
function getMyButtons(myInputID, myInput) {
	//element = document.getElementById(myInputID);
	//element.value = myInput;
	document.getElementById("myText").innerHTML = myInput;

	cellPlace = myInput;

	var input = data["textInput"];
	var name = data["textName"];
	var color = data["textColor"];
	var shape = data["textShape"];
	var cell = data["textCell"];
	var func = data["textFunc"];
	if (input!= undefined){
		updateHeaders(input, name,color,shape, cell, func);
		ParseUpdateDraw(input, name,color,shape, cell);
	}
}

function updateHeaders(input, name, color, shape, cell, func){
	var loaded_cell_nodes = [];
	var func_names = [];

	cell = cell.split("\n");
	input = input.split("\n");

	for (var l = 0; l < input.length; l++){
		var input_name = input[l].split("\t");
		if(input_name[0] != undefined && input_name[1] != undefined){
			input_name[0] = input_name[0].trim(" ");
			input_name[1] = input_name[1].trim(" ");
		}
		for (var j = 0; j < cell.length; j++){
			var node_name = cell[j].split(" = ");
			if(node_name[0] != undefined && node_name[1] != undefined){
				node_name[0] = node_name[0].trim(" ");
				node_name[1] = node_name[1].trim(" ");
			}
			//Add nodes all nodes if there is no cell file added yet
			if(cell.length == 1){
				if (!(loaded_cell_nodes.includes(input_name[1]))){
					loaded_cell_nodes.push(input_name[1]);
				}
			}
			//Add the id if the GO:CC matches the cellPlace
			if (node_name[1]==cellPlace || (typeof cellPlace === 'undefined')|| cellPlace=="all nodes" ){
				if (!(loaded_cell_nodes.includes(node_name[0]))){
					loaded_cell_nodes.push(node_name[0]);
				}
			}
		}
	}			
	func = func.split("\n");
	for (var k = 0; k < func.length; k++){
		var func_name = func[k].split(" = ");
		if(func_name[0] != undefined && func_name[1] != undefined){
			func_name[0] = func_name[0].trim(" ");
			func_name[1] = func_name[1].trim(" ");
		}
		//Add unique functional categories if they match the cellPlace (in the match array)
		if(loaded_cell_nodes.includes(func_name[0])){
			if(!(func_names.includes(func_name[1]))){
				func_names.push(func_name[1]);
			}
		}
	}

	//Remove old headers when new button is selected
	while(document.getElementById("myDIV").firstChild){
		document.getElementById("myDIV").removeChild(document.getElementById("myDIV").firstChild);
	}


	while(document.getElementById("canvas2").firstChild){
		document.getElementById("canvas2").removeChild(document.getElementById("canvas2").firstChild);
	}
	
	//Use matched functional categories as headers
	for (var x = 0; x < func_names.length; x++){
			
		var funcHead = document.createElement("h3");
		funcHead.innerHTML = funcCategories[func_names[x]];  
		funcHead.style.marginLeft= "10%";
		funcHead.style.fontFamily="avenir";
		document.getElementById("myDIV").appendChild(funcHead); 


		/*var newcanvas = document.createElement("canvas");
		newcanvas.id = "#canvas" + (x+1).toString();
		newcanvas.border = "1px dotted #ccc";
		newcanvas.marginLeft = "10%";
		newcanvas.width = "80%";
		newcanvas.height = "60%";
		console.log(newcanvas.id);
		document.getElementById("canvas").appendChild(newcanvas); 
		createCanvas(newcanvas.id);

		var input = data["textInput"];
		var name = data["textName"];
		var color = data["textColor"];
		var shape = data["textShape"];
		var cell = data["textCell"];
		var func = data["textFunc"];
		ParseUpdateDraw(input, name,color,shape, cell);*/
	}
}


function draw(){
	drawLink(link1, 1, f1);
	drawLink(link2, 2, f2);
	drawNode(node1, 1, f1, drag1);
	drawNode(node2, 2, f2, drag2);
	drawNode(node3, 3, f3, drag3);
	drawNode(node4, 4, f4, drag4);
	drawNode(node5, 5, f5, drag5);
}	
}
function drawLink(link, layer, force){
	d3.selectAll(".link"+layer).remove();
	link = link.data(force.links(), function(d){ return d.source.id + "-" + d.target.id; });
    link.enter().append("line")
                .attr("class", "link"+layer)
                .attr("id", function(d){return d.id;})
                .attr("stroke", "black")
                .attr("fill", "none")
                .attr("stroke-width", 2)
				.attr('opacity', function(d){if(d.show == "true"){return 0.8;}else{return 0;}});

    link.exit().remove();
	force.start();
}

function drawNode(node, layer, force, drag){
	d3.selectAll(".node"+layer).remove();
	node = node.data(force.nodes(), function(d) {return d.id;});
	 node.enter().append("g")
	 		  //.data(famData["nodes"])
              .attr("class", "node"+layer)
              .attr("id", function(d){return d.id;})
              .attr("focus", function(d, i){return d.focus;})
			  .attr("f", false)
			  .on("dblclick", dblclick)
			  .call(drag);

	//Adds self-edges
	node.append("ellipse")
		.attr("rx", 22)
		.attr("ry", 22)
		.attr("transform", function(d){return "translate(-15, 0)";})
		.attr("stroke", "black")
		.attr("stroke-width", function(d){if(d.selfEdge){return 1;}else{return 0;}})
		.attr("stroke-opacity", 0.8)
		.attr("fill-opacity", 0);

	//Add polygon to node
	node.append("polygon")
	   .attr("points", function(d){return polygon[d.shape];})
	   .attr("transform", function(d){return "translate("+center_polygon["triangle"]+")";})
	   .attr("stroke", function(d){if(d.child.length != 0){return;}else{return "black";}})
   	   .attr("stroke-width", 4)
	   .attr("fill-opacity", function(d, i){if(d.child.length == 0){return 0.8;} else {return 0;}})
	   .attr("fill", function(d){if(d.color in palette){return palette[d.color]}else{return palette["blue"]}})
	   .style("cursor", "move");


	//Add circle to node
	node.append("circle")
	   .attr("r", function(d){if(d.shape in polygon || d.child.length > 0){return 0}else{return circleWidth}})
	   .attr("stroke", "black")
	   .attr("stroke-width", 4)
	   .attr("fill-opacity", 0.8)
	   .attr("fill", function(d){if(d.color in palette){return palette[d.color]}else{return palette["blue"]}})
	   .style("cursor", "move");

	//Add text to node
	node.append("text")
	   .text(function(d, i) { return d.name; })
	   .attr("class", "text-node")
	   .attr("x", function(d, i){ if(d.child.length == 0) { return 0;}else{ return 0; } })
	   .attr("y", function(d, i){ if(d.child.length == 0) { return circleWidth + 25;}else{ return d.w*25+20; } })
	   .attr("font-family",  "Arial")
	   .attr("fill", "black")
	   .attr("font-size", function(d, i){ if(d.child.length == 0) {return  "1.5em"; }else{ return "2.5em"; } })
       .attr("text-anchor", "middle")
       .style("cursor", "move")
       .on("mouseover", function(d){var x= d.id.split("#"); d3.selectAll("#"+x[0]+"__"+x[1]).attr("opacity", 0.9);})
       .on("mouseout", function(d){var x= d.id.split("#"); d3.selectAll("#"+x[0]+"__"+x[1]).attr("opacity", 0.4);});
	node.exit().remove();
  	//Starts force layout
	force.start();


	/*

	//Adapted from https://bl.ocks.org/kgeorgiou/68f864364f277720252d0329408433ae
	// Not currently working
	node.each(function (d){
		var radius = function(d){if(d.shape in polygon || d.child.length > 0){return 0}else{return circleWidth}}
		var halfRadius = radius / 2;
		var halfCircumference = 2 * Math.PI * halfRadius;

		var nodeElement = d3.select(this);
		var percentages = d.pieChart;
		var percentToDraw = 0;
		for (var p in percentages) {
			percentToDraw += percentages[p].percent;
			var thiscolor = "#"
			nodeElement.attr("r", halfRadius)
				.attr("fill", 'transparent')
				.style('stroke', thiscolor += intToRGB(hashCode(percentages[p].color)))
				.style('stroke-width', radius)
				.style('stroke-dasharray',
						halfCircumference * percentToDraw / 100
						+ ' '
						+ halfCircumference);

		}
	});*/
	
}


function tick1(e){
	f2.start();
	f3.start();
	f4.start();
	f5.start();
  
	d3.selectAll(".node1").attr("transform", function(d, i) {
		return "translate(" + d.x + "," + d.y + ")"; 
	});

	d3.selectAll(".link1").attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });

	d3.selectAll(".network").selectAll("path")
		   .data(groups)
		   .attr("d", groupPath)
		   .enter()
			.insert("path", "g")
			.attr("id", function(d){var x = d.id.split("#"); return x[0]+"__"+x[1]})
			.attr("fill", function(d){if(d.color in palette){return palette[d.color]}else{return palette["blue"]}})
			.attr("stroke", function(d){if(d.color in palette){return palette[d.color]}else{return palette["blue"]}})
		  	.attr("stroke-width", function(d, i){ return ((d.w)*30)+30; })
			.attr("stroke-linejoin", "round")
			.attr("opacity", 0.4)
			.on("mouseover", groupsMouseover)
			.on("mouseout", groupsMouseout);
	
}

function tick2(e){
	d3.selectAll(".node2").attr("transform", function(d, i) {
		if(!d.f){
			var k = 6 * e.alpha;
			d.y += (nodes1[d.focus].y - d.y) * k;
			d.x += (nodes1[d.focus].x - d.x) * k;
		}
		return "translate(" + d.x + "," + d.y + ")";
	});


	d3.selectAll(".link2").attr("x1", function(d) { return d.source.x; })
	.attr("y1", function(d) { return d.source.y; })
	.attr("x2", function(d) { return d.target.x; })
	.attr("y2", function(d) { return d.target.y; });
	
	
	d3.selectAll(".network").selectAll("path")
		   .data(groups)
		   .attr("d", groupPath)
}

function tick3(e){
	d3.selectAll(".node3").attr("transform", function(d, i) {
		if(!d.f){
			var k = 6 * e.alpha;
			d.y += (nodes2[d.focus].y - d.y) * k;
			d.x += (nodes2[d.focus].x - d.x) * k;
		}
		return "translate(" + d.x + "," + d.y + ")";
	});

	d3.selectAll(".network").selectAll("path")
		   .data(groups)
		   .attr("d", groupPath)
}

function tick4(e){
	d3.selectAll(".node4").attr("transform", function(d, i) {
		if(!d.f){
			var k = 6 * e.alpha;
			d.y += (nodes3[d.focus].y - d.y) * k;
			d.x += (nodes3[d.focus].x - d.x) * k;
		}
		return "translate(" + d.x + "," + d.y + ")";
	});

	d3.selectAll(".network").selectAll("path")
		   .data(groups)
		   .attr("d", groupPath)
}

function tick5(e){
		d3.selectAll(".node5").attr("transform", function(d, i) {
		if(!d.f){
			var k = 6 * e.alpha;
			d.y += (nodes4[d.focus].y - d.y) * k;
			d.x += (nodes4[d.focus].x - d.x) * k;
		}
		return "translate(" + d.x + "," + d.y + ")";
	});


	d3.selectAll(".network").selectAll("path")
		   .data(groups)
		   .attr("d", groupPath)
}

function groupsMouseover(d){
	var x= d.id.split("#")
	d3.selectAll("#"+x[0]+"__"+x[1]).attr("opacity", 0.8);
}

function groupsMouseout(d){
	var x= d.id.split("#")
	d3.selectAll("#"+x[0]+"__"+x[1]).attr("opacity", 0.4);
}

function addData(array, data){
	for (var i = 0; i< data.length; i++){
		array.push(data[i]);
	}
}

function getData(id){
	//Returns the value of textarea
	return document.getElementById(id).value;
}

function ParseUpdateDraw(inputStr, nameStr, colorStr, shapeStr, cellStr){
	if(cellPlace=="External Encapsulating Structure"){
		var d = parseInput(inputStr, nameStr,colorStr,shapeStr, cellStr);

		if(error.length == 0){
			d3.selectAll("rect").remove();
			d3.selectAll("#text-error").remove();
			updateHypergraph(d);
			draw();
		}else{
			vis.append("rect")
				.attr("id", "Sidebar")
				.attr("x", 0)
				.attr("y", 0)
				  .attr("width", w*2)
				.attr("height", h*2)
				.attr("opacity", 1)
				.style("fill", "white")
				.style("pointer-events", "all");
		
			for (var i = 0; i< error.length; i++){
				vis.append("text")
						  .text(error[i])
						  .attr("id", "text-error")
						  .attr("x", 0)
						  .attr("y", 30*(i+1))
						  .attr("font-family",  "Arial")
						  .attr("fill", "black")
					   .attr("font-size", "1.5em");
			}
			vis2.append("rect")
			.attr("id", "Sidebar")
			.attr("x", 0)
			.attr("y", 0)
			  .attr("width", w*2)
			.attr("height", h*2)
			.attr("opacity", 1)
			.style("fill", "white")
			.style("pointer-events", "all");
	
			for (var i = 0; i< error.length; i++){
				vis2.append("text")
						.text(error[i])
						.attr("id", "text-error")
						.attr("x", 0)
						.attr("y", 30*(i+1))
						.attr("font-family",  "Arial")
						.attr("fill", "black")
					.attr("font-size", "1.5em");
			}
			error = [];
		}
	}
	else{
		var d = parseInput(inputStr, nameStr,colorStr,shapeStr, cellStr);
		if(error.length == 0){
			d3.selectAll("rect").remove();
			d3.selectAll("#text-error").remove();
			updateHypergraph(d);
			draw();
		}else{
			vis.append("rect")
				.attr("id", "Sidebar")
				.attr("x", 0)
				.attr("y", 0)
				  .attr("width", w*2)
				.attr("height", h*2)
				.attr("opacity", 1)
				.style("fill", "white")
				.style("pointer-events", "all");
		
			for (var i = 0; i< error.length; i++){
				vis.append("text")
						  .text(error[i])
						  .attr("id", "text-error")
						  .attr("x", 0)
						  .attr("y", 30*(i+1))
						  .attr("font-family",  "Arial")
						  .attr("fill", "black")
					   .attr("font-size", "1.5em");
			}
			vis2.append("rect")
			.attr("id", "Sidebar")
			.attr("x", 0)
			.attr("y", 0)
			  .attr("width", w*2)
			.attr("height", h*2)
			.attr("opacity", 1)
			.style("fill", "white")
			.style("pointer-events", "all");
	
			for (var i = 0; i< error.length; i++){
				vis2.append("text")
						.text(error[i])
						.attr("id", "text-error")
						.attr("x", 0)
						.attr("y", 30*(i+1))
						.attr("font-family",  "Arial")
						.attr("fill", "black")
					.attr("font-size", "1.5em");
			}
			error = [];
		}
	}
	
}

function createTextAreaWithLines(id){
      var el = document.createElement('DIV');
      var ta = document.getElementById(id);
      ta.parentNode.insertBefore(el,ta);
      el.appendChild(ta);
      
      el.className='textAreaWithLines';
      el.style.width = '436px';
      ta.style.position = 'absolute';
      ta.style.left = '30px';
      el.style.height = '16.5vh';
      el.style.overflow='hidden';
      el.style.position = 'relative';
      var lineObj = document.createElement('DIV');
      lineObj.style.position = 'absolute';
      lineObj.style.top = '2px';
      lineObj.style.left = '0px';
      lineObj.style.width = '27px';
      el.insertBefore(lineObj,ta);
      lineObj.style.textAlign = 'right';
      lineObj.className='lineObj';
      lineObj.id= id+'-lineObj';
      var string = '';
      for(var no=1;no<1000;no++){
         if(string.length>0)string = string + '<br>';
         string = string + no;
      }
      
      ta.onkeydown = function() { positionLineObj(lineObj,ta); };
      ta.onmousedown = function() { positionLineObj(lineObj,ta); };
      ta.onscroll = function() { positionLineObj(lineObj,ta); };
      ta.onblur = function() { positionLineObj(lineObj,ta); };
      ta.onfocus = function() { positionLineObj(lineObj,ta); };
      ta.onmouseover = function() { positionLineObj(lineObj,ta); };
      lineObj.innerHTML = string;
      
   }
   
function positionLineObj(obj,ta){
	obj.style.top = (ta.scrollTop * -1 + 2) + 'px';    
}		
				
function dblclick(d) {
	//Doubleclick to place forces on node
	d.f = false;
	d3.select(this).classed("fixed", d.fixed = false);
	f1.start();
	f2.start();
	f3.start();
	f4.start();
	f5.start();
}

function dragstart(d) {
  //Drag to fix node's position
  d.f = true;
  d3.event.sourceEvent.stopPropagation();
  for (var i = 0; i< nodes1.length; i++){
  	nodes1[i].fixed = true;
  }
  d.fixed = true;
}

function hiddenLinks(data){
	if(error.length > 0){
		return;
	}
	var ret = [];
	for (var i = 0; i< data.length; i++){
		var node = data[i];
		var source = node;
		if(node.n == 1 && node.child.length > 1){
			for (var j = 0; j< node.child.length; j++){
				var child = data[node.child[j]];
				for (var k = 0; k< child.parent.length; k++){
					var parent = data[child.parent[k]];
					if(source.id != parent.id){
						if(parent.n == 1){
							ret.push({
										id: source.id + "==>" + parent.id,
				                		source: source,
				                    	target: parent,
				                   		show: "false",
				                   		l: 1
				                   		});
											
						}else{
							for (var l = 0; l< parent.parent.length; l++){
								var parent2 = data[parent.parent[l]];
								if(parent2.n == 1){
									ret.push({
												id: source.id + "==>" + parent.id,
				                    			source: source,
				                    			target: parent,
				                   				show: "false",
				                   				l: 1
				                   				});
								}else{
									for (var m = 0; m< parent2.parent.length; m++){
										var parent3 = data[parent2.parent[l]];
										if(parent3.n == 1){
											ret.push({
														id: source.id + "==>" + parent.id,
				                    					source: source,
				                    					target: parent,
				                   						show: "false",
				                   						l: 1
				                   						});
										}
									}
								}		
							}
						}	
					}
				}
			}
		}
	}
	return ret;
}

function errorLine(error, input){
	var line = input.substr(0, input.indexOf(error)).split("\n").length;
	return "Error on Line "+line;

}
				
function envelope(data){
	for (var i = 0; i< data.length; i++){
	}
	for (var i = 0; i< data.length; i++){
		//Layer 1
		var n = data[i];
						
		for (var j = 0; j< n.child.length; j++){
			//Layer 2
			var o = data[n.child[j]];
			if(o == undefined){
				var err = errorLine(n.child[j].split("#")[0], document.getElementById("textInput").value);
				if(error.indexOf(err) == -1){
					error.push(err);
					error.push(">>>'"+n.child[j].split("#")[0]+"' node is not defined");
				}
				return;
			}
			for (var k = 0; k< o.child.length; k++){
				//Layer 3
				var p = data[o.child[k]];
				if(n.child.indexOf(o.child[k]) == -1){
					n.child.push(o.child[k]);
				}
			}
		}
	}
}
				
function getLayer(node, data, count, maxCount){
	//Returns an integers representing the layer the node is in
	for (var i = 0; i< node.parent.length; i++){
		//Layer 2
		var p = data[node.parent[i]];
		if(p==undefined){
			var err = errorLine(node.parent[i].split("#")[0], data["textInput"]);
			if(error.indexOf(err) == -1){
				error.push(err);
				error.push(">>>'"+node.parent[i].split("#")[0]+"' node is not defined");
			}
			return;
		}
		count += 1;
		if(p.parent.length == 0){
			if(count > maxCount){
				maxCount = count;
			}
			count = 1;
		}
		for (var j = 0; j< p.parent.length; j++){	
			//Layer 3
			var q = data[p.parent[j]];
			if(q==undefined){
				var err = errorLine(p.parent[j].split("#")[0], data["textInput"]);
				if(error.indexOf(err)==-1){
					error.push(err);
					error.push(">>>'"+p.parent[j].split("#")[0]+"' node is not defineds");
				}
				
				return;
			}
			
			count += 1;
			if(q.parent.length == 0){
				if(count > maxCount){
					maxCount = count;
				}
				count = 1;
			}
			for (var k = 0; k< q.parent.length; k++){
				//Layer 4
				var r = data[q.parent[k]];
				count += 1;
				if(r.parent.length == 0){
					if(count > maxCount){
						maxCount = count;
					}
					count = 1;
				}
				for (var l = 0; l< r.parent.length; l++){
					//Layer 5
				    var s = data[r.parent[l]];
				    count += 1;
				    if(s.parent.length == 0){
				    	if(count > maxCount){
				        	maxCount = count;
				        }
				        count = 1;
				    }
				}
			}
		}
	}
	return maxCount;
}

function setLayer(data){
	//Sets the layer for all nodes in data
	for (var i = 0; i< data.length; i++){
		data[i].n = getLayer(data[i], data, 1, 1);
	}
}

function setFocus(nodes, parents, data){
	//Sets the focus for all nodes. Determined by the nodes's parents and data.
	for (var i = 0; i< nodes.length; i++){
		if(nodes[i].parent.length != 0){
			nodes[i].focus = parents.indexOf(data[nodes[i].parent[0]]);
			var counter = 1;
			while(nodes[i].focus == -1){
				nodes[i].focus = parents.indexOf(data[nodes[i].parent[counter]]);
				counter += 1;
			}
		}
	}
}

function getWeight(node, data, count, maxCount){
	if(error.length > 0){
		return;
	}
	//Returns an integers representing the layer the node is in
	for (var i = 0; i< node.child.length; i++){
		//Layer 2
		var p = data[node.child[i]];
		count += 1;
		for (var j = 0; j< p.child.length; j++){
			//Layer 3
			var q = data[p.child[j]];
			count += 1;
				      
			for (var k = 0; k< q.child.length; k++){
				//Layer 4
				var r = data[q.child[k]];
				count += 1;
        
				for (var l = 0; l< r.child.length; l++){
					//Layer 5
				    var s = data[r.child[l]];
				    count += 1;
				}
			}
		}
	}
	return count;
}

function setWeight(data){
	//Sets the weight for all nodes in data
	for (var i = 0; i< data.length; i++){
		data[i].w = getWeight(data[i], data, 1, 1);
	}
}

function iDrag(force){
	//Adds dragging of nodes to force
	return force.drag()
				.on("dragstart", dragstart);
}

function createNodes(nodes, layer){
	return network.append("g")
                  .attr("class", "layer"+layer)
                  .selectAll("circle.node"+layer);
}

function createLink(links, layer){
	return network.append("g")
                    .attr("class", "link-layer"+layer)
                    .selectAll("c.links"+layer);
}

function zoom() {
	if(".network"==".network"){
		network.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
	else{
		network2.attr("transform", "translate(" + d3.event.translate + ")scale(" + d3.event.scale + ")");
	}
  if(d3.event.scale <= 0.18){

  	d3.selectAll(".text-node").attr("font-size", 0);
  }else{
  	d3.selectAll("text").attr("font-size", function(d, i){ if(d.child.length == 0) { return  "1.5em"; }else{ return "2.5em"; } });
  }
}


function countLines(input){
	return input.split("\n").length+1;
}

function parseInput(input, name, color, shape, cell){
	var counter = 0;
	var ret = [];
	var parentDict = {};
	var childDict = {};
	var edgeDict = {};
	var selfEdgeDict = {};
	var nameDict = {}; 
	var colorDict = {};
	var shapeDict = {};
	var edgeCheck = {};
	var nodeDuplicates = {};
	var inDuplicates = {};
	if(input){
		input = input.split("\n");	
	}else{
		input = [];
	}
	if(name){
		name = name.split("\n");	
	}else{
		name = [];
	}
	if(color){
		color = color.split("\n");	
	}else{
		color = [];
	}
	if(shape){
		shape = shape.split("\n");	
	}else{
		shape = [];
	}
	if(cell){
		cell = cell.split("\n");	
	}else{
		cell = [];
	}
	
	//Uses splits input (nodes, edges, etc.) to create nodes and edges
	var loaded_nodes = [];

	for (var i = 0; i< input.length; i++){
		var line = input[i].split("\t");
		//alert(line[1]);
		if(line[1] !== undefined){
			if(line[0].trim(" ")=="SET"){
				ret.push({key: counter, id: line[1].trim(" ")+"#1", name: line[1].trim(" "), selfEdge: false, x: 0, y: 0, w: 1, n: 1, focus: 0, color: "blue", shape: "circle", parent: [], child: [], target:[]});
				counter += 1;
		
			}else if(line[0].trim(" ")=="NODE"){
				for (var j = 0; j < cell.length; j++){
					var node_name = cell[j].split(" = ");
					if(node_name[0] != undefined && node_name[1] != undefined){
						node_name[0] = node_name[0].trim(" ");
						node_name[1] = node_name[1].trim(" ");
					}
					if(cell.length == 1 || node_name[0]==line[1]){
						if(cell.length == 1 || typeof cellPlace==='undefined' || cellPlace=="all nodes" || node_name[1]==cellPlace){
							if(!loaded_nodes.includes(line[1])){
								loaded_nodes.push(line[1]);
								ret.push({key: counter, id: line[1].trim(" ")+"#1", name: line[1].trim(" "), selfEdge: false, x: 0, y: 0, w: 1, n: 1, focus: 0, color: "blue", shape: "circle", parent: [], child: [], target:[]});
								counter += 1;
							}
						}
					}
				}
			}else if(line[0].trim(" ")=="IN"){
				if([line[1].trim(" "),line[2].trim(" ")] in inDuplicates){
					if(line[1].trim(" ") in nodeDuplicates){
						nodeDuplicates[line[1].trim(" ")] += 1;
					}else{
						nodeDuplicates[line[1].trim(" ")] = 2;
					}
					ret.push({key: counter, id: line[1].trim(" ")+"#"+nodeDuplicates[line[1].trim(" ")], name: line[1].trim(" "), selfEdge: false, x: 0, y: 0, w: 1, n: 1, focus: 0, color: "blue", shape: "circle", parent: [], child: [], target:[]});
					counter += 1;
					childDict[line[2].trim(" ")+"#1"].push(line[1].trim(" ")+"#"+nodeDuplicates[line[1].trim(" ")]);
					parentDict[line[1].trim(" ")+"#"+nodeDuplicates[line[1].trim(" ")]] = [line[2].trim(" ")+"#1"];
									
				}else{
					inDuplicates[[line[1].trim(" "),line[2].trim(" ")]] = " ";
					
					if(line[2].trim(" ")+"#1" in childDict){
						childDict[line[2].trim(" ")+"#1"].push(line[1].trim(" ")+"#1");
					}else{
						childDict[line[2].trim(" ")+"#1"] = [line[1].trim(" ")+"#1"];
					}
					if(line[1].trim(" ")+"#1" in parentDict){
						parentDict[line[1].trim(" ")+"#1"].push(line[2].trim(" ")+"#1");
					}else{
						parentDict[line[1].trim(" ")+"#1"] = [line[2].trim(" ")+"#1"];
					}
				}

			}else if(line[0].trim(" ")=="EDGE"){

				var cellCheck = [];

				for (var j = 0; j < cell.length; j++){
					var node_name = cell[j].split(" = ");
					if(node_name[0] != undefined && node_name[1] != undefined){
						node_name[0] = node_name[0].trim(" ");
						node_name[1] = node_name[1].trim(" ");
					}
					if(cell.length == 1 || node_name[1]==cellPlace || (typeof cellPlace === 'undefined')||cellPlace=="all nodes" ){
						cellCheck.push(node_name[0]);
					}
				}
				if ((cell.length == 1) || ((cellCheck.includes(line[1])) & (cellCheck.includes(line[2])))){
					if(!([line[1].trim(" ")+"#1", line[2].trim(" ")+"#1"] in edgeCheck) || !([line[2].trim(" ")+"#1", line[1].trim(" ")+"#1"] in edgeCheck)){
						if(line[1].trim(" ")+"#1" in edgeDict){
							edgeDict[line[1].trim(" ")+"#1"].push(line[2].trim(" ")+"#1");
						}else{
							edgeDict[line[1].trim(" ")+"#1"] = [line[2].trim(" ")+"#1"];
						}
						edgeCheck[[line[1].trim(" ")+"#1",line[2].trim(" ")+"#1"]] = " ";
						if(line[1].trim(" ") == line[2].trim(" ")){
							selfEdgeDict[line[1].trim(" ")] = " ";
						}
					}
				}

			}						
		}
		
	}

	for (var i = 0; i< name.length; i++){
		var line = name[i].split("=");
		if(line[0] != undefined && line[1] != undefined){
			line[0] = line[0].trim(" ");
			line[1] = line[1].trim(" ");
			nameDict[line[0]] = line[1];
		}
						
						
	}
	for (var i = 0; i< color.length; i++){
		var line = color[i].split("=");
		if(line[0] != undefined && line[1] != undefined){
			line[0] = line[0].trim(" ");
			line[1] = line[1].trim(" ");	
			colorDict[line[0]] = line[1];
		}
						

	}
	for (var i = 0; i< shape.length; i++){
		var line = shape[i].split("=");
		if(line[0] != undefined && line[1] != undefined){
			line[0] = line[0].trim(" ");
			line[1] = line[1].trim(" ");	
			shapeDict[line[0]] = line[1];	
		}
	}
					
					
	for (var i = 0; i< ret.length; i++){
		if(ret[i].id in parentDict){
			ret[i].parent = parentDict[ret[i].id];
		}
		if(ret[i].id in childDict){
							
			ret[i].child = childDict[ret[i].id];
		}
		if(ret[i].id in edgeDict){
			ret[i].target = edgeDict[ret[i].id];
		}
		if(ret[i].id.split("#")[0] in selfEdgeDict){
			ret[i].selfEdge = true;
		}
		if(ret[i].id.split("#")[0] in nameDict){
			ret[i].name = nameDict[ret[i].id.split("#")[0]];
		}
		if(ret[i].id.split("#")[0] in colorDict){
			ret[i].color = colorDict[ret[i].id.split("#")[0]];
		}
		if(ret[i].id.split("#")[0] in shapeDict){
			ret[i].shape = shapeDict[ret[i].id.split("#")[0]];
		}
	}

	d = ret;
	var numNodes = counter;
	
	var dreference = {};
	for (var i = 0; i< d.length; i++){
			dreference[d[i].id] = d[i].key;
	}

	for (var i = 0; i< d.length; i++){
		for (var j = 0; j< d[i].parent.length; j++){
			if(dreference[d[i].parent[j]] != undefined){
				d[i].parent[j] = dreference[d[i].parent[j]];
			}			  
						
		}
		for (var j = 0; j< d[i].child.length; j++){
			if(dreference[d[i].child[j]] != undefined){
				d[i].child[j] = dreference[d[i].child[j]];
					  		
			}
		}
		for (var j = 0; j< d[i].target.length; j++){
			if(dreference[d[i].target[j]] != undefined){
				d[i].target[j] = dreference[d[i].target[j]];
			}
		}
	}		
	envelope(d);
					
	//Sets an integer representing the layer the node is in 
	setLayer(d);
				
	//Sets an integer representing the weight of the node
	setWeight(d);

	//Returns hidden links for better layout
	var hidden = hiddenLinks(d);

	//Creates groups
	var groups = [];
	for (var i = 0; i< d.length; i++){
		if(d[i].child.length > 0){
			var v = [d[i], d[i]];
			for (var j = 0; j< d[i].child.length; j++){
				v.push(d[d[i].child[j]]);
			}
			groups.push({ id: d[i].id, color: d[i].color, w: d[i].w, values: v });
		}
	}

	//Creates the nodes
	var nodes1 = [];
	var nodes2 = [];
	var nodes3 = [];
	var nodes4 = [];
	var nodes5 = [];
	for (var i = 0; i< d.length; i++){
		if(d[i].n == 1){
			nodes1.push(d[i]);
		}else if(d[i].n == 2){
			nodes2.push(d[i]);
		}else if(d[i].n == 3){
			nodes3.push(d[i]);
		}else if(d[i].n == 4){
			nodes4.push(d[i]);
		}else if(d[i].n == 5){
			nodes5.push(d[i]);
		}
	}

	//Sets internal nodes to gravitate towards one parent
	setFocus(nodes2, nodes1, d);
	setFocus(nodes3, nodes2, d);
	setFocus(nodes4, nodes3, d);
	setFocus(nodes5, nodes4, d);

	//Creates the links
	var links1 = [];
	var links2 = [];
	var links3 = [];
	var links4 = [];
	var links5 = [];
	for (var i = 0; i< d.length; i++){
		if (d[i].target !== undefined){
			for (var x = 0; x< d[i].target.length; x++){
				if(d[d[i].target[x]]==undefined){
					//alert(d[i].target[x].split("#")[0]);
					var err = errorLine(d[i].target[x].split("#")[0], data["textInput"]);
					if(error.indexOf(err)==-1){
						error.push(err);
						error.push(">>>'"+d[i].target[x].split("#")[0]+"' not defined");
					}
					return;
				}
				if(d[i].n == 1 && d[d[i].target[x]].n == 1){
					links1.push({
									id: d[i].id +"==>"+d[d[i].target[x]].id,
									source: d[i],
					                target: d[d[i].target[x]],
					                show: "true",
					                l: 1
					             });
				}else{
					links2.push({
									id: d[i].id +"==>"+d[d[i].target[x]].id,
									source: d[i],
					                target: d[d[i].target[x]],
					                show: "true",
					                l: 1
					             });
				}
			}
		}
	}
	links1 = links1.concat(hidden);
	
	HypergraphObject = {};
	HypergraphObject["groups"] = groups;
	HypergraphObject["nodes1"] = nodes1;
	HypergraphObject["nodes2"] = nodes2;
	HypergraphObject["nodes3"] = nodes3;
	HypergraphObject["nodes4"] = nodes4;
	HypergraphObject["nodes5"] = nodes5;
	HypergraphObject["links1"] = links1;
	HypergraphObject["linksOther"] = links2;
	return HypergraphObject;
}

function map(array){
	var ret = {};
	for (var i = 0; i< array.length; i++){
		ret[array[i].id] = i;
	}
	
	return ret;
}

function removeByID(array, id){
	for (var i = 0; i< array.length; i++){
		if(array[i].id == id){
			array.splice(i,1);
			break;
		}
	}
}

function replaceGroups(oldArray, newArray){
	var o = map(oldArray);
	var n = map(newArray);
	var remove = [];
	for (var i = 0; i< oldArray.length; i++){
		if(!(oldArray[i].id in n)){
			remove.push(oldArray[i].id);
		}else{
			oldArray[i].color = newArray[n[oldArray[i].id]].color;
			oldArray[i].w = newArray[n[oldArray[i].id]].w;
			oldArray[i].values = [];
		}
	}
	for (var i = 0; i< remove.length; i++){
		removeByID(oldArray, remove[i]);
	}
	for (var i = 0; i< newArray.length; i++){
		if(!(newArray[i].id in o)){
			oldArray.push({id: newArray[i].id, color: newArray[i].color, w: newArray[i].w, values: []});
		}
	}
}

function replaceNodes(oldArray, newArray){
	
	var o = map(oldArray);
	var n = map(newArray);
	var remove = [];
	for (var i = 0; i< oldArray.length; i++){
		if(!(oldArray[i].id in n)){
			remove.push(oldArray[i].id);
		}else{
			oldArray[i].key = newArray[n[oldArray[i].id]].key;
			oldArray[i].name = newArray[n[oldArray[i].id]].name;
			oldArray[i].selfEdge = newArray[n[oldArray[i].id]].selfEdge;
			oldArray[i].w = newArray[n[oldArray[i].id]].w;
			oldArray[i].n = newArray[n[oldArray[i].id]].n;
			oldArray[i].focus = newArray[n[oldArray[i].id]].focus;
			oldArray[i].color = newArray[n[oldArray[i].id]].color;
			oldArray[i].shape = newArray[n[oldArray[i].id]].shape;	
			oldArray[i].parent = [];
			oldArray[i].child = [];
			oldArray[i].target = [];
		}
	}
	for (var i = 0; i< remove.length; i++){
		removeByID(oldArray, remove[i]);
	}
	for (var i = 0; i< newArray.length; i++){
		if(!(newArray[i].id in o)){
			var newNode = {
							key: i,
							id: newArray[i].id,
							name: newArray[i].name,
							selfEdge: newArray[i].selfEdge,
							x: newArray[i].x,
							y: newArray[i].y,
							w: newArray[i].w,
							n: newArray[i].n,
							focus: newArray[i].focus,
							color: newArray[i].color,
							shape: newArray[i].shape,
							parent: [],
							child: [],
							target: []
						  };
			oldArray.splice(i, 0, newNode);
		}
	}
}

function replaceLinks1(oldArray, newArray){
	var o = map(oldArray);
	var n = map(newArray);
	var remove = [];
	for (var i = 0; i< oldArray.length; i++){
		if(!(oldArray[i].id in n)){
			remove.push(oldArray[i].id);
		}else{
			oldArray[i].show = newArray[n[oldArray[i].id]].show;
			oldArray[i].l = newArray[n[oldArray[i].id]].l;
		}
	}
	for (var i = 0; i< remove.length; i++){
		removeByID(oldArray, remove[i]);
	}
	var onodes1 = map(nodes1);
	for (var i = 0; i< newArray.length; i++){
		if(!(newArray[i].id in o)){
			oldArray.push({
				id: newArray[i].id,
				source: addNodeByID(newArray[i].source.id),
				target: addNodeByID(newArray[i].target.id),
				show: newArray[i].show,
				l: newArray[i].l,
			});
		}
	}
}

function replaceLinks2(oldArray, newArray){
	var o = map(oldArray);
	var n = map(newArray);
	var remove = [];
	for (var i = 0; i< oldArray.length; i++){
		if(!(oldArray[i].id in n)){
			remove.push(oldArray[i].id);
		}else{
			oldArray[i].show = newArray[n[oldArray[i].id]].show;
			oldArray[i].l = newArray[n[oldArray[i].id]].l;
		}
	}
	for (var i = 0; i< remove.length; i++){
		removeByID(oldArray, remove[i]);
	}
	for (var i = 0; i< newArray.length; i++){
		if(!(newArray[i].id in o)){
			oldArray.push({
				id: newArray[i].id,
				source: addNodeByID(newArray[i].source.id),
				target: addNodeByID(newArray[i].target.id),
				show: newArray[i].show,
				l: newArray[i].l,
			});
		}
	}
}

function remapGroups(newGroup){
	var o = map(groups);
	var onodes1 = map(nodes1);
	for (var i = 0; i< newGroup.length; i++){
		var ng = newGroup[i];
		var og = groups[o[ng.id]];
		for (var j = 0; j< ng.values.length; j++){
			og.values.push(addNodeByID(ng.values[j].id));
		}
	}
}

function remapNodes(oldNodes, newNodes){
	for (var i = 0; i< newNodes.length; i++){
		var nn = newNodes[i];
		var on = oldNodes[i];
		if(on!=undefined){
			on.parent = nn.parent;
			on.child = nn.child;
			on.target = nn.target;
		}
		
	}
}

function addNodeByID(id){
	var found = findNode(id);
	if(found == 1){
		var o = map(nodes1);
		return nodes1[o[id]];
	}else if(found == 2){
		var o = map(nodes2);
		return nodes2[o[id]];
	}else if(found == 3){
		var o = map(nodes3);
		return nodes3[o[id]];
	}else if(found == 4){
		var o = map(nodes4);
		return nodes4[o[id]];
	}else if(found == 5){
		var o = map(nodes5);
		return nodes5[o[id]];
	}
	return 0;
}

function findNode(id){
	var o1 = map(nodes1);
	var o2 = map(nodes2);
	var o3 = map(nodes3);
	var o4 = map(nodes4);
	var o5 = map(nodes5);
	if(id in o1){
		return 1;
	}else if(id in o2){
		return 2;
	}else if(id in o3){
		return 3;
	}else if(id in o4){
		return 4;
	}else if(id in o5){
		return 5;
	}
	return 0;
}

function updateHypergraph(data){
	
	var newGroups = data["groups"];
	var newNodes1 = data["nodes1"];
	var newNodes2 = data["nodes2"];
	var newNodes3 = data["nodes3"];
	var newNodes4 = data["nodes4"];
	var newNodes5 = data["nodes5"];
	var newLinks1 = data["links1"];
	var newLinks2 = data["linksOther"];
	
	//Update Group
	d3.selectAll(".network").selectAll("path").remove();
	replaceGroups(groups, newGroups);
	replaceNodes(nodes1, newNodes1);
	//Update Nodes2
	replaceNodes(nodes2, newNodes2);
	//Update Nodes3
	replaceNodes(nodes3, newNodes3);
	//Update Nodes4
	replaceNodes(nodes4, newNodes4);
	//Update Nodes5
	replaceNodes(nodes5, newNodes5);
	remapGroups(newGroups);
	remapNodes(nodes1, newNodes1);
	remapNodes(nodes2, newNodes2);
	remapNodes(nodes3, newNodes3);
	remapNodes(nodes4, newNodes4);
	remapNodes(nodes5, newNodes5);
	replaceLinks1(links1, newLinks1);
	replaceLinks2(links2, newLinks2);
}
