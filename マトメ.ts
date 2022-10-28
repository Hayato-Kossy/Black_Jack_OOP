// class Card{
//     private suit: string;
//     private rank: string;

//     constructor(suit:string, rank:string){
//         this.suit = suit;
//         this.rank = rank;
//     }

//     public get getSuit():string{
//         return this.suit;
//     }

//     public get getRank():string{
//         return this.rank;
//     }

//     public get getRankNumberBlackjack():number{
//         if(this.rank === "A") return 11;
//         else if(this.rank === "J" || this.rank === "Q" || this.rank === "K"){
//             return 10;
//         }
//         else return parseInt(this.rank);
//     }
// }

// class Deck{
//     //NOTE:10/15 never型の理解で苦戦
//     private gameType:string;
//     private cards:Card[] = Array();
//     static readonly suits = ["H", "D", "C", "S"];
//     static readonly ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

//     constructor(gameType:string){
//         this.gameType = gameType;

//         this.cards = this.gameType === "BlakJack" ? Deck.generateBlackJackDeck() : Array();
//         this.shuffle();
//     }
//     private static generateBlackJackDeck():Card[]{
//         let cards = Array();

//         for (let suit in Deck.suits){
//             for (let rank in Deck.ranks){
//                 cards.push(new Card(suit, rank));
//             }
//         }
//         return cards;
//     }
//     public drawOne():Card{
//         return this.cards.pop() as Card;
//     }
//     public shuffle():void{
//         for(let i = 0;i < this.cards.length;i++){
//             let j = Math.floor(Math.random() * (i + 1));
//             let temp = this.cards[i];
//             this.cards[i] = this.cards[j];
//             this.cards[j] = temp;
//         }
//     }
// }

// class Player{
//     private name:string;
//     private type:string;
//     private gameType:string;
//     private hand:Card[];
//     private split:string;
//     private chips:number;
//     private bet:number;
//     private winAmount:number;
//     private gameStatus:string;

//     constructor(name:string, type:string, gameType:string, chips:number = 400){
//         this.name = name;
//         this.type = type;
//         this.gameType = gameType;
//         this.hand = Array();
//         this.split = "";
//         this.chips = chips;
//         this.bet = 0;
//         this.winAmount = 0;
//         this.gameStatus = "betting";
//     }

//     //getter
//     public get getName():string{
//         return this.name;
//     }
//     public get getType():string{
//         return this.type;
//     }
//     public get getGameType():string{
//         return this.gameType;
//     }
//     public get getChips():number{
//         return this.chips;
//     }
//     public get getHand():Card[]{
//         return this.hand;
//     }
//     public get getSplit():string{
//         return this.split;
//     }
//     public get getBet():number{
//         return this.bet;
//     }
//     public get getWinAmount():number{
//         return this.winAmount;
//     }
//     public get getGameStatus():string{
//         return this.gameStatus;
//     }
//     public get getHandScore():number{
//         let handScore:number = 0;

//         for (let i = 0; i < this.hand.length; i++){
//             handScore += this.hand[i].getRankNumberBlackjack;
//             if (handScore - 11 > 21 && this.hand[i].getRank === "A") handScore -= 10;
//         }
//         return handScore;
//     }

//     //setter
//     public set setBet(bet:number){
//         this.bet = bet;
//     }
//     public set setWinAmount(winAmount:number){
//         this.winAmount = winAmount;
//     }
//     public set setChips(chips:number){
//         this.chips = chips;
//     }
//     public set setGameStatus(gameStatus:string){
//         this.gameStatus = gameStatus;
//     }

//     public set drawCard(card:Card){
//         this.hand.push(card);
//     }

//     public set restartHand(cards:Card[]){
//         this.hand = cards;
//     }

//     //NOTE:userの場合は後回し
//     public promptPlayerBlackjack(userData:string):GameDecision | null{
//         //AIの場合
//         if (this.getType === "ai") {
//             if (this.getGameStatus === "betting") {
//                 if (this.getChips === 0) return new GameDecision("bet",0);
//                 if (this.getChips <= 20) return new GameDecision("bet",20);
//                 this.setBet = this.chips / 5;
//                 let random = Math.floor(Math.random() * 100);
//                 if (random % 2 == 0) this.setBet = this.getBet + random;
//                 else this.setBet = this.getBet - random;

//                 let rest:number = this.getBet;
//                 let betDenominations:number[] = [100, 50, 20, 5];
                
//                 while (betDenominations.length > 0) {
//                     let divisor:number = betDenominations[0];
//                     this.setBet = this.getBet + Math.floor(rest / divisor) * divisor;
//                     rest -= Math.floor(rest / divisor) * divisor;
//                     betDenominations.shift();
//                 }

//                 if (this.getBet <= 0) return new GameDecision("bet", 0);
//                 if(this.getBet >= this.getChips) return new GameDecision("bet", this.getChips);
//                 return new GameDecision("bet", this.getBet);
//             }
//             else if (this.getGameStatus === "acting"){
//                 if (this.getHandScore > 16 || this.getHandScore > 12) {
//                     return new GameDecision("stand", this.getBet);
//                 }
//                 else if (this.getHandScore === 10 || this.getHandScore === 11){
//                     return new GameDecision("double", this.getBet);
//                 }
//                 else return new GameDecision("hit", this.getBet);
//             }
//             else if (this.getGameStatus === "acting"){
//                 if(this.getHandScore > 16 || (this.getHandScore > 12)){
//                     return new GameDecision("stand", this.bet);
//                 }
//                 if(this.getHandScore > 8 && this.getHandScore < 12){
//                     return new GameDecision("double", this.bet);
//                 }
//                 else{
//                     return new GameDecision("hit", this.bet);
//                 }
//             }
//             else if (this.getGameStatus === "hit") {
//                 if (this.getHandScore >= 17) {
//                     return new GameDecision("stand", this.getBet);
//                 }
//                 else return new GameDecision("hit", this.getBet);
//             }
//             else return null;
//         }
//         //userの場合
//         if (this.getType === "user") {

//         }
//         //houseの場合
//         if (this.getType === "house") {
//             if(this.gameStatus == "betting"){
//                 this.gameStatus = "waiting";
//                 return new GameDecision("wait", 0);
//             }
//             else if(this.gameStatus == "acting"){
//                 if(this.getHandScore >= 16){
//                     return new GameDecision("stand", this.bet);
//                 }
//                 else{
//                     return new GameDecision("hit", this.bet);
//                 }
//             }
//             else if(this.gameStatus == "hit"){
//                 if(this.getHandScore >= 16){
//                     return new GameDecision("stand", this.bet);
//                 }
//                 else return new GameDecision("hit", this.bet);
//             }
//             else return null;
//         }
//         else return null
//     }
// }

// class GameDecision{
//     private action:string;
//     private amount:number;

//     constructor(action:string, amount:number){
//         this.action = action;
//         this.amount = amount;
//     }

//     public get getAction():string{
//         return this.action;
//     }

//     public get getAmount():number{
//         return this.amount;
//     }
// }

// class Table{
//     private gameType:string;
//     private betDenominations:number[];
//     private deck:Deck;
//     private players:Player[] = Array();
//     private house:Player;
//     private gamePhase = "betting";
//     private resultLog:string[];
//     private turnCounter:number;
//     private roundCounter:number;

//     constructor(gameType:string, betDenominations:number[] = [5, 20, 50, 100]){
//         this.gameType = gameType;
//         this.betDenominations = betDenominations;
//         this.deck = new Deck(this.gameType);
//         this.players = []
//         this.house = new Player("house", "house", this.gameType);
//         this.players.push(this.house);
//         this.gamePhase = "betting";
//         this.resultLog = [];
//         this.turnCounter = 0;
//         this.roundCounter = 1;
//     }

//     public evaluateMove(player:Player):void{
//         let decision = player.promptPlayerBlackjack(player.getType);
//         if(decision == null) return;
//         else if(decision.getAction == "bet"){
//             player.setBet = decision.getAmount;
//             player.setGameStatus = "acting";
//         }
//         else if(decision.getAction == "surrender"){
//             player.setWinAmount = Math.floor(player.getBet / 2) * -1;
//             if(player.getBet % 5 != 5) player.setWinAmount = Math.floor(player.getWinAmount / 5) * 5;
//             player.setGameStatus = "surrender";
//         }
//         else if(decision.getAction == "stand"){
//             player.setGameStatus = "stand";
//         }
//         else if(decision.getAction == "hit"){
//             let card = this.deck.drawOne();
//             player.drawCard = card;
//             // NOTE:ViewからModelのアクセスはおかしい
//             // View.draw(player, card);
//             player.setGameStatus = "hit";
//             if(player.getHandScore == 0){
//                 player.setGameStatus = "bust";
//                 player.setWinAmount = player.getBet * -1;
//             }
//         }
//         else if(decision.getAction == "double"){
//             if(player.getHand.length >= 3){
//                 return;
//             }
//             let card = this.deck.drawOne();
//             player.drawCard = card;
//             // View.draw(player, card);
//             player.setGameStatus = "double";
//             if(player.getHandScore == 0){
//                 player.setGameStatus = "doubleBust";
//                 player.setWinAmount = player.getBet * -2;
//             }
//         }
//         else if(decision.getAction == "blackjack"){
//             player.setGameStatus = "blackjack";
//         }
//         // NOTE:ViewからModelのアクセスはおかしい
//         // View.statusChange(player);
//     }

//     private blackjackEvaluateAndGetRoundResults():string{
//         let resultLog = `round ${this.roundCounter}: //`;
//         let houseScore = this.house.getHandScore;
        
//         this.players.forEach((currentPlayer) =>{
//             let score = currentPlayer.getHandScore;
//             if(currentPlayer.getType == "house"){
//                 if(score == 22) currentPlayer.setGameStatus = "blackjack";
//             }
//             if(currentPlayer.getGameStatus == "stand"){
//                 if(score > houseScore){
//                     currentPlayer.setWinAmount = currentPlayer.getBet;
//                 }
//                 else if(score < houseScore){
//                     currentPlayer.setWinAmount = currentPlayer.getBet * -1;
//                 }
//                 if(score == 22) currentPlayer.setGameStatus = "blackjack";
//             }
//             if(currentPlayer.getGameStatus == "double"){
//                 if(score > houseScore){
//                     currentPlayer.setWinAmount = currentPlayer.getBet * 2;
//                 }
//                 else if(score < houseScore){
//                     currentPlayer.setWinAmount = currentPlayer.getBet * -2;
//                 }
//             }
//             if(currentPlayer.getGameStatus == "blackjack"){
//                 if(houseScore < 22) currentPlayer.setWinAmount = Math.floor(currentPlayer.getBet * 1.5);
//                 if(currentPlayer.getWinAmount % 5 != 0) currentPlayer.setWinAmount = Math.floor(currentPlayer.getWinAmount / 5) * 5;
//             }

//             currentPlayer.setChips = currentPlayer.getChips + currentPlayer.getWinAmount;

//             resultLog += `name: ${currentPlayer.getName}, action: ${currentPlayer.getGameStatus}, bet: ${currentPlayer.getBet}, won: ${currentPlayer.getWinAmount}//`;
//         })
//         this.roundCounter++;
//         return resultLog;
//     }
//     public blackjackClearPlayerHandsAndBets():void{
//         this.players.forEach((currentPlayer) => {
//             currentPlayer.setBet = 0;
//             currentPlayer.restartHand = [];
//             currentPlayer.setWinAmount = 0;
//             currentPlayer.setGameStatus = "betting";
//             this.turnCounter = 0;
//         })
//         this.gamePhase = "betting";
//         this.deck = new Deck(this.gameType);
//     }
//     public getTurnPlayer():Player{
//         return this.players[this.turnCounter % this.players.length];
//     }

//     public haveTurn():void{
//         let currentPlayer = this.getTurnPlayer();
//         if(this.gamePhase == "betting"){
//             this.evaluateMove(currentPlayer);
//             if(this.onLastPlayer()){
//                 this.gamePhase = "acting";
//             }
//         }
//         else if(this.gamePhase == "acting"){
//             this.evaluateMove(currentPlayer);
//             if(this.allPlayerActivesResolved() && this.house.getGameStatus == "waiting"){
//                 if(this.getTurnPlayer() == this.house){
//                     this.house.setGameStatus = "acting";
//                     // ViewがModelに干渉している
//                     // View.statusChange(this.house);
//                 }
//             }
//             else if(this.allPlayerActivesResolved()){
//                 this.gamePhase = "roundOver";
//                 this.resultLog.push(this.blackjackEvaluateAndGetRoundResults());
//             }
//         }

//         this.turnCounter++;
//     }

//     private onFirstPlayer():boolean{
//         return this.turnCounter % this.players.length == 0;
//     }

//     private onLastPlayer():boolean{
//         return this.turnCounter % this.players.length == this.players.length - 1;
//     }

//     public allPlayerActivesResolved():boolean{
//         let count = 0;
//         this.players.forEach((currentPlayer) =>{            
//             if(currentPlayer.getGameStatus == "stand" || currentPlayer.getGameStatus == "bust" || currentPlayer.getGameStatus == "doubleBust" || currentPlayer.getGameStatus == "double" || currentPlayer.getGameStatus == "surrender" || currentPlayer.getGameStatus == "waiting" || currentPlayer.getGameStatus == "blackjack"){
//             count++;
//             }
//         })
//     return count == this.players.length;
//     }
// }

// class Controller {

// }
// class View{
//     static config = {
//         gamePage:document.getElementById("gameDiv"),
//         loginPage:document.getElementById("loginPage"),
//         mainPage:document.getElementById("mainPage"),
//         suitImgURL : {
//             "S" : "https://recursionist.io/img/spade.png",
//             "H" : "https://recursionist.io/img/heart.png",
//             "C" : "https://recursionist.io/img/clover.png",
//             "D" : "https://recursionist.io/img/diamond.png",
//             "?" : "https://recursionist.io/img/questionMark.png"
//         }
//     }
//     static displayNone(ele:HTMLElement){
//         ele.classList.remove("d-block");
//         ele.classList.add("d-none");
//     }

//     static displayBlock(ele:HTMLElement){
//         ele.classList.remove("d-none");
//         ele.classList.add("d-block");
//     }

//     static renderLoginPage(){
//         View.config.loginPage!.innerHTML = '';
//         let container = document.createElement("div");
//         container.innerHTML = 
//         `
//         <p class="text-white">Welcome to Card Game!</p>
//         <div class="my-2">
//             <input type="text" placeholder="name" value="">
//         </div>
//         <div class="my-2">
//             <select class="w-100">
//                 <option value="blackjack">Blackjack </option>
//                 <option value="poker">Poker </option>
//             </select>
//         </div>
//         <div class="my-2">
//             <button type="submit" class="btn btn-success" id="startGame">Start Game</button>
//         <div>
//         `
//         View.config.loginPage!.append(container);
//     }

//     static renderTable(table:Player) {
//         View.config.mainPage!.innerHTML = '';
//         let container = document.createElement("div");
//         container.classList.add("col-12", "d-flex", "flex-column");
//         container.innerHTML =
//         `
//             <div id="houesCardDiv" class="pt-5">
//             </div>
    
//             <!-- Players Div -->
//             <div id="playersDiv" class="d-flex m-3 justify-content-center">
//             </div><!-- end players -->  
//             <!-- actionsAndBetsDiv -->
//             <div id="actionsAndBetsDiv" class="d-flex pb-5 pt-4 d-flex flex-column align-items-center">
//                 <!-- betsDiv -->
//                 <div id="betsDiv" class="d-flex flex-column w-50 col-3">
//                 </div><!-- end betsDiv-->
//             </div><!-- end actionsAndBetsDiv-->
//             <div id="resultLogDiv" class="d-flex pb-5 pt-4 justify-content-center text-white overflow-auto" style="max-height: 120px;">
//             </div>
//         `
//         View.config.mainPage!.append(container);
//         View.renderHouseStatusPage(table);
//         View.renderPlayerStatusPage(table);
//         let isMask;
//         if(table. != "betting") isMask = false;
//         else isMask = true;
//         View.renderCards(table, isMask);
//     }
//     public draw(){

//     }
// }
// type userData = {
//     action: string,
//     bet: number
// }