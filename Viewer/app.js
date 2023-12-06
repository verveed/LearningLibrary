
let network, data, allNodes, services, schools, modules, courses, functions, allEntries;
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
	common: {
					color: "#545454",

		// shape: "icon",
		// icon: {
		// 	face: "'FontAwesome'",
		// 	code: "\uf0f7",
		// 	size: NODE_ICON_SIZE,
		// },
	},
		land: {
						color: "#7be141",

		// shape: "icon",
		// icon: {
		// 	face: "'FontAwesome'",
		// 	code: "\uf0f7",
		// 	size: NODE_ICON_SIZE,
		// },
	},
		maritime: {
						color: "#6e6efd",

		// shape: "icon",
		// icon: {
		// 	face: "'FontAwesome'",
		// 	code: "\uf0f7",
		// 	size: NODE_ICON_SIZE,
		// },
	},
		air: {
						color: "#97c2fc",

		// shape: "icon",
		// icon: {
		// 	face: "'FontAwesome'",
		// 	code: "\uf0f7",
		// 	size: NODE_ICON_SIZE,
		// },
	},
	joint:{
		color: "#ad85e4",
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
async function getFunctions() {
	return fetch('./data/functions.json').then(response => response.json());
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


/**
 * Get all edges form all functions to its courses.
 */
function functionsTocoursesData() {
	const usedFunctions = new Set();
	modules.forEach(module => {
		const moduleFunctions = module.functions || [];
		moduleFunctions.forEach(tag => {
			usedFunctions.add(tag);
		});
	});

	const functionNodes = [];
	functions.forEach(func => {
		if (usedFunctions.has(func.id)) {
			functionNodes.push({
				id: func.id,
				label: func.label,
				shape: "circularImage",
				image: "./function_icons/"+func.id+"_Circle.png",
				level: 0,
				color: "white"
				// group: 'tag'
			});
		}
	});

	const moduleNodes = modules.map(module => {
		return {
			id: module.id,
			label: module.label,
			level: module.level,
			shape: "image",
			image: "./service_icons/"+module.service+".png",
					}
	});

	const courseNodes = courses.map(course => {
		return {
			id: course.id,
			label: course.label,
			level: 10,
			group: 'course'
		}
	});

	const nodes = new vis.DataSet([
		...functionNodes,
		...moduleNodes
			]);
	allNodes = nodes.get({ returnType: "Object" });

	const tagTomodule = [];
	for (const module of modules) {
		const moduleTags = module.functions || [];
		moduleTags.forEach(tagId => {
			tagTomodule.push({
				from: tagId,
				to: module.id,
				color: "rgb("+functions.find(blardy => blardy.id == tagId).color+")"
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
				color: prerequisiteId.color
			});
		});
	}

	const modulesTocourses = [];
	for (const course of courses) {
		const courseId = course.id;
		const coursemodules = course.modules || [];
		coursemodules.forEach(moduleId => {
			modulesTocourses.push({
				from: moduleId,
				to: courseId,
				...DEFAULT_EDGE_SETTINGS
			});
		});
	}

	const edges = new vis.DataSet([
		...moduleToprerequisites,
		...tagTomodule
		// ...modulesTocourses
	]);

//load side information about functions
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
 * Get all edges form all modules to its courses.
 */
function modulesTocoursesData() {
	const moduleNodes = modules.map(module => {
		return {
			id: module.id,
			label: module.label,
			level: 0,
			group: 'module'
		}
	});

	const courseNodes = courses.map(course => {
		return {
			id: course.id,
			label: course.label,
			level: 1,
			group: 'course'
		}
	});

	const nodes = new vis.DataSet([
		...moduleNodes,
		...courseNodes,
	]);
	allNodes = nodes.get({ returnType: "Object" });
	const modulesTocourses = [];
	for (const course of courses) {
		const courseId = course.id;
		const coursemodules = course.modules || [];
		coursemodules.forEach(moduleId => {
			modulesTocourses.push({
				from: moduleId,
				to: courseId,
				...DEFAULT_EDGE_SETTINGS
			});
		});
	}

	const edges = new vis.DataSet([
		...modulesTocourses
	]);

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
network.focus(nodeId,zoomOptions);
network.selectNodes([nodeId]);
onclick(nodeId);
	}
/**
 * Show infos about the selected node
 */
function showSelectedInfo(info) {
	const $container = document.getElementById('selected');
	console.log(info);
	/* clean container */
	if (!info) return;



	// const $accordionVisInfo_header_moduleTitle = document.getElementById('accordionVisInfo_header_moduleTitle');
	const $accordionVisInfo_header_moduleImages = document.getElementById('accordionVisInfo_header_moduleImage');
	// const $accordionVisInfo_header_serviceTitle = document.getElementById('accordionVisInfo_serviceTitle');
	// const $accordionVisInfo_header_serviceIcon = document.getElementById('accordionVisInfo_serviceIcon');


	// $accordionVisInfo_header_serviceTitle.innerHTML = info.service;
	// $accordionVisInfo_header_moduleTitle.innerHTML = info.label;
	$accordionVisInfo_header_moduleImages.src =`./module_headers/${info.id}.jpg`
	// $accordionVisInfo_header_serviceIcon.src =`./service_icons/${info.service}.png`


const $accordionVisInfo_header = document.getElementById('accordionVisInfo_header');
$accordionVisInfo_header.innerHTML = '';
const $accordionVisInfo_service = info.service || null;
			$accordionVisInfo_header_serviceIcon = document.createElement('img');
			$accordionVisInfo_header_serviceIcon.classList.add('rounded-circle','mr-3');
			$accordionVisInfo_header.innerHTML = [
			// `${accordionVisInfo_header_serviceIcon}`,
			`<img class='rounded-circle mr-3' src='./service_icons/${info.service}.png'>`,
			`<div><h4 class='card-title font-weight-bold mb-2'>${info.label}<h4>`,
			`<p class='card-text'>Applicability: ${info.service}</p></div>`
			].filter(Boolean).join('\n');
			// $accordionVisInfo_header.appendChild($accordion);



	const $usedFunctions_ul = document.getElementById('accordionVisInfo_usedFunctions_ul');
	$usedFunctions_ul.innerHTML = '';
	const $usedFunctions = info.functions || [];
		$usedFunctions.forEach(usedFunction => {
			// usedFunction = usedFunction.replace(/_/g," ");
			$accordion = document.createElement('span');
			$accordion.innerHTML = [
			`<a class="pr-2"><span onclick="zoomIn('${usedFunction}');";`,
			`class="grey-text"><img src="./function_icons/${usedFunction}_Circle.png"></a></span>`,
			].filter(Boolean).join('\n');
			$usedFunctions_ul.appendChild($accordion);
		})


const $prerequisites_ul = document.getElementById('accordionVisInfo_prerequisites_ul');
$prerequisites_ul.innerHTML = '';
const $prerequisites = info.prerequisites || [];
	$prerequisites.forEach(prerequisite => {
		const prerequisite_module = modules.find(module => module.id === prerequisite);
			$accordion = document.createElement('div');
			$accordion.innerHTML = [
			`<li class="list-group-item pr-2"><a class="font-weight-bold cyan-lighter-hover mb-3" onclick="zoomIn('${prerequisite_module.id}');"`,
			`class="grey-text">${prerequisite_module.label.replace(/_/g," ")}</a>`,
			].filter(Boolean).join('\n');
			$prerequisites_ul.appendChild($accordion);
	})

	const $usedCourses_ul = document.getElementById('accordionVisInfo_usedCourses_ul');
	$usedCourses_ul.innerHTML = '';
	const usedCourses = courses.filter(course => course.modules.includes(info.id));
		const courseCardContainer = document.getElementById('children');

	
	/* Clean container */
	courseCardContainer.innerHTML = '';
	if (!children) return;
	usedCourses.forEach(usedCourse => {

			// usedusedCourse = usedusedCourse.replace(/_/g," ");
			$accordion = document.createElement('div');
			$accordion.innerHTML = [
			`<li class="list-group-item pr-2"><a class="font-weight-bold cyan-lighter-hover mb-3" onclick="zoomIn('${usedCourse.id}');"`,
			`class="grey-text">${usedCourse.label.replace(/_/g," ")}</a>`,
			].filter(Boolean).join('\n');
			$usedCourses_ul.appendChild($accordion);


 	// 	const courseCard = document.createElement('div');
		// courseCard.classList.add('grid-item','col-md-4','m-4');
		// courseCard.innerHTML = [
		// `<div class="card">`,
		//   `<div class="view view-cascade overlay">`,
  //  `<img class="card-img-top" src="https://mdbootstrap.com/img/Photos/Others/men.jpg" alt="Card image cap">`,
  //   `<a>`,
  //     `<div class="mask rgba-white-slight"></div>`,
  //   `</a>`,
  // `</div>`,
		//   `<div class="card-body card-body-cascade text-center">`,

		// `<h4 class="card-title"><strong>${usedCourse.label}</strong></h4>`,
		// 	usedCourse.location ?  `<div>${usedCourse.location}</div>` : null,
		// 	usedCourse.description ? `<p class="card-text">${ usedCourse.description}</p>` : null,
		// 	`</div>`,
		// 	`</div>`
		// ].join('\n');
		// courseCardContainer.appendChild(courseCard);



})


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
 * Button handler "colleges > schools > courses"
 */
function btn1() {
	 data = serviceTocourseData();
	network.setData(data);
}

/**
 * Button handler "functions > modules > courses"
 */
function btn2() {
	 data = functionsTocoursesData();
	network.setData(data);
}

/**
 * Button handler "modules > courses"
 */
function btn3() {
	 data = modulesTocoursesData();
	network.setData(data);
}
function neighbourhoodHighlight(params) {
        // if something is selected:
                  var tester = network.getSelection();
          var selectedNode = tester.nodes[0];

        if (tester.nodes.length > 0) {
          highlightActive = true;
          var i, j;
          // var selectedNode = params.nodes[0];
          // console.log(selectedNode);

          var degrees = 2;
          var tester = network.getSelection();
          var selectedNode = tester.nodes[0];
          console.log(selectedNode);
          // mark all nodes as hard to read.
          for (var nodeId in allNodes) {
            allNodes[nodeId].color = "rgba(200,200,200,0.5)";
            if (allNodes[nodeId].hiddenLabel === undefined) {
              allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;
              allNodes[nodeId].label = undefined;
            }
          }
          var connectedNodes = network.getConnectedNodes(selectedNode);
          var allConnectedNodes = [];
          console.log(connectedNodes)
          // get the second degree nodes
          for (i = 1; i < degrees; i++) {
            for (j = 0; j < connectedNodes.length; j++) {
              allConnectedNodes = allConnectedNodes.concat(
                network.getConnectedNodes(connectedNodes[j])
              );
            }
          }

          // all second degree nodes get a different color and their label back
          for (i = 0; i < allConnectedNodes.length; i++) {
            allNodes[allConnectedNodes[i]].color = "rgba(150,150,150,0.75)";
            if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
              allNodes[allConnectedNodes[i]].label =
                allNodes[allConnectedNodes[i]].hiddenLabel;
              allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
            }
          }

          // all first degree nodes get their own color and their label back
          for (i = 0; i < connectedNodes.length; i++) {
            allNodes[connectedNodes[i]].color = undefined;
            if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
              allNodes[connectedNodes[i]].label =
                allNodes[connectedNodes[i]].hiddenLabel;
              allNodes[connectedNodes[i]].hiddenLabel = undefined;
            }
          }

          // the main node gets its own color and its label back.
          allNodes[selectedNode].color = undefined;
          if (allNodes[selectedNode].hiddenLabel !== undefined) {
            allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
            allNodes[selectedNode].hiddenLabel = undefined;
          }
        } else if (highlightActive === true) {
          // reset all nodes
          for (var nodeId in allNodes) {
            allNodes[nodeId].color = undefined;
            if (allNodes[nodeId].hiddenLabel !== undefined) {
              allNodes[nodeId].label = allNodes[nodeId].hiddenLabel;
              allNodes[nodeId].hiddenLabel = undefined;
            }
          }
          highlightActive = false;
        }

        // transform the object into an array
        var updateArray = [];
        for (nodeId in allNodes) {
          if (allNodes.hasOwnProperty(nodeId)) {
            updateArray.push(allNodes[nodeId]);
          }
        }
        data.nodes.update(updateArray);
      }
/**
 * Handler for node-select
 */
function onclick(clickEventData) {
	/* get selected node */
	const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;

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
		console.log(selectedEntry);
		showSelectedInfo(selectedEntry);
		const childEntries = getChildInfos(selectedNodeId);
		// showChildInfo(childEntries);
		neighbourhoodHighlight(selectedEntry);
	} else {
		showSelectedInfo(null);
		// showChildInfo(null);
		neighbourhoodHighlight(null);
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
	functions = await getFunctions();

	/* Create one array with all entries for easy lookup */
	allEntries = Object.freeze([
		...services,
		...schools,
		...modules,
		...courses,
		...functions
	]);

	/* Ensure teh uses fontawesome is loaded */
	await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');
	

	var container = document.getElementById("network");

	/* Show "colleges > schools > courses" by default.
	 * Could also be {} for an empty network by default. */
	 data = functionsTocoursesData();

 var options = {
 	layout: {
          hierarchical: {
            direction: "UD",
            sortMethod: "directed",
          },
        },
 	// groups:GROUPS,
    nodes: {
      shape: 'dot',
      mass: 4,
      widthConstraint: 100,
      margin: {
      	top: 30
      },
      // scaling: {
      //   min: 10,
      //   max: 30,
      //   label: {
      //     min: 8,
      //     max: 30,
      //     drawThreshold: 12,
      //     maxVisible: 20
      //   }
      // },
      font: {
        size: 12,
        face: 'Tahoma'
      }
    },
    // layout: {
    //   improvedLayout:true
    // },
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
    interaction: {
      navigationButtons: true,
      keyboard: true,
      tooltipDelay: 200,
      hideEdgesOnDrag: true
    }
  };



	network = new vis.Network(container, data, options);

	/* Add network click handler */
	network.on('click', onclick);
	// network.on("click", neighbourhoodHighlight);

	/* After everything is loaded enable the buttons*/
	// enableButtons();
}

