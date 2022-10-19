var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Card = /** @class */ (function () {
    function Card(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    Object.defineProperty(Card.prototype, "getSuit", {
        get: function () {
            return this.suit;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "getRank", {
        get: function () {
            return this.rank;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Card.prototype, "getRankNumberBlackjack", {
        get: function () {
            if (this.rank === "A")
                return 11;
            else if (this.rank === "J" || this.rank === "Q" || this.rank === "K") {
                return 10;
            }
            else
                return parseInt(this.rank);
        },
        enumerable: false,
        configurable: true
    });
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck(gameType) {
        this.cards = Array();
        this.gameType = gameType;
        this.cards = this.gameType === "BlakJack" ? Deck.generateBlackJackDeck() : Array();
        this.shuffle();
    }
    Deck.generateBlackJackDeck = function () {
        var cards = Array();
        for (var suit in Deck.suits) {
            for (var rank in Deck.ranks) {
                cards.push(new Card(suit, rank));
            }
        }
        return cards;
    };
    Deck.prototype.drawOne = function () {
        return this.cards.pop();
    };
    Deck.prototype.shuffle = function () {
        for (var i = 0; i < this.cards.length; i++) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    };
    Deck.suits = ["H", "D", "C", "S"];
    Deck.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    return Deck;
}());
var Player = /** @class */ (function () {
    function Player(name, type, gameType, chips) {
        if (chips === void 0) { chips = 400; }
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.hand = Array();
        this.split = "";
        this.chips = chips;
        this.bet = 0;
        this.winAmount = 0;
        this.gameStatus = "betting";
    }
    Object.defineProperty(Player.prototype, "getName", {
        //getter
        get: function () {
            return this.name;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getType", {
        get: function () {
            return this.type;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getGameType", {
        get: function () {
            return this.gameType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getChips", {
        get: function () {
            return this.chips;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getHand", {
        get: function () {
            return this.hand;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getSplit", {
        get: function () {
            return this.split;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getBet", {
        get: function () {
            return this.bet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getWinAmount", {
        get: function () {
            return this.winAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getGameStatus", {
        get: function () {
            return this.gameStatus;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getHandScore", {
        get: function () {
            var handScore = 0;
            for (var i = 0; i < this.hand.length; i++) {
                handScore += this.hand[i].getRankNumberBlackjack;
                if (handScore - 11 > 21 && this.hand[i].getRank === "A")
                    handScore -= 10;
            }
            return handScore;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setBet", {
        //setter
        set: function (bet) {
            this.bet = bet;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setWinAmount", {
        set: function (winAmount) {
            this.winAmount = winAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setChips", {
        set: function (chips) {
            this.chips += chips;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setGameStatus", {
        set: function (gameStatus) {
            this.gameStatus = gameStatus;
        },
        enumerable: false,
        configurable: true
    });
    return Player;
}());
var PlayerAction = /** @class */ (function (_super) {
    __extends(PlayerAction, _super);
    function PlayerAction() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.basicStrategy_HardHand = Array();
        _this.basicStrategy_Split = Array();
        return _this;
    }
    PlayerAction.prototype["super"] = function () {
        this.basicStrategy_HardHand = [
            ["hit", "double", "double", "double", "double", "hit", "hit", "hit", "hit", "hit"],
            ["double", "double", "double", "double", "double", "double", "double", "double", "hit", "hit"],
            ["double", "double", "double", "double", "double", "double", "double", "double", "double", "hit"],
            ["hit", "hit", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
            ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
            ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "hit", "hit", "hit"],
            ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "hit", "surrender", "hit"],
            ["stand", "stand", "stand", "stand", "stand", "hit", "hit", "surrender", "surrender", "surrender"]
        ];
    };
    PlayerAction.prototype.houseTactics = function () {
        var betDenominations = [5, 20, 50, 100];
        var betDenominationCount = PlayerAction.getRandomInteger(1, 4);
        var betIndex = PlayerAction.getRandomInteger(0, 3);
        var bet = 0;
        if (this.getGameStatus === "betting") {
            for (var i = betDenominationCount; i > 0; i--) {
                bet += betDenominations[betIndex];
            }
            return new GameDecision("bet", bet);
        }
        else {
            if (this.getHandScore < 15) {
                return new GameDecision("hit", this.getBet);
            }
            else {
                return new GameDecision("stand", this.getBet);
            }
        }
    };
    PlayerAction.prototype.aiTactics = function (HouseHand, AIHand) {
        var betDenominations = [5, 20, 50, 100];
        var betDenominationCount = PlayerAction.getRandomInteger(1, 4);
        var betIndex = PlayerAction.getRandomInteger(0, 3);
        var bet = 0;
        if (this.getGameStatus === "betting") {
            for (var i = betDenominationCount; i > 0; i--) {
                bet += betDenominations[betIndex];
            }
            return new GameDecision("bet", bet);
        }
        else {
            if (HouseHand <= 7)
                return new GameDecision("hit", this.getBet);
            else if (HouseHand >= 16)
                return new GameDecision("stand", this.getBet);
            else
                return new GameDecision(this.basicStrategy_HardHand[HouseHand + 1][AIHand + 1], this.getBet);
        }
    };
    PlayerAction.prototype.promptPlayerBlackJack = function (userData) {
        if (this.getType === "ai" || this.getType === null)
            this.aiTactics;
        if (this.getType === "house")
            this.houseTactics;
        if (this.getGameStatus === "betting")
            return new GameDecision("bet", userData);
        else
            return new GameDecision(userData, this.getBet);
    };
    PlayerAction.getRandomInteger = function (min, max) {
        return Math.floor(Math.random() * (max + 1 - min)) + min;
    };
    return PlayerAction;
}(Player));
var GameDecision = /** @class */ (function () {
    function GameDecision(action, amount) {
        this.action = action;
        this.amount = amount;
    }
    Object.defineProperty(GameDecision.prototype, "getAction", {
        get: function () {
            return this.action;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameDecision.prototype, "getAmount", {
        get: function () {
            return this.amount;
        },
        enumerable: false,
        configurable: true
    });
    return GameDecision;
}());
var Table = /** @class */ (function () {
    function Table(gameType, betDenominations) {
        if (betDenominations === void 0) { betDenominations = [5, 20, 50, 100]; }
        this.players = Array();
        this.gamePhase = "betting";
        this.gameType = gameType;
        this.betDenominations = betDenominations;
        this.deck = new Deck(this.gameType);
        this.house = new Player("house", "house", this.gameType);
        this.resultLog = [];
        this.turnCounter = 0;
        this.roundConuter = 0;
    }
    Object.defineProperty(Table.prototype, "getHouse", {
        get: function () {
            return this.house;
        },
        enumerable: false,
        configurable: true
    });
    return Table;
}());
var House = new Player("house", "house", "BlakJack");
console.log(House);
