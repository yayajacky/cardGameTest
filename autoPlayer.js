//Implement naive strategy for playing the solitare game
(function(){
	var _ = require("underscore");
	
	function naivePick(choices, currentCardNum, buckets, discardedPile)
	{
		//Always return choice 1
		return choices[0];
	}
	
	function pickClosestNumber(choices, currentCardNum, buckets, discardedPile)
	{
		console.log("Card number " + currentCardNum);
		console.log("Choices " + choices);
		//Take the abs difference of choices - currentCardNum, get the one with minimum difference.
		var closestIndex;
		var currentDistance;
		_.each(choices, function (val, index)
		{
			var dis = Math.abs(currentCardNum - val);
			if (currentDistance == null || dis < currentDistance)
			{
				closestIndex = val;
				currentDistance = dis;
			}
		});
		console.log("Picked index " + closestIndex + " dis " + currentDistance);
		return closestIndex;
	}
	
	function pickClosesMod(choices, currentCardNum, buckets, discardedPile)
	{
		return pickClosestNumber(choices, Math.floor((currentCardNum-1) * 10 / 13), buckets, discardedPile);
	}
	
	function pickRandom(choices, currentCardNum, buckets, discardedPile)
	{
		return _.sample(choices);
	}
	
	function headTail(choices, currentCardNum, buckets, discardedPile)
	{
		if (currentCardNum == 1 && choices[0] == 0)
		{
			return choices[0];
		}
		else if (currentCardNum == 13 && choices[choices.length-1] == 10)
		{
			return choices[choices.length-1];
		}
		else if (buckets.indexOf(currentCardNum+1) != -1)
		{
			return choices[choices.length-1];
		}
		else if (buckets.indexOf(currentCardNum-1) != -1)
		{
			return choices[0];
		}
		else
		{
			return pickClosesMod(choices, currentCardNum, buckets, discardedPile);
		}
	}
	
	module.exports = {
		pick:headTail
	}
}());