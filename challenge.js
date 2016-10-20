'use strict';
/* globals _, engine */
// stub window for serverside check
if (!window) {
    window = {};
};
window.initGame = function () {
    console.log('initgame');

//    var _scentedPositions = [];
    var _scentTracker = new ScentTracker();
    var _gridTracker;

    // you're really better off leaving this line alone, i promise.
    var command =
        '5 3 \n 1 1 s\n ffffff\n 2 1 w \n flfffffrrfffffff\n 0 3 w\n LLFFFLFLFL';

    var parseInput = function (input) {
        var parsed = {};       
        var tokens = command.split('\n');
        var bounds = tokens[0];
        var boundsTokens = bounds.split(' ');
        var boundsObj = [];
        var maxIndexX = parseInt(boundsTokens[0]);
        var maxIndexY = parseInt(boundsTokens[1]);
        _gridTracker = new GridTracker(maxIndexX, maxIndexY);
        boundsObj.push(maxIndexX);
        boundsObj.push(maxIndexY);
        parsed.bounds = boundsObj;

        var robos = [];
        for(var i = 1; i < tokens.length; i++) {
          var subTokens = tokens[i].split(' ');
          var positionObj;
              if(i%2) { // position
                positionObj = {
                    x: parseInt(subTokens[1]),
                    y: parseInt(subTokens[2]),
                    o: subTokens[3].toLowerCase()
                }; 
              }
              else { // moves
                positionObj.command = tokens[i].trim().toLowerCase();
                robos.push(positionObj);
              }
        }
        parsed.robos = robos;
        return parsed;

    };

    var tickRobos = function (robos) {
        console.log('tickrobos');
        var newRobos = [];

        robos.forEach(function(robo) {
            var newX = null, newY = null, newO = null; 
            var possibleOrientations = ['n', 'e', 's', 'w'];
            if(robo.command.length) {
              var firstCommand = robo.command[0];
              var orientation = robo.o;
              var orientationIndex =    possibleOrientations.indexOf(orientation);
              var newCommand = robo.command.substring(1);

              switch(firstCommand) {
                case 'f':
                  switch(orientation) {
                    case 'n':
                      newY = robo.y - 1;
                      break;
                    case 'e':
                      newX = robo.x  + 1;
                      break;
                    case 's':
                      newY = robo.y + 1;
                      break;
                    case 'w':
                      newX = robo.x - 1;
                  }
                  break;
                case 'r':
                  var newIndex = (orientationIndex + 1) % possibleOrientations.length; 
                  newO = possibleOrientations[newIndex];
                  break;
                case 'l':
                  var newIndex = (orientationIndex - 1 + possibleOrientations.length) % possibleOrientations.length; 
                  newO = possibleOrientations[newIndex];
             }

             var moveAllowed =  isMoveAllowed(robo.x, robo.y, newX === null? robo.x : newX, newY === null? robo.y : newY);

              var newRobo = {
//                x: newX === null || !moveAllowed ? robo.x : newX, // causing error
//                y: newY === null || !moveAllowed ? robo.y : newY,
                x: newX === null ? robo.x : newX, // use old value if unchanged or new position invalid
                y: newY === null ? robo.y : newY,
                o: newO === null ? robo.o : newO, // still allow new orientation if on scented cell
                command: newCommand
              }
              if(_gridTracker.isOnGrid(newRobo.x, newRobo.y)) { // still on grid
               newRobos.push(newRobo); // include in remaining list of robos
              } else { // remove from list, retain 'scent'
                _scentTracker.addScent(robo.x, robo.y, robo.o);
               }
            }
        });

        // return the mutated robos object from the input to match the new state
       return newRobos;
    };

    function isMoveAllowed(oldX, oldY, newX, newY) {  
            return !(!_gridTracker.isOnGrid(newX, newY) && _scentTracker.hasScent(oldX, oldY));
    }

   function GridTracker(maxIndexX, maxIndexY) {
        var _maxIndexX = maxIndexX;
        var _maxIndexY = maxIndexY;

        function isOnGrid(x, y) {
            return x >= 0 && x <= _maxIndexX && y >= 0 && y <= _maxIndexY;
        }

        return {
            isOnGrid: isOnGrid
        }
    }

    function ScentTracker() {
        var _scentMap = [];

        function addScent(x, y, o) {

            _scentMap.push({
                x: x,
                y: y,
                departedOrientation: o
            });
        }

        function hasScent(x, y) {

            var retVal = false;
            _scentMap.forEach(function(position) {
                if(position.x === x && position.y === y) {
                    retVal = true;
                }
            });
            return retVal;
        }

        return {
            addScent: addScent,
            hasScent: hasScent,
            getMap: function() {
                return _scentMap;
            }
        };
    }

    // mission summary function
    var missionSummary = function (robos) {
        robos.forEach(function(robo) {
            var li = document.createElement('li');
            var textNode = document.createTextNode(
                'Position: ' + robo.x + ', ' + robo.y + ' | Orientation: ' + robo.o.toUpperCase());
            li.appendChild(textNode);
            document.getElementById('robots').appendChild(li);
        });

         _scentTracker.getMap().forEach(function(cell) {
            var li = document.createElement('li');
            var textNode = document.createTextNode(
                'Died at: Position: ' + cell.x + ', ' + cell.y + ' | Orientation: ' + cell.departedOrientation.toUpperCase());
            li.appendChild(textNode);
            document.getElementById('lostRobots').appendChild(li);
       })


        return;
    };

    // leave this alone please
    window.rover = {
        parse: parseInput,
        tick: tickRobos,
        summary: missionSummary,
        command: command
    };
};

