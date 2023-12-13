
let network, data, allNodes, services, schools, modules, courses, corps, allEntries;
let highlightActive = false;

const NODE_COLOR = '#9b4dca';
const NODE_ICON_SIZE = 40;
const EDGE_COLOR = '#4B0082';
// const highlightActive = false;
const DEFAULT_EDGE_SETTINGS = {
	// color: EDGE_COLOR,
	arrows: {
		to: {
			enabled: true
		}
	}
}
const DEFAULT_EDGE_SETTINGS2 = {
	// color: '#387cb8',
	arrows: {
		to: {
			enabled: true
		}
	}
}
/**
 * A vis-network group config.
 * This is only needed if the different node-types should look differently.
 */
 const GROUPS = {
	land: {
		color: "#737664",
	}
};

/**
 * Load all services from "databse"
 */
 async function getservices() {
 	return fetch('./data/services.json').then(response => response.json());
 }

/**
 * Load all modules from "databse"
 */
 async function getmodules() {
 	return fetch('./data/modules.json').then(response => response.json());
 }

/**
 * Load all courses from "databse"
 */
 async function getcourses() {
 	return fetch('./data/courses.json').then(response => response.json());
 }

/**
 * Load all schools from "databse"
 */
 async function getSchools() {
 	return fetch('./data/schools.json').then(response => response.json());
 }

/**
 * Load all "function" from "databse"
 */
 async function getcorps() {
 	return fetch('./data/corps.json').then(response => response.json());
 }

/**
 * Buttons are disbaled by default.
 * After everything needed is loaded they can be enabled.
 */
// function enableButtons() {
// 	Array.from(document.getElementsByClassName('filterBtn')).forEach(el => {
// 		el.removeAttribute('disabled');
// 	});
// }


// generator and constructor for sideinfo
function nodeToInfo(node){
	const aboutInfo = document.getElementById('sideInfo_aboutText');
	aboutInfo.innerHTML="";

// contains the mappings of what sideInfo for each node type
function sideInfoMappings(nodeType){ 
	console.log(nodeType);
	const nodeMappings = {
		service:function(){
			addAboutInfo(nodeType);
			addcorpsInfo(nodeType);
			addPrerequisitesInfo(nodeType);
		},
		school:function(){
			addAboutInfo(nodeType);
		},		
		corp:function(){
			addAboutInfo(nodeType);
		},
		course:function(){
			addAboutInfo(nodeType);
			addCoursecorpsInfo(nodeType);
		},
		module:function(){
			addAboutInfo(nodeType);
			addUsedCourses(nodeType);
			addcorpsInfo(nodeType);
			addPrerequisitesInfo(nodeType);
		},	 	
	}
	return nodeMappings[nodeType.type]();
};

function addAboutInfo(node){
	const sideInfo_header_Images = document.getElementById('sideInfo_header');

	sideInfo_header_Images.style.backgroundImage =`url('./${node.type}_headers/${node.id}.jpg')`;
	const sideInfo_header = document.getElementById('sideInfo_header');
	sideInfo_header.innerHTML = '';

	const aboutTextConstructor = {
		service:function(){
			aboutService = document.createElement('p');
			aboutService.innerHTML=node.description || "no description available";
			aboutInfo.append(aboutService);
		},
		school:function(){
			aboutSchool = document.createElement('p');
			aboutSchool.innerHTML=node.description || "no description available";
			aboutInfo.append(aboutSchool);
		},		
		corp:function(){
			aboutCorp = document.createElement('p');
			aboutCorp.innerHTML=node.description || "no description available";
			aboutInfo.append(aboutCorp);
		},
		course:function(){
			aboutCourse = document.createElement('p');
			aboutCourse.innerHTML=node.description || "no description available";
			aboutInfo.append(aboutCourse);
		},
		module:function(){

			if (node.adele_enrolmentKey){
				aboutInfo.innerHTML = [
				`<p class="card-text">This module is now available to those wishing to engage in open coursework (no assessment or awarding into PMKeys).</p>`,
				`<p class="card-text">If you've been panelled, your enrolment key is in your joining instructions. otherwise open access is available with the enrolment key of: `,
				`<span class="h4 font-weight-bold">`,
				node.adele_enrolmentKey ? node.adele_enrolmentKey : `"Not Openly Available Yet"`,
				`</span>`,
				`</p>`,
				`<div class="text-center">`,
				`<p>`,
				node.adele_id ?`<a href="https://www.adele.edu.au/course/view.php?id=${node.adele_id}"><button class="btn btn-primary" >Access Module Here</button></a>`: null,
				`</p>`
				].join('\n');}
				else{
					aboutInfo.innerHTML = [
					`<p class="card-text">`,
					node.description,
					`</p>`,
					`<p class="card-text">`,
					`This module is not yet available to those wishing to engage in open coursework (no assessment or awarding into PMKeys).`,
					`</p>`,
					].join('\n');}
				}
			};	 	
			sideInfo_header.innerHTML = [
			`<div class="text-white p-5 d-flex h-100 mask blue-gradient-rgba">`,
			`<h4 class='card-title font-weight-bold mb-2'>${node.label}<h4>`,
			// `<p class='card-text'>Applicability: ${node.service}</p></div>`
			].filter(Boolean).join('\n');
			aboutTextConstructor[node.type]();
		};

		function addCoursecorpsInfo(node){
			const usedCoursecorps = node.modules || null;
			// console.log(usedCoursecorps);
			const usedCoursecorpsArray = [];
			usedCoursecorps.forEach(courseModuleId => {
				// console.log(courseModuleId);
				usedCoursecorpsArray.push(modules.filter(module => module.id === courseModuleId))
			});
			// console.log(usedCoursecorpsArray);

			if (!usedCoursecorpsArray) return;
			const addCoursecorpsTitle = document.createElement('h4');
			addCoursecorpsTitle.classList.add("card-title","font-weight-bold");
			addCoursecorpsTitle.innerHTML ="<hr>Used Course corps";
			aboutInfo.append(addCoursecorpsTitle);
			usedCoursecorpsArray.forEach(usedCorp => {
				console.log(usedCorp);
			let usedCoursecorpspan = document.createElement('span');	
			usedCoursecorpspan.innerHTML = [
			`<a class="pr-2"><span `,
			`class="grey-text"><img src="./corp_icons/${usedCorp[0].corps[0]}_Circle.png"></a></span>`,
			].filter(Boolean).join('\n');
			aboutInfo.append(usedCoursecorpspan);
		})
		}

		function addcorpsInfo(node){
			const usedcorps = node.corps || null;
			if (!usedcorps) return;
			const addcorpsTitle = document.createElement('h4');
			addcorpsTitle.classList.add("card-title","font-weight-bold");
			addcorpsTitle.innerHTML ="<hr>Used corps";
			aboutInfo.append(addcorpsTitle);
			usedcorps.forEach(usedCorp => {
			let usedcorpspan = document.createElement('span');	
			usedcorpspan.innerHTML = [
			`<a class="pr-2"><span onclick="zoomIn('${usedCorp}');";`,
			`class="grey-text"><img src="./corp_icons/${usedCorp}_Circle.png"></a></span>`,
			].filter(Boolean).join('\n');
			aboutInfo.append(usedcorpspan);
		})
		};

		function addPrerequisitesInfo(node){
			const prerequisites = node.prerequisites || null;
			if (!prerequisites) return;
			const addPrerequisitesHeader = document.createElement('div');	
		 		addPrerequisitesHeader.innerHTML = [
		 		`<hr><h4 class="card-title font-weight-bold">Module Prerequisites</h4>`,
		 		`<p class="card-text">This module has the below prerequisites - click for more information`,
		 		`<ul class="list-group-flush list-group" id="addPrerequisites_ul"></ul>`
	 			].join('\n');
	 		aboutInfo.appendChild(addPrerequisitesHeader);
			prerequisites.forEach(prerequisite => {
			const prerequisite_module = modules.find(module => module.id === prerequisite);
			const addPrerequisite_li = document.createElement('li');
			addPrerequisite_li.classList.add('list-group-item','py-2','mb-0');
				addPrerequisite_li.innerHTML = [
				`<a class="sideInfo_prerequisites_li cyan-lighter-hover mb-3" onclick="zoomIn('${prerequisite_module.id}');"`,
				`class="grey-text"> ${prerequisite_module.label.replace(/_/g," ")}</a>`,
				].filter(Boolean).join('\n');
			const addPrerequisites_ul = document.getElementById('addPrerequisites_ul');
			addPrerequisites_ul.appendChild(addPrerequisite_li);			
			})
		};

		function addUsedCourses(node){
			// const $usedCourses_ul = document.getElementById('sideInfo_usedCourses_ul');
			// $usedCourses_ul.innerHTML = '';
			const usedCourses = courses.filter(course => course.modules.includes(node.id));
			if (!usedCourses.length) return;

			const addUsedCoursesHeader = document.createElement('div');	
	 		addUsedCoursesHeader.innerHTML = [
	 		`<hr><h4 class="card-title font-weight-bold">Relevant Courses</h4>`,
	 		`<p class="card-text">This module is used in the below courses - click for more information`,
	 		`<ul class="list-group-flush list-group" id="addUsedCourses_ul"></ul>`
	 		].join('\n');
	 		aboutInfo.appendChild(addUsedCoursesHeader);			
			usedCourses.forEach(usedCourse => {
			// usedusedCourse = usedusedCourse.replace(/_/g," ");
			const addUsedCourses_li = document.createElement('li');
			addUsedCourses_li.classList.add('list-group-item','py-2','mb-0');
			addUsedCourses_li.innerHTML = [
			`<a class="sideInfo_UsedCourses_li cyan-lighter-hover mb-0" onclick="zoomIn('${usedCourse.id}');"`,
			`class="grey-text"> ${usedCourse.label.replace(/_/g," ")}</a>`,
			].filter(Boolean).join('\n');
			const addUsedCourses_ul = document.getElementById('addUsedCourses_ul');
			addUsedCourses_ul.appendChild(addUsedCourses_li);
		})
		};

sideInfoMappings(node)

}

/**
 * Get all edges form all corps to its courses.
 */



 function corpsToEmployeeCategory() {
 	const corpCategories = new Set();
 	corps.forEach(corp => {
 		const corpECs = corp.empCategories || [];
 		corpECs.forEach(category => {
 			corpCategories.add(category);
 		});
 	});


 	const corpNodes = [];
 	// const corpToDomain = [];
 	corps.forEach(corp => {
 		 // corpToDomain.push({
 		// 		from:"land",
 		// 		to:corp.id,
 		// 		color:corp.color
 		// 	})
 		// if (corpCategories.has(corp.id)) {
 			corpNodes.push({
 				id: corp.id,
 				label: corp.label,
 				shape: "circularImage",
 				image: "./corp_icons/"+corp.id+".png",
 				level: 0,
 				color:"white",
 				size: 35,
 				mass:4
				// group: 'corp'
			});
 		// }
 	});

 	// const moduleNodes = modules.map(module => {
 	// 	return {
 	// 		id: module.id,
 	// 		label: module.label,
 	// 		level: module.level,
 	// 		shape: "dot",
 	// 		borderWidth: 2,
 	// 		shadow:true,
 	// 		group: module.corps[0],			
 	// 		// shape: "image",
 	// 		// image: "./service_icons/"+module.service+".png",
 	// 	}
 	// });
 	// corpNodes.push({
 	// 	id:"land",
 	// 	label:"Land Domain",
	// 	shape: "dot",
 	// 	borderWidth: 2,
 	// 	shadow:true, 		
 	// })
 	const nodes = new vis.DataSet([
 		...corpNodes
 		// ...moduleNodes
 		]);
 	// allNodes = nodes.get({ returnType: "Object" });

 	const corpTomodule = [];
 	for (const module of modules) {
 		const modulecorps = module.corps || [];
 		modulecorps.forEach(corpId => {
 			corpTomodule.push({
 				from: corpId,
 				to: module.id,
 				color: "rgb("+corps.find(module => module.id == corpId).color+")"
 			});
 		});
 	}

 	const moduleToprerequisites = [];
 	for (const module of modules) {
 		const moduleId = module.id;
 		const moduleprerequisite = module.prerequisites || [];
 		moduleprerequisite.forEach(prerequisiteId => {
 			moduleToprerequisites.push({
 				from: prerequisiteId,
 				to: moduleId,
 				color: prerequisiteId.color,
 				physics:false
 			});
 		});
 	}

 	// const modulesTocourses = [];
 	// for (const course of courses) {
 	// 	const courseId = course.id;
 	// 	const coursemodules = course.modules || [];
 	// 	coursemodules.forEach(moduleId => {
 	// 		modulesTocourses.push({
 	// 			from: moduleId,
 	// 			to: courseId,
 	// 			...DEFAULT_EDGE_SETTINGS
 	// 		});
 	// 	});
 	// }

 	const edges = new vis.DataSet([
 		// ...moduleToprerequisites,
 		...corpTomodule,
		// ...modulesTocourses
		]);

//load side information about corps
// const $container = document.getElementById('selected');

// 	/* clean container */
// 	$container.innerHTML = '';

// 	$infoBlock = document.createElement('div');
// 	$infoBlock.innerHTML = [
// 		`<h2>Information about this view</h2>`,
// 		`<hr />`,

// 	].filter(Boolean).join('\n');
// 	$container.appendChild($infoBlock);

return {
	nodes,
	edges
}
}



/**
 * Find the data-entry with the given id
 */
 function getSelectedInfos(id) {

 	return allEntries.find(entry => entry.id === id);
 }

/**
 * Get all child ids and return the data-entries of them
 */
 function getChildInfos(id) {
 	const childIds = network.getConnectedNodes(id, 'to');
 	return allEntries.filter(entry => childIds.includes(entry.id));
 }


 function zoomIn(nodeId,scale){
 	const zoomOptions = {
 		scale: scale ? scale : 1,
 		offset: {x:0, y:0},
 		animation: {
 			duration: 1000,
 			easingFunction: "easeInQuad"
 		}
 	};
 	console.log(zoomOptions);
 	// onclick(nodeId); 	
 	network.selectNodes([nodeId]); 	
 	network.focus(nodeId,zoomOptions);


 }
/**
 * Show infos about the selected node
 */
 function showSelectedInfo(info) {
 	const $container = document.getElementById('selected');
 	console.log(info);
 	/* clean container */
 	if (!info) return;







	// $infoBlock = document.createElement('div');
	// $infoBlock.innerHTML = [
	// 	`<h2>${info.label}</h2>`,
	// 	info.location ?  `<div>${info.location}</div>` : null,
	// 	info.description ? `<div>${info.description}</div>` : null,
	// 	`<hr />`
	// ].filter(Boolean).join('\n');
	// $container.appendChild($infoBlock);
}

/*
 * Show information of the provided child-entries
 */
 function showChildInfo(children) {
 	const $container = document.getElementById('children');


 	/* Clean container */
 	$container.innerHTML = '';
 	if (!children) return;
 	const $gridSizer = document.createElement('div');
 	$gridSizer.classList.add('grid-sizer', 'col-md-3');

 	$container.appendChild($gridSizer);
 	/* For each entry create a new DOM-element */
 	children.forEach(child => {
 		const $childInfo = document.createElement('div');
 		$childInfo.classList.add('grid-item','col-md-4','m-4');
 		$childInfo.innerHTML = [
 		`<div class="card">`,
 		`<div class="view view-cascade overlay">`,
 		`<img class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/men.jpg" alt="Card image cap">`,
 		`<a>`,
 		`<div class="mask rgba-white-slight"></div>`,
 		`</a>`,
 		`</div>`,
 		`<div class="card-body card-body-cascade text-center">`,

 		`<h4 class="card-title"><strong>${child.label}</strong></h4>`,
 		child.location ?  `<div>${child.location}</div>` : null,
 		child.description ? `<p class="card-text">${ child.description}</p>` : null,
 		`</div>`,
 		`</div>`
 		].join('\n');
 		$container.appendChild($childInfo);
 	});
 }




/**
 * Handler for node-select
 */
 function onclick(clickEventData) {
 	console.log(clickEventData);
 	/* get selected node */
 	const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;


 	// const selectedInfo = document.getElementById("selected");
 	// const noSelectedInfo = document.getElementById("notSelected");
	// highlightActive = true;
	// let i,j;
	// let degrees = 2;
	// console.log(data);
// allEntries.forEach(module =>{
// 	module.color="red";
// })

// var blah = network.getDataSet();
// console.log(blah);
console.log(selectedNodeId);

// network.setOptions({nodes:{color:"red"}});
if (selectedNodeId) {
	const selectedEntry = getSelectedInfos(selectedNodeId);
	nodeToInfo(selectedEntry)
	showSelectedInfo(selectedEntry);
	const childEntries = getChildInfos(selectedNodeId);
		// showChildInfo(childEntries);
		// neighbourhoodHighlight(selectedEntry);
		// noSelectedInfo.classList.add("invisible");
		// selectedInfo.classList.remove("invisible");
	} else {
		// selectedInfo.classList.add("invisible");
		// noSelectedInfo.classList.remove("invisible");
		showSelectedInfo(null);
		// showChildInfo(null);
		// neighbourhoodHighlight(null);
	}
}

/**
 * Load data and initialize the network.
 */
 async function init() {
 	/* Load data from server and store them globaly */
 	services = await getservices();
 	schools = await getSchools();
 	modules = await getmodules();
 	courses = await getcourses();	
 	corps = await getcorps();

 	/* Create one array with all entries for easy lookup */
 	allEntries = Object.freeze([
 		...services,
 		...schools,
 		...modules,
 		...courses,
 		...corps
 		]);

 	/* Ensure teh uses fontawesome is loaded */
 	await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');


 	var container = document.getElementById("network");

	/* Show "colleges > schools > courses" by default.
	* Could also be {} for an empty network by default. */
	// data = corpsToEmployeeCategory();
let exportDataSet;
         data = {
          nodes: getNodeData(corps),
          edges: getEdgeData(corps),
        };
	var options = {
		nodes:{
		shape: 'dot',
			mass: 4,
			widthConstraint: 100,
			margin: {
				top: 30
			},
						font: {
				size: 12,
				face: 'Tahoma'
			}
		},
  edges: {
  	arrows: 'to',
  	width: 0.15,
  	color: {inherit: 'from'},
  	smooth: {
  		type: 'continuous'
  	}
  },
  physics: {
  	enabled: true,
  	barnesHut: {
  		gravitationalConstant: -3000,
  		centralGravity: 0.3,
  		springLength: 4,
  		springConstant: 0.09,
  		damping: 1,
  		avoidOverlap: 1
  	},
  	maxVelocity: 33,
  	minVelocity: 0.12,
  	solver: "barnesHut",
  	timestep: 0.4
  },
  groups:GROUPS,
          manipulation: {
            addNode: function (data, callback) {
              // filling in the popup DOM elements
              document.getElementById("operation").innerText = "Add Node";
              document.getElementById("node-id").value = data.id;
              document.getElementById("node-label").value = data.label;
              document.getElementById("saveButton").onclick = saveData.bind(
                this,
                data,
                callback
              );
              document.getElementById("cancelButton").onclick =
                clearPopUp.bind();
              document.getElementById("network-popUp").style.display = "block";
            },
            editNode: function (data, callback) {
              // filling in the popup DOM elements
              document.getElementById("operation").innerText = "Edit Node";
              document.getElementById("node-id").value = data.id;
              document.getElementById("node-label").value = data.label;
              document.getElementById("saveButton").onclick = saveData.bind(
                this,
                data,
                callback
              );
              document.getElementById("cancelButton").onclick = cancelEdit.bind(
                this,
                callback
              );
              document.getElementById("network-popUp").style.display = "block";
            },
            addEdge: function (data, callback) {
              if (data.from == data.to) {
                var r = confirm("Do you want to connect the node to itself?");
                if (r == true) {
                  callback(data);
                }
              } else {
                callback(data);
              }
            },
          },
 	} 

var exportArea;
      var importButton;
      var exportButton;
      var importButton;
      var network;
      var cluster_id = 1;


        container = document.getElementById("network");
        exportArea = document.getElementById("input_output");
        importButton = document.getElementById("import_button");
        exportButton = document.getElementById("export_button");
        destroyButton = document.getElementById("destroy_button");

	 exportButton.addEventListener("click", function(){
	 	console.log("in here finally");
	 	exportNetwork();
	 });
	 	 destroyButton.addEventListener("click", function(){
	 	console.log("in here finally");
	 	destroyNetwork();
	 });
	 	 importButton.addEventListener("click", function(){
	 	console.log("in here finally");
	 	importNetwork();
	 });
 	 
      function addConnections(elem, index) {
      	// need to replace this with a tree of the network, then get child direct children of the element
        elem.proficiencies = network.getConnectedNodes(elem.id);

      }
function destroyNetwork() {
        network.destroy();
      }
function exportNetwork() {
        // clearOutputArea();
        var nodes = objectToArray(network.getPositions());
        nodes.forEach(function (e,i,a){
   					const nodeDataSetValue = exportDataSet.get(e.id);
        		e.learningType = nodeDataSetValue.learningType ? nodeDataSetValue.learningType : undefined;
        		e.payGrade = nodeDataSetValue.payGrade ? nodeDataSetValue.payGrade : 0;        		
						e.label = nodeDataSetValue.label ? nodeDataSetValue.label : e.id;
						e.group = e.payGrade;

      		
        	addConnections(e);
      })

        // pretty print node data
        var exportValue = JSON.stringify(nodes, undefined, 2);

        exportArea.value = exportValue;

        resizeExportArea();
      }

      function importNetwork() {
 					console.log(corps);

      	//  async function inputData() {
				//  }
        // var inputValue = await getcorps();
        // var inputData = JSON.parse(inputValue);

        var data = {
          nodes: getNodeData(corps),
          edges: getEdgeData(corps),
        };
        network = new vis.Network(container, data, {});

        resizeExportArea();
      }

      function getNodeData(data) {
        var networkNodes = [];
        data.forEach(function (elem, index, array) {
          networkNodes.push({
            id: elem.id,
            group: elem.learningType ? elem.learningType : "uol",
            type: elem.group,
            payGrade: elem.payGrade,
            label: elem.label ? elem.label : elem.id,
						image: elem.image ? elem.image : undefined,
						level: elem.level ? elem.level : undefined,
						color: elem.color ? elem.color : undefined,
						// size: elem.size ? elem.size : undefined
						// mass: elem.mass ? elem.mass : undefined,
	
          });
        });
        console.log(networkNodes);
        exportDataSet = new vis.DataSet(networkNodes); 
        return exportDataSet;
      }

      function getNodeById(data, id) {
        for (var n = 0; n < data.length; n++) {
          if (data[n].id == id) {
            // double equals since id can be numeric or string
            return data[n];
          }
        }

        throw "Can not find id '" + id + "' in data";
      }

      function getEdgeData(data) {
        var networkEdges = [];
        data.forEach(function (node) {
          // add the connection
          if (node.proficiencies){
          node.proficiencies.forEach(function (connId, cIndex, conns) {
            networkEdges.push({ from: node.id, to: connId });
            let cNode = getNodeById(data, connId);

            var elementConnections = cNode.proficiencies;
            if (elementConnections){
            // remove the connection from the other node to prevent duplicate connections
            var duplicateIndex = elementConnections.findIndex(function (
              connection
            ) {
              return connection == node.id; // double equals since id can be numeric or string
            });

            if (duplicateIndex != -1) {
              elementConnections.splice(duplicateIndex, 1);
            }
          }
          })
        }
        });

        return new vis.DataSet(networkEdges);
      }

      function cluster() {
        var clusterOptions = {
          joinCondition: function (childOptions) {
            console.log(childOptions);
            return childOptions.group === "proficiency";
          },
          clusterNodeProperties: {
            id: cluster_id,
            label: "Cluster " + cluster_id,
            allowSingleNodeCluster: false,
          },
        };
        cluster_id++;
        // network.clusterOutliers(clusterOptions);
        network.cluster(clusterOptions);
      }

      function objectToArray(obj) {
        return Object.keys(obj).map(function (key) {
          obj[key].id = key;
          return obj[key];
        });
      }

      function resizeExportArea() {
        exportArea.style.height = 1 + exportArea.scrollHeight + "px";
      }
      function clearOutputArea() {
        exportArea.value = "";
      }
      function clearPopUp() {
        document.getElementById("saveButton").onclick = null;
        document.getElementById("cancelButton").onclick = null;
        document.getElementById("network-popUp").style.display = "none";
      }

      function cancelEdit(callback) {
        clearPopUp();
        callback(null);
      }

      function saveData(data, callback) {
        data.id = document.getElementById("node-id").value;
        data.learningType = document.getElementById("node-learningType").value;
        data.payGrade = document.getElementById("node-payGrade").value;        
        data.label = document.getElementById("node-label").value;
        clearPopUp();
        callback(data);
      }

  network = new vis.Network(container, data, options);
          // network.clusterOutliers();
  				// network.clusterByConnection(1);
  // cluster();
  	       network.on("selectNode", function (params) {
        if (params.nodes.length == 1) {
          if (network.isCluster(params.nodes[0]) == true) {
            network.openCluster(params.nodes[0]);
          }
        }
      });	
  // network.on('selectNode', onclick);

  /* Add network click handler */
  // network.on('click', onclick);
	// network.on("click", neighbourhoodHighlight);

	/* After everything is loaded enable the buttons*/
	// enableButtons();
}

