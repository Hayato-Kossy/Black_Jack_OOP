class Card{
    private suit: string;
    private rank: string;

    constructor(suit:string, rank:string){
        this.suit = suit;
        this.rank = rank;
    }

    public getSuit():string{
        return this.suit;
    }

    public getRank():string{
        return this.rank;
    }

    public getRankNumberBlackjack():number{
        if(this.rank == "A") return 11;
        else if(this.rank == "J" || this.rank == "Q" || this.rank == "K"){
            return 10;
        }
        else return parseInt(this.rank);
    }
}

class Deck{
    //NOTE:10/15 never型の理解で苦戦
    private gameType:string;
    private cards:Card[] = [];
    static readonly suits = ["H", "D", "C", "S"];
    static readonly ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];

    constructor(gameType:string){
        this.gameType = gameType;

        this.cards = this.gameType === "BlakJack" ? Deck.generateBlackJackDeck() : Array();
    }
    public static generateBlackJackDeck():Card[]{
        let cards = Array();

        for (let suit in Deck.suits){
            for (let rank in Deck.ranks){
                cards.push(new Card(suit, rank));
            }
        }
        return cards;
    }


}