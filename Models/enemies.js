/**
 * Created by Adrian on 31.03.2017.
 */

module.exports = Enemies = {
    bat : {
        create : function(obj) {
            obj.life_time = 60*game_speed;
            obj.hp = 5,
            obj.damage = 1,
            obj.value = 5,
            obj.max_cool = 30,
            obj.view_range = 128,
            obj.attack_range = 32,
            obj.type = "bat"
        },
        step : function(obj) {
            obj.find_target();
            if (obj.target != "") {
                if (obj.target_dist > obj.attack_range) {
                    obj.move_towards();
                } else if (obj.attack_cool === 0) {
                    obj.attack_cool = obj.max_cool;
                    obj.target.user.hp -= obj.damage;
                    maps[obj.room].clients.forEach(function (oClient) {
                        oClient.socket.write(packet.build(["HP_CHANGE", "obj_player_type", obj.target.user.username, obj.target.user.hp]));
                    });
                    if (obj.target.user.hp === 0) {
                        obj.target.user.hp = obj.target.user.max_hp;
                        //maps[mps[i]].enemy[j].target.socket.write(packet.build(["DEATH"]));
                    }
                } else obj.attack_cool--;
            }
        },
        destroy : function(obj, j) {
            maps[obj.room].clients.forEach(function (oClient) {
                oClient.socket.write(packet.build(["ENEMY_DESTROY", obj.type, obj.name]));
            });
            console.log("destroyed: " + obj.name);
            maps[obj.room].enemy.splice(j, 1);
        }
    }
};