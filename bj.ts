class Card
{
    private suit:string;
    private rank:string;

    constructor(suit:string, rank:string)
    {
        this.suit = suit;
        this.rank = rank;
    }

    public get getRankNumber():number{
        if(this.rank == "J" || this.rank == "Q" || this.rank == "K") return 10;
        else if(this.rank == "A") return 11;
        else return parseInt(this.rank);
    }

    public get getSuit():string{
        return this.suit;
    }

    public get getRank():string{
        return this.rank;
    }
}


class Deck{
    private readonly suits:string[] = ["H", "D", "C", "S"];
    private readonly ranks:string[] = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    private cards:Card[];

    constructor(private gameType:string){
        this.gameType = gameType;
        this.cards = [];
        this.pushAllcards();
        this.shuffle();
    }

    private pushAllcards():void{
        if(this.gameType == "blackjack"){
            this.suits.forEach((suit) => {
                this.ranks.forEach((rank) => {
                    this.cards.push(new Card(suit, rank))
                })
            })
        }
    }
    public pushRemainingCards(table:Table):void{
        this.suits.forEach((suit) => {
            this.ranks.forEach((rank) => {
                if(!table.cardIsOnTable(suit, rank)){
                    table.drawCard = new Card(suit, rank);
                }              
            })
        })
    }

    public shuffle():void{
        let l = this.cards.length;
        for(let i = l - 1; i > 0; i--){
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }

    public isEmpty():boolean{
        return this.cards.length == 0;
    }

    public get getCards():Card[]{
        return this.cards;
    }
}

class Player{
    private hand:Card[];
    private bet:number;
    private winAmount:number;
    private playerScore:number;
    private gameStatus = "betting";
    private gameResult = "";
    constructor(private name:string, private type:string,private gameType:string,private chips = 400
    ){
        this.name = name;
        this.type = type;
        this.gameType = gameType;
        this.chips = chips;
        this.hand = [];
        this.bet = 0;
        this.winAmount = 0;
        this.playerScore = this.getHandScore;
    }

    //NOTE戻り値のデータ型が抽象的すぎる
    public drawOne(table:Table):any{
        if(table.getDeck.isEmpty()){
            alert("No cards left. Shuffle the cards.")
            table.getDeck.pushRemainingCards(table);
            table.getDeck.shuffle();
            if(table.getGamePhase != "roundOver") return table.getDeck.getCards.pop();
            else return null;
        }
        else return table.getDeck.getCards.pop();
    }

    public promptPlayer(table:Table, userData:any):GameDecision{
        let gameDecision:GameDecision;
        if(table.getGamePhase === "betting") {
            if(this.type === "ai") gameDecision = this.getAiBetDecision(table);
            else gameDecision = new GameDecision("bet", userData);
            return gameDecision;
        }
        else if(table.getGamePhase === "acting"){
            if(this.type === "ai") gameDecision = this.getAiGameDecision(table);
            else if(this.type === "user") gameDecision = this.getUserGameDecision(userData);
            gameDecision = this.getHouseGameDecision(table);
            return gameDecision;
        }
        return new GameDecision("null", 404);
    }

    public get getHandScore():number{
        let handScore:number = 0;
        
            for (let i = 0; i < this.hand.length; i++){
                handScore += this.hand[i].getRankNumber;
                if (handScore - 11 > 21 && this.hand[i].getRank === "A") handScore -= 10;
            }
        return handScore;
    }

    public isBlackJack(){
        if(this.getHandScore == 21 && this.hand.length == 2) return true;
        else return false;
    }

    public resetPlayerBet(){
        this.chips += this.bet;
        this.bet = 0;
    }

    public playerAllin(betCoin:number){
        this.bet += betCoin;
        this.chips -= betCoin;
    }

    //確認ずみ
    private getHouseGameDecision(table:Table):GameDecision{
        let gameDecision:GameDecision;
        if(table.allPlayersHitCompleted() && table.allPlayersBetCompleted()){
            if(this.isBlackJack()) return new GameDecision("blackjack", this.bet);
            else if(this.getHandScore < 17) {
                gameDecision = new GameDecision("hit", -1);
            }
            else gameDecision = new GameDecision("stand", -1);
            console.log("house acted")
        }
        else gameDecision = new GameDecision(this.gameStatus, -1);

        return gameDecision;
    }

    private getAiBetDecision(table:Table):GameDecision{
        if(table.getTurnPlayer().getGameStatus == "game over"){
            return new GameDecision("game over", 0)
        }
        else{
            let availableBet = table.getBetDenominations.filter(bet=>(bet <= this.chips));
            let betAmount = availableBet[this.randomIntInRange(0, availableBet.length)];
            table.getTurnPlayer().bet = betAmount;

            return new GameDecision("bet", betAmount);
        }
    }

    private getAiGameDecision(table:Table){
        let gameDecision:GameDecision;
        if(this.isBlackJack()){
            gameDecision = new GameDecision("blackjack", this.bet);
        }
        else if(this.gameStatus === "bet"){
            let actionList = ["surrender", "stand", "hit", "double"];
            gameDecision = new GameDecision(actionList[this.randomIntInRange(0, actionList.length)], this.bet);
            if(gameDecision.getAction == "double" && table.getTurnPlayer().chips < table.getTurnPlayer().bet * 2){
                gameDecision.setAction = "hit";
                gameDecision = new GameDecision("hit", this.bet);
            }
            else if(gameDecision.getAction == "double") table.getTurnPlayer().setBet = table.getTurnPlayer().getBet * 2;
        }
        else if(this.gameStatus === "hit"){
            let actionList = ["surrender", "stand", "hit", "double"];
            gameDecision = new GameDecision(actionList[this.randomIntInRange(0, actionList.length)], this.bet);
        }
        else{
            gameDecision = new GameDecision(this.gameStatus, this.bet);
        }
        return gameDecision;
    }

    private getUserGameDecision(userData:any):GameDecision{
        let gameDecision:GameDecision;
        if(this.isBlackJack()){
            gameDecision = new GameDecision("blackjack", this.bet);
        }
        else{
            gameDecision = new GameDecision(userData, this.bet);
        }
        return gameDecision;    
    }

    public get getGameStatus():string{
        return this.gameStatus;
    }

    public set setGameStatus(gameStatus:string){
        this.gameStatus = gameStatus;
    }

    public get getHand():Card[]{
        return this.hand;
    }

    public set drawCard(card:Card){
        this.hand.push(card)
    }

    public set setHand(card:Card[]){
        this.hand = card;
    }

    public get getWinAmount():number{
        return this.winAmount;
    }

    public set setWinAmount(winAmount:number){
        this.winAmount = winAmount;
    }

    public get getPlayerScore():number{
        return this.playerScore;
    }

    public set setPlayerScore(score:number){
        this.playerScore = score;
    }

    public get getName():string{
        return this.name;
    }

    public get getType():string{
        return this.type;
    }

    public get getChips():number{
        return this.chips;
    }

    public set setChips(chips:number){
        this.chips = chips;
    }

    public get getGameResult():string{
        return this.gameResult;
    }

    public set setGameResult(gameResult:string){
        this.gameResult = gameResult;
    }

    public get getBet():number{
        return this.bet
    }

    public set setBet(bet:number){
        this.bet = bet;
    }

    public randomIntInRange(min, max){
        return Math.floor(Math.random()* (max-min) + min);
    }
}

class GameDecision{
    private action:string;
    private amount:number;

    constructor(action:string, amount:number){
        this.action = action;
        this.amount = amount;
    }

    public get getAction():string{
        return this.action;
    }

    public get getAmount():number{
        return this.amount;
    }

    public set setAction(action:string){
        this.action = action;
    }

    public set setAmount(amount:number){
        this.amount = amount;
    }
}


class Table{
    private deck:Deck;
    private gamePhase:string;
    private players:Player[];
    private house:Player;
    private turnCounter:number;
    private resultLog:HTMLElement[]

    constructor(private gameType:string, private readonly betDenominations = [5,20,50,100]){
        this.gameType = gameType;
        this.deck = new Deck(this.gameType)
        this.players = [];
        this.house = new Player("Dealer", "house", this.gameType);
        this.gamePhase = "betting";
        this.resultLog = [];
        this.turnCounter = 0;
    }

    public set setPlayers(userName:string){
        this.players.push(new Player("AI1", "ai", this.gameType), new Player(userName, "user", this.gameType),new Player("AI2", "ai", this.gameType));
    }

    public cardIsOnTable(suit:string, rank:string):boolean{
        let flag = false;
        let houseHand = this.house.getHand
        this.players.forEach((player) => {
            let playerHand:Card[] = player.getHand;
            playerHand.forEach((card) => {
                if(card.getSuit == suit && card.getRank == rank) return !flag;
            })
        })
        houseHand.forEach((card) => {
            if(card.getSuit == suit && card.getRank == rank) return !flag;
        })
        return flag;
    }

    private evaluateMove(gameDecision:GameDecision, player:Player) {
        player.setGameStatus = gameDecision.getAction;
        player.setBet = gameDecision.getAmount;
        switch(gameDecision.getAction){
            case "betting":
                break;
            case "hit":
                // if (typeof player.drawOne(this) !== null && typeof player.drawOne(this) !== undefined)
                player.drawCard = player.drawOne(this);
                if (player.getHandScore > 21) player.setGameStatus = "bust";
                break;
            case "stand":
                break;
            case "surrender":
                break;
                case "double":
                    if(this.turnCounter - 4 <= this.players.length){
                        player.drawCard = player.drawOne(this);
                        if(player.getHandScore > 21) player.setGameStatus = "bust"
                        break;
                    }
                    else break;
                case "game over":
                    break;            
        }
    }

    public blackjackEvaluateAndGetRoundResults():HTMLElement{
        let list:HTMLElement = document.createElement("ul") as HTMLElement;
        this.players.forEach((player) => {
            let playerListResult:HTMLElement = document.createElement("li");
            playerListResult.textContent = `name: ${player.getName}, action: ${player.getGameStatus}, bet: ${player.getBet}, won: ${player.getWinAmount}, result: ${player.getGameResult}`
            list.append(playerListResult);       
        })
        this.resultLog.push(list);
        return list;
    }

    public blackjackAssignPlayerHands(){
        while(this.house.getHand.length < 2){
            this.house.drawCard = this.house.drawOne(this);
        }

        this.players.forEach((player) => {
            if (player.getGameStatus != "game over"){
                while (player.getHand.length < 2){
                    player.drawCard = player.drawOne(this);
                }
            }
        })
    }

    private blackjackClearPlayerHandsAndBets():void{
        this.players.forEach((player) => {
            player.setHand = [];
            player.setBet = 0;
            player.setWinAmount = 0;
            if (player.getGameStatus !== "game over"){
                player.setGameStatus = "betting";
            }
            player.setGameResult = '';
        })
        this.house.setHand = [];
        this.house.setGameStatus = "betting";
    }

    public haveTurn(userData:any):void{
        let turnPlayer = this.getTurnPlayer();
        if(this.gamePhase === "betting"){
            if(turnPlayer.getType === "house"){
                console.log("house turn")
                this.house.setGameStatus = "Waiting for bets"
                console.log(this.house.getGameStatus)
            }
            else if(turnPlayer.getType === "user" || turnPlayer.getType === "ai"){
                this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
            if(this.onLastPlayer()){
                console.log("onlast")
                this.gamePhase = "acting";
                this.house.setGameStatus = "Waiting for actions"
            }
        }

        else if(this.gamePhase === "acting"){
            if(this.getIsAllActionsCompleted){
                this.evaluateWinners();
                this.setGamePhase = "roundOver";
            }
            else{
            this.evaluateMove(turnPlayer.promptPlayer(this, userData), turnPlayer);
            }
        }
        else if(this.gamePhase === "roundOver"){
            this.gamePhase = "betting";
            this.house.setGameStatus = "Waiting for bets";
            this.turnCounter = 0;
            this.blackjackClearPlayerHandsAndBets()
        }
        this.turnCounter++;
    }

    private onLastPlayer():boolean{
        return this.turnCounter % (this.players.length + 1) == this.players.length;
    }

    public allPlayersHitCompleted():boolean{
        this.players.forEach((player) => {
            if (player.getGameStatus === "hit") return false;
        })
        return true;
    }

    // public get allPlayerFinished():boolean{
    //     const array = ["bust", "blackjack", "double", "stand"];

    //     this.players.forEach((player) => {
    //         if (!array.indexOf(player.getGameStatus))return false;
    //     })
    //     return true;
    // }

    private evaluateWinners():void{

        this.players.forEach((player) => {
            if(player.getGameStatus === "surrender") this.calcWinAmount(player, "surrender");
            else if(player.getGameStatus === "bust") this.calcWinAmount(player, "bust");
            else{
                switch(this.house.getGameStatus){
                    case "blackjack":
                        if (player.getGameStatus === "blackjack") this.calcWinAmount(player, "push");
                        else this.calcWinAmount(player, "lose");
                        break;
                    case "bust":
                        this.calcWinAmount(player, "win")
                        break;
                    default:
                        if(player.getGameStatus === "blackjack"){
                            this.calcWinAmount(player, "win")
                        }
                        else if(player.getHandScore > this.house.getHandScore){
                            this.calcWinAmount(player, "win")
                        }
                        else if(player.getHandScore === this.house.getHandScore){
                            this.calcWinAmount(player, "push")
                        }
                        else{
                            this.calcWinAmount(player, "lose")
                        }
                }
            }
        })
    }
    
    public calcWinAmount(player:Player, result:string):void{
        switch(player.getGameStatus){
            case "blackjack":
                if(result != "push"){
                    player.setWinAmount = Math.floor(player.getBet * 1.5);
                    break;
                }
                else break;
            case "surrender":
                player.setWinAmount = Math.floor(player.getBet / 2);
                break;
            case "bust":
                player.setWinAmount = player.getBet;
                break;
            default:
                if(result == "push") break;
                else player.setWinAmount = player.getBet;                
        }
        if(result === "lose" || player.getGameStatus === "bust" || player.getGameStatus === "surrender") player.setWinAmount = player.getBet * -1;
        if(result != "push") player.setChips = player.getChips + player.getWinAmount;

        if(player.getGameStatus != "blackjack") player.setGameResult = result;
        else player.setGameResult = "blackjack";
        this.checkGameOver(player);
    }

    public checkGameOver(player:Player){
        if(player.getType == "user" && player.getChips < 5){
            player.setGameStatus = "game over";
            this.gamePhase = "gameOver";
        }
        else if(player.getChips < 5) player.setGameStatus = "game over";
    }

    public allPlayersBetCompleted():boolean{
        this.players.forEach((player) => {
            if (player.getGameStatus === "bet") return false;
        })
        return true;    
    }

    private houseActionCompleted():boolean{
        console.log(this.house.getGameStatus)
        return this.house.getGameStatus != "hit" && this.house.getGameStatus != "Waiting for actions";
    }

    public get getIsAllActionsCompleted():boolean{
        return this.houseActionCompleted() && this.allPlayersHitCompleted();
    }

    public getTurnPlayer():Player{
        let index:number = this.turnCounter % (this.players.length + 1);
        if (index === 0) return this.house;
        return this.players[index - 1];
    }
    public get getGamePhase():string{
        return this.gamePhase;
    }

    public get getBetDenominations():number[]{
        return this.betDenominations;
    }

    public set setGamePhase(gamePhase:string){
        this.gamePhase = gamePhase;
    }

    public get getDeck():Deck{
        return this.deck
    }

    public set drawCard(card:Card){
        this.deck.getCards.push(card); 
    }

    public get getPlayers():Player[]{
        return this.players;
    }

    public get getHouse():Player{
        return this.house;
    }

    public get getResultLog():HTMLElement[]{
        return this.resultLog;
    }
}

class Controller{

    static startGame():void{
        View.renderLoginPage();
        let startGameBtn = View.config.gamePage!.querySelectorAll("#startGame")[0];
        startGameBtn.addEventListener("click", function(){
            let userName = View.config.gamePage!.querySelectorAll("input")[0].value;
            let table = new Table(View.config.loginPage!.querySelectorAll("select")[0].value);
            if(userName == ""){
                alert("Please put your name");
            } else{
                Controller.changePageAndSetPlayer(table, userName);
            }
        });
    }

    static changePageAndSetPlayer(table:Table,userName:string){
        View.displayNone(View.config.loginPage);
        View.displayBlock(View.config.mainPage);
        table.setPlayers = userName;
        table.blackjackAssignPlayerHands();

        Controller.controlTable(table, "");
    }

    //動作確認済み
    static controlTable(table:Table,userData:any){
        View.renderTable(table);
        let player = table.getTurnPlayer()
        if(player.getType === "user" && table.getGamePhase === "betting"){
            table.haveTurn(player.getBet);
            View.renderBetInfo(table);
            View.renderBetBtn(table);
        }
        else if(player.getType === "user" && table.getGamePhase === "acting"){
            if(player.getGameStatus === "bet" || player.getGameStatus === "hit"){

                if(player.isBlackJack() || player.getHandScore === 21){
                        table.haveTurn("stand");
                        Controller.controlTable(table, userData)
                    }

                else{
                    View.updatePlayerInfo(table)
                    View.updateActionBetInfo(table, player);
                    if(player.getGameStatus === "hit") View.disableBtnAfterFirstAction();
                    View.renderCards(table, false);    
                }
            }
            else{
                table.haveTurn(player.getGameStatus);
                Controller.controlTable(table, userData)
            }
            
        }
        else if(table.getGamePhase === "roundOver"){
            View.renderResult(table);
            View.renderLogResult(table);
        }

        else if(table.getGamePhase === "gameOver"){
            View.renderGameOver();
            View.renderAllLog(table);
        }
        else setTimeout(function(){
            table.haveTurn(table);
            Controller.controlTable(table, userData)
        },1000);

    }

    static clickBetBtn(betCoin:number, player:Player){
        if(player.getChips >= betCoin){
            player.setBet = player.getBet + betCoin;
            player.setChips = player.getChips - betCoin;
        }
    }


}

class View{
    static config = {
        gamePage: document.getElementById("gameDiv"),
        loginPage: document.getElementById("loginPage"),
        mainPage: document.getElementById("mainPage"),
        suitImgURL : {
            "S" : "https://recursionist.io/img/spade.png",
            "H" : "https://recursionist.io/img/heart.png",
            "C" : "https://recursionist.io/img/clover.png",
            "D" : "https://recursionist.io/img/diamond.png",
            "?" : "https://recursionist.io/img/questionMark.png"
        }   
    }

    static displayNone(ele:HTMLElement|null){
        ele!.classList.remove("d-block");
        ele!.classList.add("d-none");
    }

    static displayBlock(ele:HTMLElement|null){
        ele!.classList.remove("d-none");
        ele!.classList.add("d-block");
    }

    static renderLoginPage():void{
        View.config.loginPage!.innerHTML = '';
        let container = document.createElement("div");
        container.innerHTML = 
        `
        <p class="text-white">Welcome to Card Game!</p>
        <div class="my-2">
            <input type="text" placeholder="name" value="">
        </div>
        <div class="my-2">
            <select class="w-100">
                <option value="blackjack">Blackjack </option>
                <option value="poker">Poker </option>
            </select>
        </div>
        <div class="my-2">
            <button type="submit" class="btn btn-success" id="startGame">Start Game</button>
        <div>
        `
        View.config.loginPage!.append(container);
    }

    static disableBtnAfterFirstAction(){
        let surrenderBtn:HTMLElement = document.getElementById("surrenderBtn")!;
        let doubleBtn:HTMLElement = document.getElementById("doubleBtn")!;
        surrenderBtn.classList.add("disabled")
        doubleBtn.classList.add("disabled")
    }

    static renderTable(table:Table){
        View.config.mainPage!.innerHTML = '';
        let container = document.createElement("div");
        container.classList.add("col-12", "d-flex", "flex-column");
        container.innerHTML =
        `
            <div id="houesCardDiv" class="pt-5">
            </div>
    
            <!-- Players Div -->
            <div id="playersDiv" class="d-flex m-3 justify-content-center">
            </div><!-- end players -->  
            <!-- actionsAndBetsDiv -->
            <div id="actionsAndBetsDiv" class="d-flex pb-5 pt-4 d-flex flex-column align-items-center">
                <!-- betsDiv -->
                <div id="betsDiv" class="d-flex flex-column w-50 col-3">
                </div><!-- end betsDiv-->
            </div><!-- end actionsAndBetsDiv-->
            <div id="resultLogDiv" class="d-flex pb-5 pt-4 justify-content-center text-white overflow-auto" style="max-height: 120px;">
            </div>
        `
        View.config.mainPage!.append(container);
        View.renderHouseStatusPage(table);
        View.renderPlayerStatusPage(table);
        let isMask:boolean;
        if(table.getGamePhase != "betting") isMask = false;
        else isMask = true;
        View.renderCards(table, isMask);
    }

    static renderBetInfo(table:Table){
        let betDiv:HTMLElement = document.getElementById("betsDiv")!;
        let user:Player = table.getPlayers.filter((player) =>
            player.getType === "user")[0]
        betDiv.innerHTML += 
        ` 
        <p class="m-0 text-center text-white rem3">Bet: $${user.getBet}</p>
        <p class="m-0 text-center text-white rem2">Current Money: $${user.getChips}</p>
        `
    }

    static updatePlayerInfo(table:Table){
        console.log(table.getGamePhase)
        let houesCardDiv:HTMLElement = document.getElementById("houesCardDiv")!
        let playersDiv:HTMLElement = document.getElementById("playersDiv")!;
        houesCardDiv.innerHTML = '';
        playersDiv.innerHTML = '';
        View.renderHouseStatusPage(table)
        View.renderPlayerStatusPage(table) 
    }

    static renderBetBtn(table:Table){
        let betsDiv:HTMLElement = document.getElementById("betsDiv")!;

        let betBtnDiv = document.createElement("div");
        let colerHash = {
            5 : "btn-danger",
            20 : "btn-primary",
            50 : "btn-success",
            100 : "btn-dark"
        } 
        betBtnDiv.classList.add("py-2", "h-60", "d-flex", "justify-content-between");
        for(let i = 0; i < table.getBetDenominations.length; i++){
            let bet = table.getBetDenominations[i]
            betBtnDiv.innerHTML +=
            `
            <div>
                <div class="input-group" >
                    <span class="input-group-btn">
                        <button type="button" class="btn ${colerHash[bet]} rounded-circle p-0 btn-lg" style="width:3rem;height:3rem;" id="betValue" value=${bet}>${bet}</button>
                    </span>
                </div>
            </div>
            `
        }

        let dealResetDiv = document.createElement("div");
        dealResetDiv.classList.add("d-flex", "justify-content-between", "m-2")
        dealResetDiv.innerHTML =
        `            
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="deal">DEAL</button>
        <button type="button" class="w-30 rem5 text-center btn btn-primary" id="reset">RESET</button>
        <button type="submit" class="w-30 rem5 text-center btn btn-primary" id="allIn">ALL IN</button>
        `
        betsDiv.append(betBtnDiv, dealResetDiv);

        //10月27日queryselectorに苦戦
        let selectors = betsDiv.querySelectorAll<HTMLInputElement>("#betValue");
        let user = table.getPlayers.filter((player)=>player.getType === "user")[0];

        selectors.forEach((selector) => {
            selector.addEventListener("click", function(){
                Controller.clickBetBtn(parseInt(selector.value), user);
                View.updateBetInfo(table);
                View.renderBetBtn(table);
            })
        })

        let deal:Element = betsDiv.querySelectorAll("#deal")[0];
        deal.addEventListener("click", function(){
            if(user.getBet < 5) alert("Minimum bet is $" + "5" + '.')
            else{
                user.setChips = user.getChips + user.getBet;
                Controller.controlTable(table, "");
            }
        })

        let reset:Element = betsDiv.querySelectorAll("#reset")[0];
        reset.addEventListener("click", function(){
            user.resetPlayerBet();
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })

        let allIn:Element = betsDiv.querySelectorAll("#allIn")[0];
        allIn.addEventListener("click", function(){
            let allBet = user.getChips;
            user.playerAllin(allBet);
            View.updateBetInfo(table);
            View.renderBetBtn(table);
        })
    }
    //動作確認済み
    static renderHouseStatusPage(table:Table):void{
        let houesCardDiv:HTMLElement = document.getElementById("houesCardDiv")!;
        houesCardDiv.innerHTML = '';
        let houseCardsDiv = table.getHouse.getName + "CardsDiv"
        houesCardDiv.innerHTML +=
        `
        <p class="m-0 text-center text-white rem3">${table.getHouse.getName}</p>
        <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
            <p class="rem1 text-left">Status:${table.getHouse.getGameStatus}&nbsp</a>
        </div>
            <!-- House Card Row -->
        <div id=${houseCardsDiv} class="d-flex justify-content-center pt-3 pb-2">   
        </div>
        `
    }

    static renderPlayerStatusPage(table:Table){
        let playersDiv:HTMLElement = document.getElementById("playersDiv")!;
        playersDiv.innerHTML = '';
        let allPlayers:Player[] = table.getPlayers;
        allPlayers.forEach((player) => {
            let playerDiv:string = player.getName + "PlayerDiv";
            let cardsDiv = player.getName + "CardsDiv";
            playersDiv.innerHTML +=
            `
            <div id=${playerDiv} class="d-flex flex-column w-50">
                <p class="m-0 text-white text-center rem3">${player.getName}</p>
    
                <!-- playerInfoDiv -->
                <div class="text-white d-flex m-0 p-0 flex-column justify-content-center align-items-center">
                    <p class="rem1 text-left">Status:${player.getGameStatus}&nbsp</a>
                    <p class="rem1 text-left">Bet:${player.getBet}&nbsp</a>
                    <p class="rem1 text-left">Chips:${player.getChips}&nbsp</a>
                </div>
    
                <!-- cardsDiv -->
                <div id=${cardsDiv} class="d-flex justify-content-center">
                </div><!-- end Cards -->
            </div><!-- end player -->        
            `       
        })
    }

    static renderCardDiv(card:Card, ele:string, isMask:boolean){
        let targetElement:HTMLElement = document.getElementById(ele)!;
        let suit:string = isMask ? "?" : card.getSuit;
        let rank:string = isMask ? "?" : card.getRank;

        targetElement.innerHTML +=
        `
        <div class="bg-white border rounded mx-2">
            <div class="text-center">
                <img src=${View.config.suitImgURL[suit]} alt="" width="50" height="50">
            </div>
            <div class="text-center">
                <p class="m-0 ">${rank}</p>
            </div>
        </div>
        `
    }

    static renderCards(table:Table, flag:boolean){
        let allPlayers:Player[] = table.getPlayers;
        let house = table.getHouse;
        let houseCardsDiv:string = house.getName + "CardsDiv"
        let houseCards:Card[] = house.getHand
        if(house.getGameStatus === "Waiting for actions"){
            View.renderCardDiv(houseCards[0], houseCardsDiv, false);
            View.renderCardDiv(houseCards[1], houseCardsDiv, true);
        }
        else{
            houseCards.forEach(card=>{View.renderCardDiv(card, houseCardsDiv, flag)});
        }
        allPlayers.forEach((player) => {
            player.getHand.forEach((card) => {
                View.renderCardDiv(card, player.getName + "CardsDiv", flag);
            })
        })
    } 

    static updateBetInfo(table:Table):void{
        let betBtnDiv:HTMLElement = document.getElementById("betsDiv")!;
        betBtnDiv.innerHTML = "";
        View.renderBetInfo(table);
    }

    static updateActionBetInfo(table:Table, player:Player){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML = '';
        View.renderActionBtn(table, player);
    }

    static renderActionBtn(table:Table, player:Player){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML =
        `
        <div id ="actionsDiv" class="d-flex flex-wrap w-70 p-3 justify-content-center">
            <div class="py-2 mx-2">
                <a class="text-dark btn btn-light px-5 py-1" id="surrenderBtn">Surrender</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-success px-5 py-1" id="standBtn">Stand</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-warning px-5 py-1" id="hitBtn">Hit</a>
            </div>
            <div class="py-2 mx-2">
                <a class="btn btn-danger px-5 py-1" id="doubleBtn">Double</a>
            </div>            
        </div>
        `
        let actionList = ["surrender", "stand", "hit", "double"]
        actionList.forEach(function(action){
            let actionBtn:HTMLElement = document.getElementById(action + "Btn")!;
            actionBtn.addEventListener("click", function(){
                table.haveTurn(action);
                Controller.controlTable(table, action);
            })
        })
    }

    static createNextGameBtnDiv():HTMLElement{
        let div:HTMLElement = document.createElement("div");
        let nextGame = document.createElement("a");
        div.classList.add("d-flex", "flex-column", "justify-content-center", "align-items-center", "col-5");
        nextGame.classList.add("text-white", "btn", "btn-primary", "px-5", "py-1")
        nextGame.id = "nextGame";
        nextGame.innerText = `Next Game`;
        div.append(nextGame);
        return div;
    }

    static renderResult(table:Table){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        let userData = table.getPlayers.filter(user=>user.getType == "user");
        let gameResult = userData[0].getGameResult.toUpperCase();
        let div = View.createNextGameBtnDiv();

        actionsAndBetsDiv.innerHTML = '';

        let p = document.createElement("p");
        p.classList.add("m-0", "text-white", "text-center", "rem3");
        p.innerText = `${gameResult}`
        div.append(p);
        actionsAndBetsDiv.append(div);
        
        let nextGameBtn:Element = actionsAndBetsDiv.querySelectorAll("#nextGame")![0];
        nextGameBtn.addEventListener("click", function(){
            table.haveTurn(table)
            table.blackjackAssignPlayerHands();
            Controller.controlTable(table,"");
        })
    }

    static renderLogResult(table:Table){
        let resultLogDiv:HTMLElement = document.getElementById("resultLogDiv")!;
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        div.innerHTML +=
        `
        <p>rounnd ${table.getResultLog.length + 1}</p>
        `
        div.append(table.blackjackEvaluateAndGetRoundResults());
        resultLogDiv.append(div);
    }

    static renderAllLog(table:Table){
        let resultLogDiv:HTMLElement = document.getElementById("resultLogDiv")!;
        let div = document.createElement("div");
        div.classList.add("text-white", "w-50");
        for(let i = 0; i < table.getResultLog.length; i++){
            div.innerHTML +=
            `
            <p>rounnd ${i + 1}</p>
            `
            div.append(table.getResultLog[i]);
        }
        resultLogDiv.append(div);        
    }

    static renderGameOver(){
        let actionsAndBetsDiv:HTMLElement = document.getElementById("actionsAndBetsDiv")!;
        actionsAndBetsDiv.innerHTML +=

        `
        <div class="d-flex flex-column justify-content-center align-items-center col-5">
            <p class="m-0 text-white text-center rem3">GAME OVER</p>
        </div>
        <div class="d-flex justify-content-around m-2 col-2">
            <button type="submit" class="text-white btn btn-primary w-30 rem5" id="newGame">New Game</button>
        </div>
        `
        let newGameBtn = actionsAndBetsDiv.querySelectorAll("#newGame")[0];
        newGameBtn.addEventListener("click", function(){
            View.displayNone(View.config.mainPage);
            View.displayBlock(View.config.loginPage);    
            Controller.startGame();
        });
    }
}


Controller.startGame();