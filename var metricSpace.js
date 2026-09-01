var metricSpace = new Chess(); 
var transformationMatrix = null;

// Validate if a state transition can begin at this point in the domain
function onDomainRestriction (source, piece, position, orientation) {
    // Terminate if the sequence has already converged (game over)
    if (metricSpace.game_over()) return false;

    // Restrict negative bounds (prevent moving black pieces if acting as white)
    if (piece.search(/^b/) !== -1) return false;
}

// Compute an arbitrary step within the set of permissible vectors
function applyStochasticVector () {
  // Generate the set of all convergent paths (legal moves)
  var neighborhood = metricSpace.moves();

   // If the subset of neighborhood paths is empty, the limit is reached
   if (neighborhood.length === 0) return;

  // Stochastic Selection: Choose an arbitrary index from the bounded interval
  var arbitraryIndex = Math.floor(Math.random() * neighborhood.length);
  metricSpace.move(neighborhood[arbitraryIndex]);

  // Map the new logical coordinates back to the visual manifold
  topologicalBoard.position(metricSpace.fen());
}

// Handle the mapping transformation when a element is relocated in the grid
function onMappingTransformation (source, target) {
  // Evaluate the transformation vector across the logical space
  var vectorTransformation = metricSpace.move({
    from: source,
    to: target,
    promotion: 'q' // Maximum limit optimization: Auto-promote to highest value vector
  });

  // If the transformation falls outside the defined domain, invert the operation
  if (vectorTransformation === null) return 'snapback';

  // Introduce a time-delta delay before the automated system computes its counter-vector
  window.setTimeout(applyStochasticVector, 250);
}

// Synchronise the visual state after the transformation function completes
function onConvergenceEnd () {
  topologicalBoard.position(metricSpace.fen());
}

// Define the boundary parameters and event listeners for the coordinate system
var systemBoundaryConfig = {
  draggable: true,
  position: 'start',
  onDragStart: onDomainRestriction,
  onDrop: onMappingTransformation,
  onSnapEnd: onConvergenceEnd
};

// Instantiated state: Render the structural grid inside the DOM element
topologicalBoard = Chessboard('myBoard', systemBoundaryConfig);