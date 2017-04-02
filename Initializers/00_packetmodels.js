/**
 * Created by Adrian on 31.03.2017.
 */

var Parser = require('binary-parser').Parser;
var StringOptions = {length: 99, zeroTerminated:true};

module.exports = PacketModels = {

    header: new Parser().skip(1)
        .string("command", StringOptions),

    login: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    register: new Parser().skip(1)
        .string("command", StringOptions)
        .string("username", StringOptions)
        .string("password", StringOptions),

    pos: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("target_x", StringOptions)
        .int32le("target_y", StringOptions),

    enter: new Parser().skip(1)
        .string("command", StringOptions)
        .int32le("start_x", StringOptions)
        .int32le("start_y", StringOptions)
        .string("room", StringOptions),

    ability_create: new Parser().skip(1)
        .string("command", StringOptions)
        .int16le("index", StringOptions)
        .int16le("x", StringOptions)
        .int16le("y", StringOptions)
        .int16le("mouse_x", StringOptions)
        .int16le("mouse_y", StringOptions),
    hp_change: new Parser().skip(1)
        .string("command", StringOptions)
        .string("type", StringOptions)
        .string("name", StringOptions)
        .int16le("hp", StringOptions)
}