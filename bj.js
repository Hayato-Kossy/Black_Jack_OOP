var Card = /** @class */ (function () {
    function Card(suit, rank) {
        this.suit = suit;
        this.rank = rank;
    }
    Object.defineProperty(Card.prototype, "getRankNumber", {
        get: function () {
            if (this.rank == "J" || this.rank == "Q" || this.rank == "K")
                return 10;
            else if (this.rank == "A")
                return 11;
            else
                return parseInt(this.rank);
        },
        enumerable: false,
        configurable: true
    });
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
    return Card;
}());
var Deck = /** @class */ (function () {
    function Deck(gameType) {
        this.gameType = gameType;
        this.suits = ["H", "D", "C", "S"];
        this.ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
        this.gameType = gameType;
        this.cards = [];
        this.pushAllcards();
        this.shuffle();
    }
    Deck.prototype.pushAllcards = function () {
        var _this = this;
        if (this.gameType == "blackjack") {
            this.suits.forEach(function (suit) {
                _this.ranks.forEach(function (rank) {
                    _this.cards.push(new Card(suit, rank));
                });
            });
        }
    };
    Deck.prototype.pushRemainingCards = function (table) {
        var _this = this;
        this.suits.forEach(function (suit) {
            _this.ranks.forEach(function (rank) {
                if (!table.cardIsOnTable(suit, rank)) {
                    table.drawCard = new Card(suit, rank);
                }
            });
        });
    };
    Deck.prototype.shuffle = function () {
        var l = this.cards.length;
        for (var i = l - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    };
    Deck.prototype.isEmpty = function () {
        return this.cards.length == 0;
    };
    Object.defineProperty(Deck.prototype, "getCards", {
        get: function () {
            return this.cards;
        },
        enumerable: false,
        configurable: true
    });
    return Deck;
}());
var Player = /** @class */ (function () {
    function Player(name, type, gameType, chips) {
        if (chips === void 0) { chips = 400; }
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.gameStatus = "betting";
        this.gameResult = "";
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.hand = [];
        this.bet = 0;
        this.winAmount = 0;
        this.playerScore = this.getHandScore;
        this.counting = 0;
    }
    //NOTE戻り値のデータ型が抽象的すぎる
    Player.prototype.drawOne = function (table) {
        return table.alertIsEmptyAndAction();
    };
    Player.prototype.promptPlayer = function (table, userData) {
        var gameDecision = new GameDecision("", userData);
        if (table.getGamePhase === "betting") {
            if (this.type == "ai")
                gameDecision = this.getAiBetDecision(table);
            else
                gameDecision = new GameDecision("bet", userData);
        }
        else if (table.getGamePhase === "acting") {
            if (this.type === "ai")
                gameDecision = this.getAiGameDecision(table);
            else if (this.type === "user")
                gameDecision = this.getUserGameDecision(userData);
            else {
                gameDecision = this.getHouseGameDecision(table);
            }
            ;
        }
        return gameDecision;
    };
    Object.defineProperty(Player.prototype, "getHandScore", {
        get: function () {
            var handScore = 0;
            this.hand.forEach(function (card) { handScore += card.getRankNumber; });
            var ace = this.countAce();
            if (handScore > 21 && this.type != "house" && ace > 0) {
                while (ace > 0 && handScore > 21) {
                    handScore -= 10;
                    ace--;
                }
            }
            return handScore;
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.countAce = function () {
        var count = 0;
        this.hand.forEach(function (card) { if (card.getRank == "A")
            count++; });
        return count;
    };
    Player.prototype.isBlackJack = function () {
        return this.getHandScore == 21 && this.hand.length == 2;
    };
    Player.prototype.resetPlayerBet = function () {
        this.chips += this.bet;
        this.bet = 0;
    };
    Player.prototype.playerAllin = function (betCoin) {
        this.bet += betCoin;
        this.chips -= betCoin;
    };
    //確認ずみ
    Player.prototype.getHouseGameDecision = function (table) {
        if (table.allPlayersHitCompleted() && table.allPlayersBetCompleted()) {
            if (this.isBlackJack())
                return new GameDecision("blackjack", this.bet);
            else if (this.getHandScore < 17) {
                return new GameDecision("hit", -1);
            }
            return new GameDecision("stand", -1);
        }
        else
            return new GameDecision(this.gameStatus, -1);
    };
    Player.prototype.getAiBetDecision = function (table) {
        var _this = this;
        if (table.getTurnPlayer().getGameStatus == "game over") {
            return new GameDecision("game over", 0);
        }
        else {
            var availableBet = table.getBetDenominations.filter(function (bet) { return (bet <= _this.chips); });
            var betAmount = availableBet[this.randomIntInRange(0, availableBet.length)];
            table.getTurnPlayer().bet = betAmount;
            return new GameDecision("bet", betAmount);
        }
    };
    Player.prototype.getAiGameDecision = function (table) {
        var gameDecision = new GameDecision("", -1);
        var actionList = ["surrender", "stand", "hit", "double"];
        if (this.isBlackJack()) {
            return new GameDecision("blackjack", this.bet);
        }
        else if (this.gameStatus === "bet") {
            if (gameDecision.getAction == "double" && table.getTurnPlayer().chips < table.getTurnPlayer().bet * 2) {
                gameDecision.setAction = "hit";
                return new GameDecision("hit", this.bet);
            }
            else if (gameDecision.getAction == "double")
                table.getTurnPlayer().setBet = table.getTurnPlayer().getBet * 2;
            else
                return new GameDecision(actionList[this.randomIntInRange(0, actionList.length)], this.bet);
        }
        else if (this.gameStatus === "hit") {
            var actionList_1 = ["stand", "hit"];
            return new GameDecision(actionList_1[this.randomIntInRange(0, actionList_1.length)], this.bet);
        }
        return new GameDecision(this.gameStatus, this.bet);
    };
    Player.prototype.cheatCounting = function (table) {
        var _this = this;
        // countingの初期化
        table.setAllPlayerCounting = table.getAllPlayerCounting - this.getCounting;
        this.setCounting = 0;
        var countingHashmap = {
            "10": -1,
            "J": -1,
            "Q": -1,
            "K": -1,
            "A": -1,
            "7": 0,
            "8": 0,
            "9": 0,
        };
        if (this.getType === "house") {
            if (this.hand[0].getRank in countingHashmap) {
                this.counting += countingHashmap[this.hand[0].getRank];
                table.setAllPlayerCounting = table.getAllPlayerCounting + countingHashmap[this.hand[0].getRank];
            }
            else {
                this.counting += 1;
                table.setAllPlayerCounting = table.getAllPlayerCounting + 1;
            }
        }
        else
            this.hand.forEach(function (card) {
                if (card.getRank in countingHashmap) {
                    _this.counting += countingHashmap[card.getRank];
                    table.setAllPlayerCounting = table.getAllPlayerCounting + countingHashmap[card.getRank];
                }
                else {
                    _this.counting += 1;
                    table.setAllPlayerCounting = table.getAllPlayerCounting + 1;
                }
            });
    };
    Player.prototype.getUserGameDecision = function (userData) {
        if (this.isBlackJack()) {
            return new GameDecision("blackjack", this.bet);
        }
        else {
            return new GameDecision(userData, this.bet);
        }
    };
    Object.defineProperty(Player.prototype, "getGameStatus", {
        get: function () {
            return this.gameStatus;
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
    Object.defineProperty(Player.prototype, "getHand", {
        get: function () {
            return this.hand;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "drawCard", {
        set: function (card) {
            this.hand.push(card);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setHand", {
        set: function (card) {
            this.hand = card;
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
    Object.defineProperty(Player.prototype, "setWinAmount", {
        set: function (winAmount) {
            this.winAmount = winAmount;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getPlayerScore", {
        get: function () {
            return this.playerScore;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setPlayerScore", {
        set: function (score) {
            this.playerScore = score;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getName", {
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
    Object.defineProperty(Player.prototype, "getChips", {
        get: function () {
            return this.chips;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setChips", {
        set: function (chips) {
            this.chips = chips;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "getGameResult", {
        get: function () {
            return this.gameResult;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setGameResult", {
        set: function (gameResult) {
            this.gameResult = gameResult;
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
    Object.defineProperty(Player.prototype, "setBet", {
        set: function (bet) {
            this.bet = bet;
        },
        enumerable: false,
        configurable: true
    });
    Player.prototype.randomIntInRange = function (min, max) {
        return Math.floor(Math.random() * (max - min) + min);
    };
    Object.defineProperty(Player.prototype, "getCounting", {
        get: function () {
            return this.counting;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Player.prototype, "setCounting", {
        set: function (count) {
            this.counting = count;
        },
        enumerable: false,
        configurable: true
    });
    return Player;
}());
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
    Object.defineProperty(GameDecision.prototype, "setAction", {
        set: function (action) {
            this.action = action;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(GameDecision.prototype, "setAmount", {
        set: function (amount) {
            this.amount = amount;
        },
        enumerable: false,
        configurable: true
    });
    return GameDecision;
}());
var Table = /** @class */ (function () {
    function Table(gameType, betDenominations) {
        if (betDenominations === void 0) { betDenominations = [5, 20, 50, 100]; }
        this.gameType = gameType;
        this.betDenominations = betDenominations;
        this.gameType = gameType;
        this.deck = new Deck(this.gameType);
        this.players = [];
        this.house = new Player("Dealer", "house", this.gameType);
        this.gamePhase = "betting";
        this.resultLog = [];
        this.turnCounter = 0;
        this.isCardClosed = false;
        this.allPlayerCounting = 0;
    }
    Object.defineProperty(Table.prototype, "setPlayers", {
        set: function (userName) {
            this.players.push(new Player("AI1", "ai", this.gameType), new Player(userName, "user", this.gameType), new Player("AI2", "ai", this.gameType));
        },
        enumerable: false,
        configurable: true
    });
    Table.prototype.cardIsOnTable = function (suit, rank) {
        var houseHand = this.house.getHand;
        this.players.forEach(function (player) {
            var playerHand = player.getHand;
            playerHand.forEach(function (card) {
                if (card.getSuit == suit && card.getRank == rank)
                    return true;
            });
        });
        houseHand.forEach(function (card) {
            if (card.getSuit == suit && card.getRank == rank)
                return true;
        });
        return false;
    };
    Table.prototype.evaluateMove = function (gameDecision, player) {
        player.setGameStatus = gameDecision.getAction;
        player.setBet = gameDecision.getAmount;
        switch (gameDecision.getAction) {
            case "betting":
                break;
            case "hit":
                player.drawCard = player.drawOne(this);
                if (player.getHandScore > 21)
                    player.setGameStatus = "bust";
                break;
            case "stand":
                break;
            case "surrender":
                break;
            case "double":
                if (this.turnCounter - 4 <= this.players.length) {
                    player.setBet = player.getBet * 2;
                    player.drawCard = player.drawOne(this);
                    if (player.getHandScore > 21)
                        player.setGameStatus = "bust";
                    break;
                }
                else
                    break;
            case "game over":
                break;
        }
    };
    Table.prototype.blackjackEvaluateAndGetRoundResults = function () {
        var list = document.createElement("ul");
        this.players.forEach(function (player) {
            var playerListResult = document.createElement("li");
            playerListResult.textContent = "name: ".concat(player.getName, ", action: ").concat(player.getGameStatus, ", bet: ").concat(player.getBet, ", won: ").concat(player.getWinAmount, ", result: ").concat(player.getGameResult);
            list.append(playerListResult);
        });
        this.resultLog.push(list);
        return list;
    };
    Table.prototype.blackjackAssignPlayerHands = function () {
        var _this = this;
        while (this.house.getHand.length < 2) {
            this.house.drawCard = this.house.drawOne(this);
        }
        this.players.forEach(function (player) {
            if (player.getGameStatus != "game over") {
                while (player.getHand.length < 2) {
                    player.drawCard = player.drawOne(_this);
                }
            }
        });
    };
    Table.prototype.blackjackClearPlayerHandsAndBets = function () {
        this.players.forEach(function (player) {
            player.setHand = [];
            player.setBet = 0;
            player.setWinAmount = 0;
            if (player.getGameStatus !== "game over") {
                player.setGameStatus = "betting";
            }
            player.setGameResult = '';
        });
        this.house.setHand = [];
        this.house.setGameStatus = "betting";
    };
    Table.prototype.haveTurn = function (userData) {
        console.log(this.getAllPlayerCounting);
        var turnPlayer = this.getTurnPlayer();
        if (this.gamePhase === "betting") {
            if (turnPlayer.getType === "house") {
                this.house.setGameStatus = "Waiting for bets";
            }
            else if (turnPlayer.getType === "user" || turnPlayer.getType === "ai") {
                this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
            if (this.onLastPlayer()) {
                this.gamePhase = "acting";
                this.house.setGameStatus = "Waiting for actions";
            }
        }
        else if (this.gamePhase === "acting") {
            if (this.getIsAllActionsCompleted) {
                this.evaluateWinners();
                this.setGamePhase = "roundOver";
            }
            else {
                this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
            // hitなどアクション後にcountingを開始
            turnPlayer.cheatCounting(this);
            console.log(turnPlayer.getName + "Count -> " + "".concat(turnPlayer.getCounting) + " allPlayerCounting -> " + "".concat(this.getAllPlayerCounting));
        }
        else if (this.gamePhase === "roundOver") {
            this.players.forEach(function (player) {
                player.setCounting = 0;
            });
            this.house.setCounting = 0;
            this.allPlayerCounting = 0;
            this.gamePhase = "betting";
            this.house.setGameStatus = "Waiting for bets";
            this.turnCounter = 0;
            this.blackjackClearPlayerHandsAndBets();
        }
        this.turnCounter++;
    };
    Table.prototype.onLastPlayer = function () {
        return this.turnCounter % (this.players.length + 1) === this.players.length;
    };
    Table.prototype.allPlayersHitCompleted = function () {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].getGameStatus == "hit")
                return false;
        }
        console.log("True");
        return true;
    };
    Object.defineProperty(Table.prototype, "userAndAICompleted", {
        get: function () {
            var actionList = ["stand"];
            this.players.forEach(function (player) {
                if (!actionList.indexOf(player.getGameStatus))
                    return false;
            });
            return true;
        },
        enumerable: false,
        configurable: true
    });
    Table.prototype.evaluateWinners = function () {
        var _this = this;
        this.players.forEach(function (player) {
            if (player.getGameStatus === "surrender")
                _this.calcWinAmount(player, "surrender");
            else if (player.getGameStatus === "bust")
                _this.calcWinAmount(player, "bust");
            else {
                switch (_this.house.getGameStatus) {
                    case "blackjack":
                        if (player.getGameStatus === "blackjack")
                            _this.calcWinAmount(player, "push");
                        else
                            _this.calcWinAmount(player, "lose");
                        break;
                    case "bust":
                        _this.calcWinAmount(player, "win");
                        break;
                    default:
                        if (player.getGameStatus === "blackjack") {
                            _this.calcWinAmount(player, "win");
                        }
                        else if (player.getHandScore > _this.house.getHandScore) {
                            _this.calcWinAmount(player, "win");
                        }
                        else if (player.getHandScore === _this.house.getHandScore) {
                            _this.calcWinAmount(player, "push");
                        }
                        else {
                            _this.calcWinAmount(player, "lose");
                        }
                }
            }
        });
    };
    Table.prototype.calcWinAmount = function (player, result) {
        switch (player.getGameStatus) {
            case "blackjack":
                if (result != "push") {
                    player.setWinAmount = Math.floor(player.getBet * 1.5);
                    break;
                }
                else
                    break;
            case "surrender":
                player.setWinAmount = Math.floor(player.getBet / 2);
                break;
            case "bust":
                player.setWinAmount = player.getBet;
                break;
            default:
                if (result == "push")
                    break;
                else
                    player.setWinAmount = player.getBet;
        }
        if (result === "lose" || player.getGameStatus === "bust")
            player.setWinAmount = player.getBet * -1;
        if (player.getGameStatus === "surrender")
            player.setWinAmount = player.getBet * -0.5;
        if (result != "push")
            player.setChips = player.getChips + player.getWinAmount;
        if (player.getGameStatus != "blackjack")
            player.setGameResult = result;
        else
            player.setGameResult = "blackjack";
        this.checkGameOver(player);
    };
    Table.prototype.checkGameOver = function (player) {
        if (player.getType == "user" && player.getChips < 5) {
            player.setGameStatus = "game over";
            this.gamePhase = "gameOver";
        }
        else if (player.getChips < 5)
            player.setGameStatus = "game over";
    };
    Table.prototype.allPlayersBetCompleted = function () {
        for (var i = 0; i < this.players.length; i++) {
            if (this.players[i].getGameStatus == "bet")
                return false;
        }
        return true;
    };
    Table.prototype.houseActionCompleted = function () {
        return this.house.getGameStatus != "hit" && this.house.getGameStatus != "Waiting for actions";
    };
    Object.defineProperty(Table.prototype, "getIsAllActionsCompleted", {
        get: function () {
            return this.houseActionCompleted() && this.allPlayersHitCompleted();
        },
        enumerable: false,
        configurable: true
    });
    Table.prototype.getTurnPlayer = function () {
        var index = this.turnCounter % (this.players.length + 1);
        if (index === 0)
            return this.house;
        else
            return this.players[index - 1];
    };
    Table.prototype.alertIsEmptyAndAction = function () {
        if (this.deck.isEmpty()) {
            alert("No cards left. Shuffle the cards.");
            this.getDeck.pushRemainingCards(this);
            this.getDeck.shuffle();
            if (this.getGamePhase != "roundOver")
                return this.getDeck.getCards.pop();
        }
        else
            return this.getDeck.getCards.pop();
    };
    Object.defineProperty(Table.prototype, "getGamePhase", {
        get: function () {
            return this.gamePhase;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getBetDenominations", {
        get: function () {
            return this.betDenominations;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "setGamePhase", {
        set: function (gamePhase) {
            this.gamePhase = gamePhase;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getDeck", {
        get: function () {
            return this.deck;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "drawCard", {
        set: function (card) {
            this.deck.getCards.push(card);
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getPlayers", {
        get: function () {
            return this.players;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getHouse", {
        get: function () {
            return this.house;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getResultLog", {
        get: function () {
            return this.resultLog;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getGameType", {
        get: function () {
            return this.gameType;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getIsCardClosed", {
        get: function () {
            return this.isCardClosed;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "setIsCardClosed", {
        set: function (state) {
            this.isCardClosed = state;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getTurnCounter", {
        get: function () {
            return this.turnCounter;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "getAllPlayerCounting", {
        get: function () {
            return this.allPlayerCounting;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(Table.prototype, "setAllPlayerCounting", {
        set: function (counting) {
            this.allPlayerCounting = counting;
        },
        enumerable: false,
        configurable: true
    });
    return Table;
}());
var Controller = /** @class */ (function () {
    function Controller() {
    }
    Controller.startGame = function () {
        View.renderLoginPage();
        var startGameBtn = View.config.gamePage.querySelectorAll("#startGame")[0];
        startGameBtn.addEventListener("click", function () {
            var userName = View.config.gamePage.querySelectorAll("input")[0].value;
            var table = new Table(View.config.loginPage.querySelectorAll("select")[0].value);
            if (userName === "") {
                alert("Please put your name");
            }
            else {
                Controller.changePageAndSetPlayer(table, userName, table.getGameType);
            }
        });
    };
    Controller.changePageAndSetPlayer = function (table, userName, gameType) {
        View.displayNone(View.config.loginPage);
        View.displayBlock(View.config.mainPage);
        table.setPlayers = userName;
        if (gameType === "blackjack") {
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table);
        }
    };
    Controller.controlTable = function (table) {
        View.renderTable(table);
        var player = table.getTurnPlayer();
        if (table.getGamePhase !== "betting")
            View.renderAllCountingLog(table);
        if (player.getType === "user" && table.getGamePhase === "betting") {
            table.haveTurn(player.getBet);
            View.renderBetInfo(table);
            View.renderBetBtn(table);
        }
        else if (player.getType === "user" && table.getGamePhase === "acting") {
            if (player.getGameStatus === "bet" || player.getGameStatus === "hit") {
                if (player.isBlackJack() || player.getHandScore === 21) {
                    table.haveTurn("stand");
                    Controller.controlTable(table);
                }
                else {
                    View.updatePlayerInfo(table);
                    View.updateActionBetInfo(table);
                    if (player.getGameStatus === "hit")
                        View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);
                }
            }
            else {
                table.haveTurn(player.getGameStatus);
                Controller.controlTable(table);
            }
        }
        else if (table.getGamePhase === "roundOver") {
            View.renderResult(table);
            View.renderLogResult(table);
        }
        else if (table.getGamePhase === "gameOver") {
            View.renderGameOver();
            View.renderAllLog(table);
        }
        else
            setTimeout(function () {
                table.haveTurn(table);
                Controller.controlTable(table);
            }, 1000);
    };
    Controller.clickBetBtn = function (betCoin, player) {
        if (player.getChips >= betCoin) {
            player.setBet = player.getBet + betCoin;
            player.setChips = player.getChips - betCoin;
        }
    };
    return Controller;
}());
var View = /** @class */ (function () {
    function View() {
    }
    View.displayNone = function (ele) {
        ele.classList.remove("d-block");
        ele.classList.add("d-none");
    };
    View.displayBlock = function (ele) {
        ele.classList.remove("d-none");
        ele.classList.add("d-block");
    };
    View.renderLoginPage = function () {
        View.config.loginPage.innerHTML = '';
        var container = document.createElement("div");
        container.innerHTML =
            "\n        <p class=\"text-white\">Welcome to Card Game!</p>\n        <div class=\"my-2\">\n            <input type=\"text\" placeholder=\"name\" value=\"\">\n        </div>\n        <div class=\"my-2\">\n            <select class=\"w-100\">\n                <option value=\"blackjack\">Blackjack</option>\n            </select>\n        </div>\n        <div class=\"my-2\">\n            <button type=\"submit\" class=\"btn btn-success\" id=\"startGame\">Start Game</button>\n        <div>\n        ";
        View.config.loginPage.append(container);
    };
    View.disableBtnAfterFirstAction = function () {
        var surrenderBtn = document.getElementById("surrenderBtn");
        var doubleBtn = document.getElementById("doubleBtn");
        surrenderBtn.classList.add("disabled");
        doubleBtn.classList.add("disabled");
    };
    View.renderTable = function (table) {
        View.config.mainPage.innerHTML = '';
        var container = document.createElement("div");
        container.classList.add("col-12", "d-flex", "flex-column");
        container.innerHTML =
            "\n            <div class=\"d-flex pb-5 justify-content-center text-white overflow-auto\" style=\"max-height: 120px;\">\n            <h1>BlackJack</h1>\n            </div>\n            <div id=\"houesCardDiv\" class=\"pt-5\"></div>\n            <div id=\"playersDiv\" class=\"d-flex m-3 justify-content-center\"></div>\n            <div id=\"actionsAndBetsDiv\" class=\"d-flex d-flex flex-column align-items-center\">\n                <div id=\"betsDiv\" class=\"d-flex flex-column w-50 col-3\"></div> \n            </div>\n            <div id=\"countingLog\" class=\"d-flex pb-5 justify-content-center text-white overflow-autostyle=\"max-height: 120px;\">\n            </div>\n            <div id=\"resultLogDiv\" class=\"d-flex pb-5 justify-content-center text-white overflow-auto\" style=\"max-height: 120px;\">\n            </div>\n        ";
        View.config.mainPage.append(container);
        View.renderHouseStatusPage(table);
        View.renderPlayerStatusPage(table);
        if (table.getGamePhase != "betting")
            table.setIsCardClosed = false;
        else
            table.setIsCardClosed = true;
        View.renderCards(table, table.getIsCardClosed);
    };
    View.renderBetInfo = function (table) {
        var betDiv = document.getElementById("betsDiv");
        var user = table.getPlayers.filter(function (player) {
            return player.getType === "user";
        })[0];
        betDiv.innerHTML +=
            " \n            <p class=\"m-0 text-center text-white rem3\">Bet: $".concat(user.getBet, "</p>\n            <p class=\"m-0 text-center text-white rem2\">Current Money: $").concat(user.getChips, "</p>\n        ");
    };
    View.updatePlayerInfo = function (table) {
        var houesCardDiv = document.getElementById("houesCardDiv");
        var playersDiv = document.getElementById("playersDiv");
        houesCardDiv.innerHTML = '';
        playersDiv.innerHTML = '';
        View.renderHouseStatusPage(table);
        View.renderPlayerStatusPage(table);
    };
    View.renderBetBtn = function (table) {
        var betsDiv = document.getElementById("betsDiv");
        var betBtnDiv = document.createElement("div");
        var colorHash = { 5: "btn-danger", 20: "btn-primary", 50: "btn-success", 100: "btn-dark" };
        betBtnDiv.classList.add("py-2", "h-60", "d-flex", "justify-content-between");
        for (var i = 0; i < table.getBetDenominations.length; i++) {
            var bet = table.getBetDenominations[i];
            betBtnDiv.innerHTML +=
                "\n            <div>\n                <div class=\"input-group\" >\n                    <span class=\"input-group-btn\">\n                        <button type=\"button\" class=\"btn ".concat(colorHash[bet], " rounded-circle p-0 btn-lg\" style=\"width:3rem;height:3rem;\" id=\"betValue\" value=").concat(bet, ">").concat(bet, "</button>\n                    </span>\n                </div>\n            </div>\n            ");
        }
        var dealResetDiv = document.createElement("div");
        dealResetDiv.classList.add("d-flex", "justify-content-between", "m-2");
        dealResetDiv.innerHTML =
            "            \n        <button type=\"submit\" class=\"w-30 rem5 text-center btn btn-primary\" id=\"deal\">DEAL</button>\n        <button type=\"button\" class=\"w-30 rem5 text-center btn btn-primary\" id=\"reset\">RESET</button>\n        <button type=\"submit\" class=\"w-30 rem5 text-center btn btn-primary\" id=\"allIn\">ALL IN</button>\n        ";
        betsDiv.append(betBtnDiv, dealResetDiv);
        //10月27日queryselectorに苦戦
        var selectors = betsDiv.querySelectorAll("#betValue");
        var user = table.getPlayers.filter(function (player) { return player.getType === "user"; })[0];
        selectors.forEach(function (selector) {
            selector.addEventListener("click", function () {
                Controller.clickBetBtn(parseInt(selector.value), user);
                View.updateBetInfo(table);
                View.renderBetBtn(table);
            });
        });
        var deal = betsDiv.querySelectorAll("#deal")[0];
        deal.addEventListener("click", function () {
            if (user.getBet < 5)
                alert("Minimum bet is $" + "5" + '.');
            else {
                user.setChips = user.getChips + user.getBet;
                Controller.controlTable(table);
            }
        });
        var reset = betsDiv.querySelectorAll("#reset")[0];
        reset.addEventListener("click", function () {
            user.resetPlayerBet();
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        });
        var allIn = betsDiv.querySelectorAll("#allIn")[0];
        allIn.addEventListener("click", function () {
            var allBet = user.getChips;
            user.playerAllin(allBet);
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        });
    };
    View.renderHouseStatusPage = function (table) {
        var houesCardDiv = document.getElementById("houesCardDiv");
        houesCardDiv.innerHTML = '';
        var houseCardsDiv = table.getHouse.getName + "CardsDiv";
        houesCardDiv.innerHTML +=
            "\n        <p class=\"m-0 text-center text-white pt-2 rem3\">".concat(table.getHouse.getName, "</p>\n        <div class=\"text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center\">\n            <p class=\"rem1 text-left\">Status:").concat(table.getHouse.getGameStatus, "&nbsp</a>\n        </div>\n        <div id=").concat(houseCardsDiv, " class=\"d-flex justify-content-center pb-2\">   \n        </div>\n        ");
    };
    View.renderPlayerStatusPage = function (table) {
        var playersDiv = document.getElementById("playersDiv");
        playersDiv.innerHTML = '';
        var allPlayers = table.getPlayers;
        allPlayers.forEach(function (player) {
            var playerDiv = player.getName + "PlayerDiv";
            var cardsDiv = player.getName + "CardsDiv";
            playersDiv.innerHTML +=
                "\n            <div id=".concat(playerDiv, " class=\"d-flex flex-column w-50\">\n                <p class=\"m-0 text-white text-center rem2\">").concat(player.getName, "</p>\n                    <div class=\"text-white d-flex flex-column justify-content-center align-items-center\">\n                    <p class=\"rem1 text-left\">Status:").concat(player.getGameStatus, "&nbsp</a>\n                    <p class=\"rem1 text-left\">Bet:").concat(player.getBet, "&nbsp</a>\n                    <p class=\"rem1 text-left\">Chips:").concat(player.getChips, "&nbsp</a>\n                </div>\n                <div id=").concat(cardsDiv, " class=\"d-flex justify-content-center\">\n                </div>\n            </div> \n            ");
        });
    };
    View.renderCardDiv = function (card, ele, isCardClosed) {
        var targetElement = document.getElementById(ele);
        var suit = isCardClosed ? "?" : card.getSuit;
        var rank = isCardClosed ? "?" : card.getRank;
        targetElement.innerHTML +=
            "\n        <div class=\"bg-white border rounded mx-2\">\n            <div class=\"text-center\">\n                <img src=".concat(View.suitImgURL[suit], " alt=\"\" width=\"50\" height=\"50\">\n            </div>\n            <div class=\"text-center\">\n                <p class=\"m-0 \">").concat(rank, "</p>\n            </div>\n        </div>\n        ");
    };
    View.renderCards = function (table, isCardClosed) {
        var allPlayers = table.getPlayers;
        var house = table.getHouse;
        var houseCardsDiv = house.getName + "CardsDiv";
        var houseCards = house.getHand;
        if (house.getGameStatus === "Waiting for actions") {
            View.renderCardDiv(houseCards[0], houseCardsDiv, false);
            View.renderCardDiv(houseCards[1], houseCardsDiv, true);
        }
        else {
            houseCards.forEach(function (card) { View.renderCardDiv(card, houseCardsDiv, isCardClosed); });
        }
        allPlayers.forEach(function (player) {
            player.getHand.forEach(function (card) {
                View.renderCardDiv(card, player.getName + "CardsDiv", isCardClosed);
            });
        });
    };
    View.updateBetInfo = function (table) {
        var betBtnDiv = document.getElementById("betsDiv");
        betBtnDiv.innerHTML = "";
        View.renderBetInfo(table);
    };
    View.updateActionBetInfo = function (table) {
        var actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML = '';
        View.renderActionBtn(table);
    };
    View.renderActionBtn = function (table) {
        var actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML =
            "\n        <div id =\"actionsDiv\" class=\"d-flex flex-wrap w-70 p-3 justify-content-center\">\n            <div class=\"py-2 mx-2\">\n                <a class=\"text-dark btn btn-light px-5 py-1\" id=\"surrenderBtn\">Surrender</a>\n            </div>\n            <div class=\"py-2 mx-2\">\n                <a class=\"btn btn-success px-5 py-1\" id=\"standBtn\">Stand</a>\n            </div>\n            <div class=\"py-2 mx-2\">\n                <a class=\"btn btn-warning px-5 py-1\" id=\"hitBtn\">Hit</a>\n            </div>\n            <div class=\"py-2 mx-2\">\n                <a class=\"btn btn-danger px-5 py-1\" id=\"doubleBtn\">Double</a>\n            </div>            \n        </div>\n        ";
        var actionList = ["surrender", "stand", "hit", "double"];
        actionList.forEach(function (action) {
            var actionBtn = document.getElementById(action + "Btn");
            actionBtn.addEventListener("click", function () {
                table.haveTurn(action);
                Controller.controlTable(table);
            });
        });
    };
    View.createNextGameBtnDiv = function () {
        var div = document.createElement("div");
        var nextGame = document.createElement("a");
        div.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "col-5");
        nextGame.classList.add("text-white", "btn", "btn-primary", "px-5", "py-1");
        nextGame.id = "nextGame";
        nextGame.innerText = "Next Game";
        div.append(nextGame);
        return div;
    };
    View.renderResult = function (table) {
        var actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        var userData = table.getPlayers.filter(function (user) { return user.getType === "user"; });
        var gameResult = userData[0].getGameResult.toUpperCase();
        var div = View.createNextGameBtnDiv();
        actionsAndBetsDiv.innerHTML = '';
        var p = document.createElement("p");
        p.classList.add("m-0", "text-white", "text-center", "rem3");
        p.innerText = "".concat(gameResult);
        div.append(p);
        actionsAndBetsDiv.append(div);
        var nextGameBtn = actionsAndBetsDiv.querySelectorAll("#nextGame")[0];
        nextGameBtn.addEventListener("click", function () {
            table.haveTurn(table);
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table);
        });
    };
    View.renderLogResult = function (table) {
        var resultLogDiv = document.getElementById("resultLogDiv");
        var div = document.createElement("div");
        div.classList.add("text-white", "w-300");
        div.innerHTML +=
            "\n        <p>rounnd ".concat(table.getResultLog.length + 1, "</p>\n        ");
        div.append(table.blackjackEvaluateAndGetRoundResults());
        resultLogDiv.append(div);
    };
    View.renderAllLog = function (table) {
        var resultLogDiv = document.getElementById("resultLogDiv");
        var div = document.createElement("div");
        div.classList.add("text-white", "w-300");
        for (var i = 0; i < table.getResultLog.length; i++) {
            div.innerHTML +=
                "\n            <p>rounnd ".concat(i + 1, "</p>\n            ");
            div.append(table.getResultLog[i]);
        }
        resultLogDiv.append(div);
    };
    View.renderAllCountingLog = function (table) {
        var countingLog = document.getElementById("countingLog");
        var div = document.createElement("div");
        div.classList.add("text-white", "w-300");
        div.innerHTML +=
            "\n            <p>All Player Counting -> ".concat(table.getAllPlayerCounting, "</p>\n            <p>Dealer Counting -> ").concat(table.getHouse.getCounting, "</p>\n            ");
        table.getPlayers.forEach(function (player) {
            div.innerHTML +=
                "\n                <p>".concat(player.getName, "'s counting -> ").concat(player.getCounting, "</p>\n                ");
        });
        countingLog.append(div);
    };
    View.renderGameOver = function () {
        var actionsAndBetsDiv = document.getElementById("actionsAndBetsDiv");
        actionsAndBetsDiv.innerHTML +=
            "\n        <div class=\"d-flex flex-column justify-content-center align-items-center col-5\">\n            <p class=\"m-0 text-white text-center rem3\">GAME OVER</p>\n        </div>\n        <div class=\"d-flex justify-content-around m-2 col-2\">\n            <button type=\"submit\" class=\"text-white btn btn-primary w-30 rem5\" id=\"newGame\">New Game</button>\n        </div>\n        ";
        var newGameBtn = actionsAndBetsDiv.querySelectorAll("#newGame")[0];
        newGameBtn.addEventListener("click", function () {
            View.displayNone(View.config.mainPage);
            View.displayBlock(View.config.loginPage);
            Controller.startGame();
        });
    };
    View.suitImgURL = { "S": "https://recursionist.io/img/spade.png", "H": "https://recursionist.io/img/heart.png", "C": "https://recursionist.io/img/clover.png", "D": "https://recursionist.io/img/diamond.png", "?": "https://recursionist.io/img/questionMark.png"
    };
    View.config = {
        gamePage: document.getElementById("gameDiv"),
        loginPage: document.getElementById("loginPage"),
        mainPage: document.getElementById("mainPage"),
    };
    return View;
}());
Controller.startGame();
