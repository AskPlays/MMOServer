/**
 * Created by Adrian on 31.03.2017.
 */

module.exports = Enemy = function (x, y, type, name, room) {
    var entity = this;
    this.pos_x = x;
    this.pos_y = y;
    this.life_time = 0;
    this.life = 0;
    this.hp = 0;
    this.damage = 0;
    this.attack_cool = 0;
    this.max_cool = 0;
    this.value = 0;
    this.type = type;
    this.name = name;
    this.room = room;
    this.target = "";
    this.view_range = 0;
    this.target_dist = 0;
    this.find_target = function () {
        entity.target = "";
        entity.target_dist = 0;
        for(var t = 0; t < maps[entity.room].clients.length; t++) {
            var x_dist = entity.pos_x - maps[entity.room].clients[t].user.pos_x;
            var y_dist = entity.pos_y - maps[entity.room].clients[t].user.pos_y;
            var dist = Math.sqrt(x_dist*x_dist + y_dist*y_dist);
            if((dist < entity.target_dist || entity.target == "") && dist < entity.view_range && maps[entity.room].clients[t].user.hp > 0) {
                entity.target_dist = dist;
                entity.target = maps[entity.room].clients[t];
            }
        }
    }
    this.move_towards = function () {
        var xSpeed = (entity.target.user.pos_x - entity.pos_x);
        var ySpeed = (entity.target.user.pos_y - entity.pos_y);
        var factor = 1 / Math.sqrt(xSpeed * xSpeed + ySpeed * ySpeed);
        
        entity.pos_x += xSpeed * factor;
        entity.pos_y += ySpeed * factor;
        
        maps[entity.room].clients.forEach(function (oClient) {
            oClient.socket.write(packet.build(["ENEMY_UPDATE", entity.type, entity.name, entity.pos_x, entity.pos_y,  entity.hp, entity.room]));
        });
    }
}