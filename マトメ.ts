class Card{
    private suit: string;
    private rank: string;

    constructor(suit:string, rank:string){
        this.suit = suit;
        this.rank = rank;
    }

    public get getSuit():string{
        return this.suit;
    }

    public get getRank():string{
        return this.rank;
    }

    public get getRankNumberBlackjack():number{
        if(this.rank === "A") return 11;
        else if(this.rank === "J" || this.rank === "Q" || this.rank === "K"){
            return 10;
        }
        else return parseInt(this.rank);
    }
}

class Deck{
    //NOTE:10/15 never型の理解で苦戦
    private gameType:string;
    private cards:Card[] = Array();
    static readonly suits = ["H", "D", "C", "S"];
    static readonly ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    constructor(gameType:string){
        this.gameType = gameType;

        this.cards = this.gameType === "BlakJack" ? Deck.generateBlackJackDeck() : Array();
        this.shuffle();
    }
    private static generateBlackJackDeck():Card[]{
        let cards = Array();

        for (let suit in Deck.suits){
            for (let rank in Deck.ranks){
                cards.push(new Card(suit, rank));
            }
        }
        return cards;
    }
    public drawOne():Card{
        return this.cards.pop() as Card;
    }
    public shuffle():void{
        for(let i = 0;i < this.cards.length;i++){
            let j = Math.floor(Math.random() * (i + 1));
            let temp = this.cards[i];
            this.cards[i] = this.cards[j];
            this.cards[j] = temp;
        }
    }
}

class Player{
    private name:string;
    private type:string;
    private gameType:string;
    private hand:Card[];
    private split:string;
    private chips:number;
    private bet:number;
    private winAmount:number;
    private gameStatus:string;

    constructor(name:string, type:string, gameType:string, chips:number = 400){
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

    //getter
    public get getName():string{
        return this.name;
    }
    public get getType():string{
        return this.type;
    }
    public get getGameType():string{
        return this.gameType;
    }
    public get getChips():number{
        return this.chips;
    }
    public get getHand():Card[]{
        return this.hand;
    }
    public get getSplit():string{
        return this.split;
    }
    public get getBet():number{
        return this.bet;
    }
    public get getWinAmount():number{
        return this.winAmount;
    }
    public get getGameStatus():string{
        return this.gameStatus;
    }
    public get getHandScore():number{
        let handScore:number = 0;

        for (let i = 0; i < this.hand.length; i++){
            handScore += this.hand[i].getRankNumberBlackjack;
            if (handScore - 11 > 21 && this.hand[i].getRank === "A") handScore -= 10;
        }
        return handScore;
    }

    //setter
    public set setBet(bet:number){
        this.bet = bet;
    }
    public set setWinAmount(winAmount:number){
        this.winAmount = winAmount;
    }
    public set setChips(chips:number){
        this.chips += chips;
    }
    public set setGameStatus(gameStatus:string){
        this.gameStatus = gameStatus;
    }
}
interface HouseAction{
    houseTactics():GameDecision;
}
interface AIAction{
    aiTactics(HouseHand:number, AIHand:number):GameDecision;
}
class PlayerAction extends Player implements HouseAction, AIAction{
    private basicStrategy_HardHand:string[][] = Array();
    private basicStrategy_Split:string[][] = Array();
    super(){
        this.basicStrategy_HardHand = [
            ["hit","double","double","double","double","hit","hit","hit","hit","hit"],
            ["double","double","double","double","double","double","double","double","hit","hit"],
            ["double","double","double","double","double","double","double","double","double","hit"],
            ["hit","hit","stand","stand","stand","hit","hit","hit","hit","hit"],
            ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
            ["stand","stand","stand","stand","stand","hit","hit","hit","hit","hit"],
            ["stand","stand","stand","stand","stand","hit","hit","hit","surrender","hit"],
            ["stand","stand","stand","stand","stand","hit","hit","surrender","surrender","surrender"]
        ]
    }
    public houseTactics(): GameDecision {
      const betDenominations:number[] = [5, 20, 50, 100];
      let betDenominationCount:number = PlayerAction.getRandomInteger(1, 4);
      let betIndex:number = PlayerAction.getRandomInteger(0, 3);
      let bet:number = 0;

      if(this.getGameStatus === "betting"){
        for(let i = betDenominationCount; i > 0;i--){
          bet += betDenominations[betIndex];
        }
        return new GameDecision("bet", bet);
      }
      else{
        if(this.getHandScore < 15){
            return new GameDecision("hit", this.getBet);
        }
        else{
          return new GameDecision("stand", this.getBet);
        }
      }
    }

    public aiTactics(HouseHand:number, AIHand:number): GameDecision {

        const betDenominations:number[] = [5, 20, 50, 100];
        let betDenominationCount:number = PlayerAction.getRandomInteger(1, 4);
        let betIndex:number = PlayerAction.getRandomInteger(0, 3);
        let bet:number = 0;
  
        if(this.getGameStatus === "betting"){
          for(let i = betDenominationCount; i > 0;i--){
            bet += betDenominations[betIndex];
          }
          return new GameDecision("bet", bet);
        }
        else{
            if (HouseHand <= 7) return new GameDecision("hit",this.getBet)
            else if (HouseHand >= 16) return new GameDecision("stand",this.getBet)
            else return new GameDecision(this.basicStrategy_HardHand[HouseHand+1][AIHand+1],this.getBet)
        }   
    }

    public promptPlayerBlackJack(userData:string | number | null):GameDecision{
        if (this.getType === "ai" || this.getType === null) this.aiTactics;
        if (this.getType === "house") this.houseTactics;
        if (this.getGameStatus === "betting") return new GameDecision("bet", userData as number)
        else return new GameDecision(userData as string, this.getBet);
    }

    private static getRandomInteger(min: number, max: number): number{
        return Math.floor(Math.random() * (max + 1 - min)) + min;
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
}

class Table{
    private gameType:string;
    private betDenominations:number[];
    private deck:Deck;
    private players:Player[] = Array();
    private house:Player;
    private gamePhase = "betting";
    private resultLog:string[];
    private turnCounter:number;
    private roundConuter:number;

    constructor(gameType:string, betDenominations:number[] = [5, 20, 50, 100]){
        this.gameType = gameType;
        this.betDenominations = betDenominations;
        this.deck = new Deck(this.gameType);
        this.house = new Player("house", "house", this.gameType);
        this.resultLog = [];
        this.turnCounter = 0;
        this.roundConuter = 0;
    }

    public get getHouse():Player{
        return this.house;
    }


}
let House = new Player("house","house","BlakJack");
console.log(House)