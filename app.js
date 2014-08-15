var util = require('util');
util.print("\u001b[2J\u001b[0;0H");
var readline = require('readline');
var Q = require("q");
var _ = require("underscore");
var autoPlayer = require("./autoPlayer");
var game = require("./game");
var inquirer = require("inquirer");

/*
var rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});
*/

console.log("Welcome to single player card game!");
console.log("You get 10 spots, on each term, one card is drawn.");
console.log("You can place the card in an empty spot");
console.log("The resulting set must be in ascending order");
console.log("Once all cards are placed, you win!");
console.log("If a number is already drawn, you can discard the card with no penalty");
console.log("Otherwise, it goes into a discarded pile.");
console.log("Game ends when you have reached 6 cards in the discarded pile.");

inquirer.prompt( [{type: "confirm", name:"start_game", message:"Begin with bot?"}], function( answers ) {
	game.setAutoPlayer(autoPlayer);
	if (answers.start_game)
	{
		game.loop();
	}
});
/*
var askUser = Q.nfcall(rl.question, "Begin? ");
askUser.then(function(answer) {
	if (answer != "yes" && answer != "y")
	{
		exit();
	}
	else
	{
		//start the game
		game.loop(rl);
	}
});
*/