const NODE_COLOR = '#9b4dca';
const NODE_ICON_SIZE = 40;
const EDGE_COLOR = '#4B0082';
const DEFAULT_EDGE_SETTINGS = { arrows: { to: { enabled: true } } };
const GROUPS = {
  zero: {
    color: {
      background: "rgba(14,178,98,0)",
      border: "rgba(14,178,98,0)"
    }
  }
};

let network, data, allNodes, allRankNodes, allEntries;
let highlightActive = false;
let proficiencyArrayContainer = [];

const fetchJSON = async (url) => {
  const response = await fetch(url);
  return response.json();
};

const getRanks = () => fetchJSON('CORP_data/School_Infantry/Fulltime/ranks.json');
const getSOIProficiencies = () => fetchJSON('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/proficiencies.json');

const createProficienciesToRanksData = (ranks) => {
  const rankNodes = new Set();
  const proficienciesToRanksEdges = new Set();

  ranks.forEach(rank => {
    let i = 0; 
    const { proficiencies = [], optionals = [], id, label, payGrade } = rank;
    const allProficiencies = [...proficiencies, ...optionals];

    allProficiencies.forEach(prof => {
      i++;
      proficienciesToRanksEdges.add({ from: prof, to: id });
    });

    rankNodes.add({ id, label, group: payGrade, value: i });
  });

  return {
    nodes: new vis.DataSet([...rankNodes]),
    rankNodesDataSet: new vis.DataSet([...rankNodes]),
    edges: new vis.DataSet([...proficienciesToRanksEdges])
  };
};


//The below findTopmostNode function can be reactivated if the JSON ends up being unstructured for some reason.
// const findTopmostNode = (allEntries) => {
//   const proficiencySet = new Set();
// allEntries.forEach(entry => {
//   const combined = [...(entry.optionals || []), ...(entry.proficiencies || [])];
//   combined.forEach(item => proficiencySet.add(item));
// });

//   return allEntries.find(entry => !proficiencySet.has(entry.id));
// };

const initNetworkWithTopNode = (allEntries) => {
  //the below line is associated with the function above and needs reactivation with it
  // const topNode = findTopmostNode(allEntries);

  const topNode = allEntries[0];

  console.log(topNode);
  if (!topNode) return { nodes: [], edges: [] };

  const nodes = new vis.DataSet([{
    id: topNode.id,
    label: topNode.label,
    group: topNode.payGrade
  }]);

  const edges = new vis.DataSet([]);

  return { nodes, edges };
};

// More functions (getSelectedInfos, getChildInfos, zoomIn, showSelectedInfo, showChildInfo, neighbourhoodHighlight, onclick) can be refactored similarly.

const init = async () => {
  const ranks = await getRanks();
  const proficiencies = await getSOIProficiencies();
  allEntries = Object.freeze([...ranks]);
  await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');
  
  const container = document.getElementById("network");
  data = initNetworkWithTopNode(allEntries);
  const options = {
configure: {
            container: document.getElementById("config"),
          },
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
    //   hierarchical: {
    //     enabled:false,
    //     levelSeparation: 150,
    //     nodeSpacing: 100,
    //     treeSpacing: 200,
    //     blockShifting: true,
    //     edgeMinimization: true,
    //     parentCentralization: true,
    //   direction: 'UD',        // UD, DU, LR, RL
    //   sortMethod: 'directed',  // hubsize, directed
    //   shakeTowards: 'roots'  // roots, leaves
    // }
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

  network = new vis.Network(document.getElementById("network"), data, options);
  network.on('click', onclick);
};

//the below needs to change, it's just getting the array value of the clicked node
const getSelectedInfos = (id) => allEntries.find(entry => entry.id === id);


const getAllDependentNodes = (id) => allEntries.filter(entry => entry.proficiencies.includes(id));


const getChildInfos = (id) => {
  const childIds = network.getConnectedNodes(id, 'to');
  return allEntries.filter(entry => childIds.includes(entry.id));
};

const zoomIn = (nodeId, scale = 1) => {
  const zoomOptions = {
    scale,
    offset: { x: 0, y: 0 },
    animation: {
      duration: 1000,
      easingFunction: "easeInQuad"
    }
  };
  network.focus(nodeId, zoomOptions);
  network.selectNodes([nodeId]);
  // onclick(nodeId);
};

const showSelectedInfo = (info) => {
  const container = document.getElementById('selected');
  if (!info) return;

  // Implementation to show selected node info
  // ...
};

const showChildInfo = (children) => {
  const container = document.getElementById('children');
  container.innerHTML = '';
  if (!children) return;

  // Implementation to show child node info
  // ...
};

const neighbourhoodHighlight = (params) => {
  // if something is selected:
  let tester = network.getSelection();
  let selectedNode = tester.nodes[0];
  let selectedEdges = tester.edges;

  // Implementation of neighbourhood highlight functionality
  // ...
};

// const onclick = (clickEventData) => {
//   const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;
//   if (!selectedNodeId) {
//     nodes.remove(proficiencyArrayContainer);
//     return;
//   }

//   let thisEntry = getSelectedInfos(selectedNodeId);
//   // Implementation of onclick functionality
//   // ...
// };

const onclick = (clickEventData) => {
  const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;
  if (!selectedNodeId) return;

//dependentNodes contains an array of all JSON entries that have a selectedNode as a proficiency.
  const dependentNodes = getAllDependentNodes(selectedNodeId);
  const selectedEntry = getSelectedInfos(selectedNodeId);
  if (!selectedEntry || !selectedEntry.proficiencies) return;

  const currentNodes = data.nodes.getIds();
  const newNodes = [];
  const newEdges = [];
  

  selectedEntry.proficiencies.forEach(proficiencyId => {
    if (!currentNodes.includes(proficiencyId)) {
      newNodes.push({ id: proficiencyId, label: proficiencyId });
      newEdges.push({ from: selectedNodeId, to: proficiencyId });
    }
  });

//now let's look for other nodes that need the selected and make their nodes/edges
    dependentNodes.forEach(dependentNode => {
    if (!currentNodes.includes(dependentNode.id)) {
      newEdges.push({ from: selectedNodeId, to: dependentNode.id });    
      newNodes.push({ id: dependentNode.id, label: dependentNode.label, group: dependentNode.payGrade });    
    }
  });

  data.nodes.add(newNodes);
  data.edges.add(newEdges);

  // Optional: Implement showSelectedInfo and showChildInfo as needed
};

// const init = async () => {
//   const ranks = await getRanks();
//   const proficiencies = await getSOIProficiencies();
//   allEntries = Object.freeze([...ranks]);
//   await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');
  
//   const container = document.getElementById("network");
//   data = createProficienciesToRanksData(ranks);
//   const options = { /* Options object */ };

//   network = new vis.Network(container, data, options);
//   network.on('click', onclick);
// };

document.addEventListener("DOMContentLoaded", init);
