/**
 * Created by Adrian on 31.03.2017.
 */
//Import Required Libraries
require(__dirname + '/Resources/config.js');
var fs = require('fs');
var net = require('net');
require('./packet.js');

//Load the initializers
var init_files = fs.readdirSync(__dirname + "/Initializers");
init_files.forEach(function(initFile){
    console.log('Loading Initializer: ' + initFile);
    require(__dirname + "/Initializers/" + initFile);
});

//Load the models
var model_files = fs.readdirSync(__dirname + "/Models");
model_files.forEach(function(modelFile){
    console.log('Loading Model: ' + modelFile);
    require(__dirname + "/Models/" + modelFile);
});

//Load model_files maps
maps = {};
var map_files = fs.readdirSync(config.data_paths.maps);
map_files.forEach(function(mapFile){
    console.log('Loading Map: ' + mapFile);
    var map = require(config.data_paths.maps + mapFile);
    maps[map.room] = map;
});

net.createServer(function(socket){

    console.log("client connected");
    var c_inst = new require('./client.js');
    var thisClient = new c_inst();

    thisClient.socket = socket;
    thisClient.initiate();

    socket.on('error', thisClient.error);

    socket.on('end', thisClient.end);
    socket.on('disconnect', thisClient.end);

    socket.on('data', thisClient.data);

}).listen(config.port);

console.log("Initialize Completed, Server runnng on port: " + config.port + " for environment: " + config.environment);
//4. initiate the server and listen to the internets
//all of server logic

//game vars
game_speed = 30;
var enemy_counter = 0;

//game functions
function getRandom(MaxSize) {
    return parseInt(Math.random() * MaxSize);
}

//Spawner
function init_spawners() {
    for(var i = 0; i < spawners_x.length; i++) {
        var spawner = {};
        spawner.counter = 0;
        spawner.pos_x = spawners_x[i];
        spawner.pos_y = spawners_y[i];
        spawner.creature = spawners_creature[i];
        spawner.cool = spawners_cool[i];
        spawner.room = spawners_room[i];
        spawners.push(spawner);
    }
}
spawners_x = [432, 784, 880];
spawners_y = [304, 240, 240];
spawners_room = ["rm_map_home_town", "rm_map_norway", "rm_map_norway"];
spawners_creature = ["bat", "bat", "bat"];
spawners_cool = [game_speed*20, game_speed*15, game_speed*15];
spawners = [];
init_spawners();
if(config.environment === 'test') console.log("Spawners iniated");

mps = Object.keys(maps);

//game updates
function update() {
    //Enemies
    for (var i = 0; i < mps.length; i++) {
        for (var j = 0; j < maps[mps[i]].enemy.length; j++) {
            var enemy = maps[mps[i]].enemy[j];
            if (maps[mps[i]].enemy[j].life == maps[mps[i]].enemy[j].life_time || maps[mps[i]].enemy[j].hp == 0) {
                Enemies[enemy.type].destroy(enemy, j);
            } else {
                enemy.life++;
                Enemies[enemy.type].step(enemy);
            }
        }
    }


    //Spawners
    for(var i = 0; i < spawners.length; i++) {
        if(spawners[i].counter === spawners[i].cool) {
            spawners[i].counter = 0;
            var enemy = new Enemy(spawners[i].pos_x+getRandom(64)-32, spawners[i].pos_y+getRandom(64)-32, spawners[i].creature, spawners[i].creature + enemy_counter++, spawners[i].room);
            Enemies[enemy.type].create(enemy);
            maps[spawners[i].room].enemy.push(enemy);
            maps[spawners[i].room].clients.forEach( function (oClient) {
                oClient.socket.write(packet.build(["ENEMY_CREATE", enemy.type, enemy.name, enemy.pos_x, enemy.pos_y, enemy.hp, spawners[i].room]));
            });
            if(config.environment === 'test') console.log("Spawner created: " + spawners[i].creature);
            //console.log(enemy);
        }else spawners[i].counter++;
    }

}

function checkCollisions() {
    for(var i = 0; i < mps.length; i++) {
        maps[mps[i]].enemy.forEach(function (oEnemy) {
            console.log(oEnemy);
        });
    }
}

var lastLoopRun = 0;
console.log("loop Engaging");
setInterval(function loop() {
    if(new Date().getTime() - lastLoopRun > 1000/game_speed) {
        update();
        /*checkCollisions();*/

        lastLoopRun = new Date().getTime();
    }
}, 2);
