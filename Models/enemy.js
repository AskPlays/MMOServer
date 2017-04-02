/**
 * Created by Adrian on 31.03.2017.
 */

module.exports = Enemy = function () {
    var entity = this;
    this.pos_x = 0;
    this.pos_y = 0;
    this.life_time = 0;
    this.life = 0;
    this.hp = 0;
    this.damage = 0;
    this.attack_cool = 0;
    this.max_cool = 0;
    this.type = "";
    this.name = "";
    this.room = "";
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
}