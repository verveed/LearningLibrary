// Destructuring assignment for better readability
let network, data, allRankNodes, proficiencyArrayContainer = [];
let highlightActive = false;

const NODE_COLOR = '#9b4dca';
const NODE_ICON_SIZE = 40;
const EDGE_COLOR = '#4B0082';

const DEFAULT_EDGE_SETTINGS = {
  arrows: {
    to: { enabled: true }
  }
};

const GROUPS = {
  zero: {
    color: {
      background: "rgba(14,178,98,0)",
      border: "rgba(14,178,98,0)"
    },
  }
};

// Fetch JSON data using async/await
const get_ranks = async () => await (await fetch('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/Fulltime/ranks.json')).json();
const getSOI_proficiencies = async () => await (await fetch('https://cdn.jsdelivr.net/gh/verveed/LearningLibrary@main/Viewer/CORP_data/School_Infantry/proficiencies.json')).json();

// Initializations
let ranks, proficiencies;
let allEntries;

// Function to convert proficiencies to ranks
function ProficienciesToRanks() {
  const proficiencies_to_ranks_Edges = new Set();
  const rankNodes = new Set();

  ranks.forEach(rank => {
    const rankProficiency = rank.proficiencies || [];
    rankProficiency.forEach(prof => {
      rank.value = rank.value || 0;
      rank.value++;
      proficiencies_to_ranks_Edges.add({ from: prof, to: rank.id });
    });

    const rankOptionals = rank.optionals || [];
    rankOptionals.forEach(optional => {
      proficiencies_to_ranks_Edges.add({ from: optional, to: rank.id });
    });

    rankNodes.add({ id: rank.id, label: rank.label, hiddenLabel: undefined, group: rank.payGrade });
  });

  const nodes = new vis.DataSet([...rankNodes]);
  const edges = new vis.DataSet([...proficiencies_to_ranks_Edges]);

  allRankNodes = nodes.get({ returnType: "Object" });

  return { nodes, edges };
}

// Function to get selected info by ID
function getSelectedInfos(id) {
  return allEntries.find(entry => entry.id === id);
}

// Function to get child info by ID
function getChildInfos(id) {
  const childIds = network.getConnectedNodes(id, 'to');
  return allEntries.filter(entry => childIds.includes(entry.id));
}

// Function to zoom in
function zoomIn(nodeId, scale) {
  const zoomOptions = {
    scale: scale || 1,
    offset: { x: 0, y: 0 },
    animation: { duration: 1000, easingFunction: "easeInQuad" }
  };
  network.focus(nodeId, zoomOptions);
  network.selectNodes([nodeId]);
  onclick(nodeId);
}

// Function to show selected info
function showSelectedInfo(info) {
  const $container = document.getElementById('selected');
  if (!info) return;

  // Additional code for showing selected info...
}

// Function to show child info
function showChildInfo(children) {
  const $tradePaths_ul = document.getElementById('accordionVisInfo_tradePaths_ul');
  $tradePaths_ul.innerHTML = '';

  if (children) {
    children.forEach(child => {
      const $accordion = document.createElement('div');
      $accordion.innerHTML = `<li class="list-group-item pr-2"><a class="font-weight-bold cyan-lighter-hover mb-3" onclick="zoomIn('${child.id}');" class="grey-text">${child.label.replace(/_/g," ")}</a>`;
      $tradePaths_ul.appendChild($accordion);
    });
  }
}

// Function for neighborhood highlight
function neighbourhoodHighlight(params) {
  // Implementation...
}

// Function for handling node click event
function onclick(clickEventData) {
  const selectedNodeId = clickEventData.nodes ? clickEventData.nodes[0] : clickEventData;
  if (!selectedNodeId) {
    nodes.remove(proficiencyArrayContainer);
  }

  let thisEntry = allEntries.find(entry => entry.id === selectedNodeId);

  if (thisEntry) {
    const rankProficiency = thisEntry.proficiencies || [];
    rankProficiency.forEach(prof => {
      let currentNetworkNodesSearch = network.findNode(prof);
      if (!currentNetworkNodesSearch.length) {
        proficiencyArrayContainer.push(prof);
        nodes.update([{ id: prof, x: prof.x, y: prof.y, label: prof.label ? prof.label : prof }]);
      }
    });
  }

  if (selectedNodeId) {
    const selectedEntry = getSelectedInfos(selectedNodeId);
    showSelectedInfo(selectedEntry);
    const childEntries = getChildInfos(selectedNodeId);
    showChildInfo(childEntries);
  } else {
    return;
    showSelectedInfo(null);
    showChildInfo(null);
  }
}

// Function to initialize the network
async function init() {
  ranks = await get_ranks();
  proficiencies = await getSOI_proficiencies();

  allEntries = Object.freeze([...ranks]);

  await document.fonts.load('normal normal 400 24px/1 "FontAwesome"');

  var container = document.getElementById("network");

  data = ProficienciesToRanks();

  var options = {
    groups: GROUPS,
    nodes: { /* ... */ },
    layout: { /* ... */ },
    edges: { /* ... */ },
    physics: { /* ... */ },
  };

  network = new vis.Network(container, data, options);

  network.on('click', onclick);
}

document.addEventListener("DOMContentLoaded", init);
