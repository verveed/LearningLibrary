let network, data, allNodes, allRankNodes, services, schools, modules, courses, functions, allEntries;
let highlightActive = false;
	let proficiencyArrayContainer = [];

const NODE_COLOR = '#9b4dca';
const NODE_ICON_SIZE = 40;
const EDGE_COLOR = '#4B0082';
// const highlightActive = false;


 // const location69 = (function () {
 //                if (document.currentScript) {
 //                    let link = document.currentScript.src;
 //                    let lastIndex = link.lastIndexOf('/');
 //                    link = link.substring(0, lastIndex);
 //                    return link;
 //                }
 // })();
 // console.log(location69);


// const ADELE_Folder_URI = () => {


// 	https://www.adele.edu.au/pluginfile.php/4840571/mod_folder/content/0/vis_LCC/app2.js?forcedownload=1
// }
const DEFAULT_EDGE_SETTINGS = {
	// color: EDGE_COLOR,
	arrows: {
		to: {
			enabled: true
		}
	}
}
const GROUPS = {
	zero:{
		color:{
			background: "rgba(14,178,98,0)",
			border: "rgba(14,178,98,0)"			
		},
		
	}

};

async function get_ranks() {
	return fetch('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/Fulltime/ranks.json').then(response => response.json());
}
async function getSOI_proficiences() {
	return fetch('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/proficiencies.json').then(response => response.json());
}

// const nodeId = 1457;

// await require(['jquery','core/ajax'], function getADELECompetencyInfo($,ajax) {
// console.log(nodeId);
//   // -----------------------------
//     //  toggle event
//       // get current value then call ajax to get new data
//       ajax.call([{
//         methodname: 'tool_lp_list_courses_using_competency',
//         args: {
//           id: nodeId
//         },
//       }])[0].done(function(response) {
//         // clear out old values
//         console.log(response);
//         return response;
//       }).fail(function(err) {
//         console.log(err);
//         //notification.exception(new Error('Failed to load data'));
//         return err;
//       });
  
// });

// console.log(compInfo);
 

function ProficienciesToRanks() {
	const proficiencies_to_ranks_Edges = new Set;
	// const proficiencyNodes = new Set;
	const rankNodes = new Set;
	// proficiencies.forEach(proficiency => {
	// 	proficiencyNodes.add({
	// 		id: proficiency,
	// 		hiddenLabel: proficiency,
	// 		label: undefined,
	// 		group: 'zero'
	// 	})
	// })

	ranks.forEach(rank => {
		let i = 0;
	

		const rankProficiency = rank.proficiencies || [];
		rankProficiency.forEach(prof => {
			i++
			rank.value = i;
			// rankNodes.add({
			// 	id: prof,
			// })

			proficiencies_to_ranks_Edges.add({
				from: prof,
				to: rank.id,
			})
		});
		const rankOptionals = rank.optionals || [];
		rankOptionals.forEach(optional => {
				// rankNodes.add({
				// 	id: optional
				// })
			
			proficiencies_to_ranks_Edges.add({
				from:optional,
				to: rank.id,
			})
		})
				rankNodes.add({id: rank.id, label: rank.label, hiddenLabel: undefined, group: rank.payGrade});
		// nodes.updateOnly({id: rank.id, label: rank.label, hiddenLabel: undefined, group: rank.payGrade, value: rank.value});	
	});
		nodes = new vis.DataSet([
		...rankNodes
		]);
	rankNodesDataSet = new vis.DataSet([
		...rankNodes
		]);
	const edges = new vis.DataSet([
		...proficiencies_to_ranks_Edges
		]);
	allNodes = rankNodesDataSet.get({ returnType: "Object" });
	allRankNodes = rankNodesDataSet.get({ returnType: "Object" });

	return {
		nodes,
		edges
	}
}




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



const $accordionVisInfo_header = document.getElementById('accordionVisInfo_header');
$accordionVisInfo_header.innerHTML = '';
const $accordionVisInfo_corp = info.corp || null;
			$accordionVisInfo_header_serviceIcon = document.createElement('img');
			$accordionVisInfo_header_serviceIcon.classList.add('rounded-circle','mr-3');
			$accordionVisInfo_header.innerHTML = [
			// `${accordionVisInfo_header_serviceIcon}`,
			`<img class='rounded-circle mr-3' src='https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/corp_icons/${info.corp}.png'>`,
			`<div><h4 class='card-title font-weight-bold mb-2'>${info.label}<h4>`,
			`<p class='card-text'>Corp: ${info.corp}</p></div>`
			].filter(Boolean).join('\n');
			// $accordionVisInfo_header.appendChild($accordion);

const payGrade_ul = document.getElementById("accordionVisInfo_deliveryModes_payGrade");
			for (const child of payGrade_ul.children) {
				child.classList = "";
  console.log(child.tagName);
}
const payGrade_li_string = `accordionVisInfo_deliveryModes_payGrade_li_${info.payGrade}`
 const payGrade_li = document.getElementById(payGrade_li_string);
payGrade_li.classList="active";

	const $liveCourses_ul = document.getElementById('accordionVisInfo_liveCourses_ul');
	$liveCourses_ul.innerHTML = '';
	 let tempCompetencyCourses_API_Return = [{
    "label": "Supervisor Platoon Operations Grade 2",
    "id": "P109350",
    "payGrade": 5,
    "proficiencies": [
        "P021153",
        "P020110",
        "P020124",
        "P104583"
    ],
    "value": 4
}];
	//this is where the "tool_lp_list_courses_using_competency" fetch needs to occur.  For this to work
	//we need to ensure there's accurate mapping from the UoL/skill/competency to each ADELE Competency.
	const $liveCourses = tempCompetencyCourses_API_Return || [];
		$liveCourses.forEach(liveCourse => {
			// liveCourse = liveCourse.replace(/_/g," ");
			$accordion = document.createElement('span');
			$accordion.innerHTML = [
			`<a class="pr-2"><img src="./Assets/adele_icon.png"><span onclick="zoomIn('${liveCourse.id}');";`,
			`class="grey-text"></a>${liveCourse.label}</span>`,
			].filter(Boolean).join('\n');
			$liveCourses_ul.appendChild($accordion);
		})

		const courseCardContainer = document.getElementById('children');

	
	/* Clean container */
	courseCardContainer.innerHTML = '';
	if (!children) return;

}

/*
 * Show information of the provided child-entries
 */
function showChildInfo(children) {
	const $tradePaths_ul = document.getElementById('accordionVisInfo_tradePaths_ul');
	$tradePaths_ul.innerHTML = '';
	/* For each entry create a new DOM-element */
	children.forEach(child => {
		// console.log(child);

				$accordion = document.createElement('div');
			$accordion.innerHTML = [
			`<li class="list-group-item pr-2"><a class="font-weight-bold cyan-lighter-hover mb-3" onclick="zoomIn('${child.id}');"`,
			`class="grey-text">${child.label.replace(/_/g," ")}</a>`,
			].filter(Boolean).join('\n');
			$tradePaths_ul.appendChild($accordion);

	});
}


const touchedEdges = [];

function neighbourhoodHighlight(params) {
        // if something is selected:
	console.log(highlightActive);
	var tester = network.getSelection();
	var selectedNode = tester.nodes[0];
	let selectedEdges = tester.edges;


	touchedEdges.forEach((edge) => {
		data.edges.updateOnly({id: edge, color: undefined});
	})
	touchedEdges.length = 0;

	if (tester.nodes.length > 0) {
		console.log("in network.getSelection's returned array, which is more than 0");

		selectedEdges.forEach((edge) => {
			touchedEdges.push(edge);
			data.edges.updateOnly({id: edge, color: {inherit:'from'}});

	// return selectedEdges[edge].hidden == false;
		});        	



		selectedEdges = [];
		highlightActive = true;

		var i, j;
          // var selectedNode = params.nodes[0];
          // console.log(selectedNode);

		var degrees = 2;
          // var tester = network.getSelection();
          // var selectedNode = tester.nodes[0];
          // mark all nodes as hard to read.
		for (var nodeId in allRankNodes) {
			allRankNodes[nodeId].color = "rgba(200,200,200,0.5)";
						// allNodes[nodeId].opacity = ;            
            //below does not fire on FIRST run
			if (allRankNodes[nodeId].hiddenLabel === undefined) {
				allRankNodes[nodeId].hiddenLabel = allRankNodes[nodeId].label;
				allRankNodes[nodeId].label = undefined;
			}
		}
		var connectedNodes = network.getConnectedNodes(selectedNode);
		var allConnectedNodes = [];
          // get the second degree nodes
		for (i = 1; i < degrees; i++) {
			for (j = 0; j < connectedNodes.length; j++) {
				// allNodes[selectedNode].value = j;
				allConnectedNodes = allConnectedNodes.concat(
					network.getConnectedNodes(connectedNodes[j])
					);
			}
		}

          // all second degree nodes get a different color and their label back
		for (i = 0; i < allConnectedNodes.length; i++) {
			console.log()
			if(allRankNodes[allConnectedNodes[i]]){
			allNodes[allConnectedNodes[i]].color = "rgba(150,150,150,0.75)";
						// allRankNodes[allConnectedNodes[i]].opacity = undefined;            
			if (allNodes[allConnectedNodes[i]].hiddenLabel !== undefined) {
				allNodes[allConnectedNodes[i]].label =
				allNodes[allConnectedNodes[i]].hiddenLabel;
				allNodes[allConnectedNodes[i]].hiddenLabel = undefined;
			}
		}
		}

          // all first degree nodes get their own color and their label back
		for (i = 0; i < connectedNodes.length; i++) {
							console.log(allNodes[connectedNodes[i]]);

			if (allNodes[connectedNodes[i]].group == 'zero'){
				allNodes[connectedNodes[i]].color = "rgba(15,27,180,1)";
			}
			else{
				allNodes[connectedNodes[i]].color = undefined;
			}
						// allNodes[connectedNodes[i]].opacity = 1;            
			if (allNodes[connectedNodes[i]].hiddenLabel !== undefined) {
				allNodes[connectedNodes[i]].label = allNodes[connectedNodes[i]].hiddenLabel;
				allNodes[connectedNodes[i]].hiddenLabel = allNodes[connectedNodes[i]].label;
			}
		}

          // the main node gets its own color and its label back.
		allNodes[selectedNode].color = undefined;
					// allNodes[selectedNode].opacity = undefined;                      
		if (allNodes[selectedNode].hiddenLabel !== undefined) {
			allNodes[selectedNode].label = allNodes[selectedNode].hiddenLabel;
			allNodes[selectedNode].hiddenLabel = allNodes[selectedNode].label;
		}
	} else if (highlightActive === true) {
          // reset all nodes
		for (var nodeId in allNodes) {
			allNodes[nodeId].color = undefined;
			if (allRankNodes[nodeId] && allRankNodes[nodeId].hiddenLabel !== undefined) {
				allRankNodes[nodeId].label = allRankNodes[nodeId].hiddenLabel;
				allRankNodes[nodeId].hiddenLabel = undefined;
			}
			else{
				allNodes[nodeId].hiddenLabel = allNodes[nodeId].label;							
				allNodes[nodeId].label = undefined; 
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

	data.nodes.updateOnly(updateArray);

}
/**
 * Handler for node-select
 */
function onclick(clickEventData) {
	/* get selected node */
	const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;
if (!selectedNodeId){	nodes.remove(proficiencyArrayContainer)}
// console.log(myNamespace);
// console.log(window.myNamespace);
// 	const competencyData = myNamespace.getCompetencyData(1457,"tool_lp_list_courses_using_competency");

// console.log (competencyData);
// 	highlightActive = true;
// 	let i,j;
// 	let degrees = 2;
// 	console.log(data);
// allEntries.forEach(module =>{
// 	module.color="red";
// })

// var blah = network.getDataSet();
// console.log(blah);
		console.log(selectedNodeId);

		let thisEntry = allEntries.find(entry => entry.id === selectedNodeId);

	// const childIds = network.getConnectedNodes(id, 'to');
 
console.log(thisEntry);
if (thisEntry){
		const rankProficiency = thisEntry.proficiencies || [];
		rankProficiency.forEach(prof => {
		let currentNetworkNodesSearch = network.findNode(prof);
		if (!currentNetworkNodesSearch.length){
			console.log(prof);
		proficiencyArrayContainer.push(prof);
nodes.update([
  {
  	id: prof,
  	x: prof.x,
  	y: prof.y, 
  label: prof.label ? prof.label : prof
}
]);
}

		});
	}

// network.setOptions({nodes:{color:"red"}});
	if (selectedNodeId) {
		const selectedEntry = getSelectedInfos(selectedNodeId);
		showSelectedInfo(selectedEntry);
		const childEntries = getChildInfos(selectedNodeId);
		showChildInfo(childEntries);
		// neighbourhoodHighlight(selectedEntry);
	} else {
		return;
		showSelectedInfo(null);
		showChildInfo(null);
		// neighbourhoodHighlight(null);
	}
}

/**
 * Load data and initialize the network.
 */
async function init() {

	ranks = await get_ranks();
	proficiencies = await getSOI_proficiences();



	/* Create one array with all entries for easy lookup */
	allEntries = Object.freeze([
		// ...services,
		// ...schools,
		// ...modules,
		// ...courses,
		// ...functions,
		...ranks
		// ...proficiencies,
		// ...courses,
		]);

	/* Ensure teh uses fontawesome is loaded */
	await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');
	

	var container = document.getElementById("network");

	/* Show "colleges > schools > courses" by default.
	 * Could also be {} for an empty network by default. */
	data = ProficienciesToRanks();

	var options = {

		groups:GROUPS,
		nodes: {
			shape: 'dot',
			mass: 8,
			shadow: true,
			borderWidth: 2,
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
		layout: {
			improvedLayout:true,
			hierarchical: {
				enabled:false,
				levelSeparation: 150,
				nodeSpacing: 100,
				treeSpacing: 200,
				blockShifting: true,
				edgeMinimization: true,
				parentCentralization: true,
      direction: 'UD',        // UD, DU, LR, RL
      sortMethod: 'directed',  // hubsize, directed
      shakeTowards: 'roots'  // roots, leaves
    }
  },
  edges: {
  	arrows: 'to',
  	shadow: true,
  	width: 2,
  	color: {inherit: 'from'},
  	smooth: {
  		type: 'continuous'
  	}
  },
  physics: {
    barnesHut: {
    	springLength: 90,
    	springConstant: 0.05,
      centralGravity: -1.1,
      damping: 2,
      avoidOverlap: 0.2,
    },
    minVelocity: 0.75
  },

};

//       }


network = new vis.Network(container, data, options);

	/* Add network click handler */
	network.on('click', onclick);
// network.on("click", neighbourhoodHighlight);


}


document.addEventListener("DOMContentLoaded", init);
// let someData = getCompetencyData();
// console.log(someData);
// let someData2 = getData();
// console.log(someData2);
