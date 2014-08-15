(function(){
	var _ = require("underscore");
	var Q = require("q");
	var util = require('util');
	var inquirer = require("inquirer");
	
	var _gamePlayed = 0;
	var _testGameCount = 1000;
	var _autoPlayer;
	
	var bucketRange = _.range(10);
	var discardedPileRange = _.range(6);
	
	var currentCard;
	var cards;
	var buckets;
	var discardedPile;
	var skipUserTerm;
	var gameEnded;
	
	var winCount = 0;
	var loseCount = 0;
	
	function reset()
	{
		currentCard = null;
		cards = _.shuffle(_.range(52));
		buckets = [];
		_.each(bucketRange, function(val){
			buckets.push(null);
		});
		discardedPile = [];
		skipUserTerm = false;
		gameEnded = false;
	}
	
	reset();
	
	function clearScreen()
	{
		util.print("\u001b[2J\u001b[0;0H");
	}
	
	function showBuckets()
	{
		var result = [];
		_.each(bucketRange, function(val){
			if (buckets[val] == null)
			{
				result.push("[ ]");
			}
			else
			{
				result.push("[" + buckets[val] + "]")
			}
		});
		console.log("Buckets " + result.join(" "));
	}
	
	function showDiscardedPiles()
	{
		var result = [];
		_.each(discardedPileRange, function(val){
			if (discardedPile[val] == null)
			{
				result.push("[ ]");
			}
			else
			{
				result.push("[" + discardedPile[val] + "]")
			}
		});
		console.log("Discarded pile " +result.join(" "));
	}
	
	function toCardNumber(val)
	{
		return val % 13 + 1;
	}
	
	function turnLogic()
	{
		if (_gamePlayed >= _testGameCount)
		{
			showWinLoseCount();
			process.exit();
		}
		
		if (buckets.length == 10 && buckets.indexOf(null) == -1)
		{
			console.log("You win!");
			winCount++;
			gameEnded = true;
			_gamePlayed++;
		}
		
		if (discardedPile.length == 6)
		{
			console.log("You lose.");
			loseCount++;
			gameEnded = true;
			_gamePlayed++;
		}
		
		if (currentCard == null)
		{
			currentCard = cards.pop();
		}
		console.log("Current card is: " + toCardNumber(currentCard));
	}
	
	function findValidSpot(val)
	{
		//Find number/index that is next immediate smaller than val
		var smaller;
		var smallIndex = null;
		var bigger;
		var biggerIndex = null;
		_.each(buckets, function(bVal, bIndex){
			if (bVal == null)
				return;
			
			if (bVal < val)
			{
				smaller = bVal;
				smallIndex = bIndex + 1;
			}
			
			if (bigger)
			{
				return;
			}
			if (bVal > val)
			{
				bigger = bVal;
				biggerIndex = bIndex;
			}
		});
		
		//Find number/index that is next immediate larger than val
		//Return spots inbetween these with _.range
		if (smallIndex && biggerIndex)
		{
			return _.range((smallIndex), (biggerIndex)).map(String);
		}
		else if (biggerIndex != null)
		{
			return _.range(0, biggerIndex).map(String);
		}
		else if (smallIndex != null)
		{
			return _.range(smallIndex, 10).map(String);
		}
		else
		{
			return _.range(0, 10).map(String);
		}
	}
	
	function promptList(option, list, currentCardNum)
	{
		var deferred = Q.defer();
		if (_autoPlayer)
		{
			setTimeout(deferred.resolve, 1, {
				spot: _autoPlayer.pick(list, currentCardNum, buckets, discardedPile)
			});
		}
		else
		{
			inquirer.prompt(option, function(answer)
			{
				deferred.resolve(answer);
			});
		}
		return deferred.promise;
	}
	
	function promptConfirm(option)
	{
		var deferred = Q.defer();
		if (_autoPlayer)
		{
			if (gameEnded)
			{
				setTimeout(deferred.resolve, 1, {confirm_reset:true});
			}
			else
			{
				setTimeout(deferred.resolve, 1, {confirm:true});
			}
		}
		else
		{
			inquirer.prompt(option, function(answer)
			{
				deferred.resolve(answer);
			})
		}
		return deferred.promise;
	}
	
	function getUserInput()
	{
		var currentCardNum = toCardNumber(currentCard);
		var askUser;
		if (gameEnded)
		{
			askUser = promptConfirm([{type: "confirm", name:"confirm_reset", message:"Play another game?"}]);
		}
		else if (buckets.indexOf(currentCardNum) != -1)
		{
			//Card already exist
			askUser = promptConfirm([{type: "confirm", name:"confirm", message:"Card already exist. Continue"}]);
			currentCard = null;
			skipUserTerm = true;
		}
		else
		{
			var validSpots = findValidSpot(currentCardNum);
			if (validSpots.length > 0)
			{
				askUser = promptList([{type: "list", name:"spot", message:"Which spot to place?", choices: validSpots}], validSpots, currentCardNum);
			}
			else
			{
				askUser = promptConfirm([{type: "confirm", name:"confirm", message:"No placement possible. Continue"}]);
				discardedPile.push(currentCardNum)
				currentCard = null;
				skipUserTerm = true;
			}
		}
		return askUser;
	}
	
	function processUserInput(val)
	{
		if (val.confirm_reset)
		{
			reset();
		}
		if (skipUserTerm)
		{
			skipUserTerm = false;
		}
		else
		{
			var userIndex = parseInt(val.spot);
			var currentCardNum = toCardNumber(currentCard);
			var validSpots = findValidSpot(currentCardNum);
			//Place the card
			buckets[userIndex] = currentCardNum;
			currentCard = null;
		}
		loop();
	}
	
	function showWinLoseCount()
	{
		console.log("Win " + winCount + " - Lose " + loseCount);
	}
	
	function loop()
	{
		//console.log("Entering loop");
		clearScreen();
		showWinLoseCount();
		showBuckets();
		showDiscardedPiles();
		turnLogic();
		var inputPromise = getUserInput();
		
		inputPromise
			.then(processUserInput)
			.fail(function(e){
				console.trace(e);
			})
		//console.log("Choices");
	}
	
	function setAutoPlayer(val)
	{
		_autoPlayer = val;
	}
	
	function setTestGameCount(val)
	{
		_testGameCount = val;
	}
	
	module.exports = {
		setTestGameCount: setTestGameCount,
		setAutoPlayer:setAutoPlayer,
		loop:loop
	}
}());