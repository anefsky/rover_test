// don't touch this at all.
/* globals _ */
if (!window) {
    window = {};
}
window.onload = function () {
    console.log('onload called');
    window.initGame();
    var canvas = document.getElementById('playfield')
        .getContext('2d'),
        width = document.getElementById('playfield')
        .width * 2,
        height = document.getElementById('playfield')
        .height * 2,
        fontSize = 18,
        gridText = [],
        gameWorld = [],
        gridText = [],
        gameWorld = [];
    canvas.font = 'bold ' + fontSize + 'px monospace';
    canvas.fillStyle = 'black';
    canvas.textAlign = 'center';
    var genworld = function (parsedCommand, renderflag, world) {
        //build init world array
        gameWorld = [];
        var bounds = parsedCommand.bounds,
            robos = parsedCommand.robos;
        var row = [];
        for (var i = 0; i <= bounds[0]; i++) {
            row.push('.');
        }
        for (var i = 0; i <= bounds[1]; i++) {
            var test = [].concat(row);
            gameWorld.push(test);
        }
        var placeRobos = function (robos) {
            for (var i in robos) {
                var robo = robos[i];
                var activeRow = gameWorld[robo.y];
                if (activeRow) {
                    activeRow[robo.x] = robo.o;
                }
            }
        };
        parsedCommand.robos = window.rover.tick(robos);
        placeRobos(parsedCommand.robos);
        if (renderflag) {
            render(gameWorld, parsedCommand.robos);
        }
        if (renderflag) {
            window.setTimeout(function () {
                var finished = false;
                _.each(parsedCommand.robos, function (robo) {
                    if (robo.command.length !== 0 && finished === false) {
                        finished = true;
                    }
                });
                if (finished === false) {
                    window.rover.summary(parsedCommand.robos);
                    runTests(gameWorld);
                } else {
                    genworld(parsedCommand, true);
                }
            }, 124);
        }
        return gameWorld;
    };
    //render block
    var render = function (gameWorld) {
        console.log('render', gameWorld);
        canvas.clearRect(0, 0, width, height);
        for (var i = 0; i < gameWorld.length; i++) {
            var blob = gameWorld[i].join('');
            canvas.fillText(blob, 250, i * fontSize + fontSize);
        }
    };
    // test world state for succesful test
    runTests = function (lastworld) {
        console.log('runtests: ');
        var successWorld = ['.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', '.', 's', '.', '.', '.', '.', '.', '.', '.', '.', '.'];
        if (!window.doneTrigger) {
            if (_.isEqual(_.flatten(lastworld), successWorld)) {
                document.getElementById('test')
                    .innerText =
                    'your business logic is correct, which means you beat task #1 and #2';
            } else {
                document.getElementById('test')
                    .innerText = 'your solution was incorrect';
            }

        } else {
            console.log('fire doneTrigger: ', successWorld, lastworld);
            window.doneTrigger(successWorld, _.flatten(lastworld));
        }
    };
    // wireup init functions for display
    genworld(window.rover.parse(window.rover.command), true);
};

