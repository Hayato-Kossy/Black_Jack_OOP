// class Player{
//     private name:string;
//     private type:string;
//     private gameType:string;
//     private hand:Card[];
//     private chips:number;
//     private bet:number;
//     private winAmount:number;
//     private gameStatus:string;

//     constructor(name:string, type:string, gameType:string, chips:number = 400){
//         this.name = name;
//         this.type = type;
//         this.gameType = gameType;
//         this.hand = Array();
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
//         let total:number = 0;

//         for (let i = 0; i < this.hand.length; i++){
//             total += this.hand[i].getRankNumberBlackjack;
//             if (total - 11 > 21 && this.hand[i].getRank === "A") total -= 10;
//         }
//         return total;
//     }

//     //setter
//     public set setBet(bet:number){
//         this.bet = bet;
//     }
//     public set setWinAmount(winAmount:number){
//         this.winAmount = winAmount;
//     }
//     public set setChips(chips:number){
//         this.chips += chips;
//     }
//     public set setGameStatus(gameStatus:string){
//         this.gameStatus = gameStatus;
//     }

//     public promptPlayer(userData:string | number | null):GameDecision{
//         if (this.type === "house" || this.type === "ai" || this.type === null) return this.aiTactics
//         if (this.gameStatus === "betting") return new GameDecision("bet", userData as number)
//         else return new GameDecision(userData as string, this.bet);
//     }

//     public get aiTactics():GameDecision{
//         return new GameDecision("test", -Infinity)
//     }
// }

// class GameDecision{
//     private action:string;
//     private amount:number;

//     constructor(action:string, amount:number){
//         this.action = action;
//         this.amount = amount;
//     }
// }