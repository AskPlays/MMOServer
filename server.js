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
    maps[map.room] = map
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
var game_speed = 30;
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

mps = ["rm_map_home", "rm_map_home_town", "rm_map_norway"];

//game updates
function update() {
    //Enemies
    for (var i = 0; i < mps.length; i++) {
        for (var j = 0; j < maps[mps[i]].enemy.length; j++) {
            if (maps[mps[i]].enemy[j].life == maps[mps[i]].enemy[j].life_time || maps[mps[i]].enemy[j].hp == 0) {
                maps[maps[mps[i]].enemy[j].room].clients.forEach(function (oClient) {
                    oClient.socket.write(packet.build(["ENEMY_DESTROY", maps[mps[i]].enemy[j].type, maps[mps[i]].enemy[j].name]));
                });
                console.log("destroyed: " + maps[mps[i]].enemy[j].name);
                maps[mps[i]].enemy.splice(j, 1);

            } else {
                maps[mps[i]].enemy[j].life++;

                maps[mps[i]].enemy[j].find_target();

                if (maps[mps[i]].enemy[j].target != "") {
                    if (maps[mps[i]].enemy[j].target_dist > 32) {
                        var xSpeed = (maps[mps[i]].enemy[j].target.user.pos_x - maps[mps[i]].enemy[j].pos_x);
                        var ySpeed = (maps[mps[i]].enemy[j].target.user.pos_y - maps[mps[i]].enemy[j].pos_y);
                        var factor = 1 / Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);

                        maps[mps[i]].enemy[j].pos_x += xSpeed * factor;
                        maps[mps[i]].enemy[j].pos_y += ySpeed * factor;

                        maps[maps[mps[i]].enemy[j].room].clients.forEach(function (oClient) {
                            oClient.socket.write(packet.build(["ENEMY_UPDATE", maps[mps[i]].enemy[j].type, maps[mps[i]].enemy[j].name, maps[mps[i]].enemy[j].pos_x, maps[mps[i]].enemy[j].pos_y,  maps[mps[i]].enemy[j].hp, maps[mps[i]].enemy[j].room]));
                        });
                    } else if (maps[mps[i]].enemy[j].attack_cool === 0) {
                        maps[mps[i]].enemy[j].attack_cool = maps[mps[i]].enemy[j].max_cool;
                        maps[mps[i]].enemy[j].target.user.hp -= maps[mps[i]].enemy[j].damage;
                        maps[maps[mps[i]].enemy[j].room].clients.forEach(function (oClient) {
                            oClient.socket.write(packet.build(["HP_CHANGE", "obj_player_type", maps[mps[i]].enemy[j].target.user.username, maps[mps[i]].enemy[j].target.user.hp]));
                        });
                        if (maps[mps[i]].enemy[j].target.user.hp === 0) {
                            maps[mps[i]].enemy[j].target.user.hp = maps[mps[i]].enemy[j].target.user.max_hp;
                            //maps[mps[i]].enemy[j].target.socket.write(packet.build(["DEATH"]));
                        }
                    } else maps[mps[i]].enemy[j].attack_cool--;
                }
            }
        }
    }


    //Spawners

    for(var i = 0; i < spawners.length; i++) {
        if(spawners[i].counter === spawners[i].cool) {
            spawners[i].counter = 0;
            var enemy = new Enemy();
            var creature = Enemies[spawners[i].creature];
            enemy.pos_x = spawners[i].pos_x+getRandom(64)-32;
            enemy.pos_y = spawners[i].pos_y+getRandom(64)-32;
            enemy.type = spawners[i].creature;
            enemy.life_time = creature.life_time*game_speed;
            enemy.hp = creature.hp;
            enemy.damage = creature.damage;
            enemy.max_cool = creature.max_cool;
            enemy.view_range = creature.view_range;
            enemy.name = spawners[i].creature + enemy_counter++;
            enemy.room = spawners[i].room;
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
