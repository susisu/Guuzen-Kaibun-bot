/*
 * Guuzen Kaibun bot
 * copyright (c) 2015 Susisu
 */

"use strict";

var avocore = require("avocore");

var twitter = avocore.twitter;

var config = require("./config.json");

var keys =
    new avocore.twitter.KeySet(
        config["consumer_key"],
        config["consumer_secret"],
        config["access_token"],
        config["access_token_secret"]
    );

function parseJSON(json) {
    return new avocore.Action(function (emit) {
        var data;
        try {
            data = JSON.parse(json);
        }
        catch (error) {
            console.log(error);
        }
        if (data !== undefined) {
            emit(data);
        }
    });
}

function showDate() {
    return "[" + (new Date()).toLocaleTimeString() + "] ";
}

function tweetRandom(keys, file, separator, encoding) {
    return avocore.readFile(file, encoding)
        .map(function (content) {
            return content.toString()
                .split(separator)
                .filter(function (line) { return line.length > 0; });
        })
        .bind(avocore.pickRandom)
        .bind(function (line) {
            var info = line.split("\t");
            var text =
                info[0] + " (" + info[1] + ") #kaibun" +
                "\n" + info[4] + " - Wikipedia " + (parseInt(info[5]) > 1 ? "など" : "") +
                " http://ja.wikipedia.org/wiki/" + encodeURIComponent(info[4]);
            return twitter.post(keys, "statuses/update", {
                    "status": text
                })
                .then(avocore.echo(showDate() + "Tweeted: " + text));
        });
}

module.exports = [
    avocore.cron("00 00 */6 * * *")
        .then(tweetRandom(keys, "data/results.txt", "\n", "utf8"))
];
