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

const getRanks = () => fetchJSON('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/Fulltime/ranks.json');
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

const findTopmostNode = (allEntries) => {
  const proficiencySet = new Set();
allEntries.forEach(entry => {
  const combined = [...(entry.optionals || []), ...(entry.proficiencies || [])];
  combined.forEach(item => proficiencySet.add(item));
});

  return allEntries.find(entry => !proficiencySet.has(entry.id));
};

const initNetworkWithTopNode = (allEntries) => {
  const topNode = findTopmostNode(allEntries);
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
  const options = { /* Options object */ };

  network = new vis.Network(document.getElementById("network"), data, options);
  network.on('click', onclick);
};

const getSelectedInfos = (id) => allEntries.find(entry => entry.id === id);

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
  onclick(nodeId);
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
