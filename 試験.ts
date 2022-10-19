class Card{

    private _suit: string;
    private _rank: string;

    constructor(_suit: string, _rank: string){
        this._suit = _suit;
        this._rank = _rank;
    }

    
    public get suit() : string {
      return this._suit;
    }
    
    public get rank() : string {
      return this._rank;
    }
    
    

    public get get_rankNumber(): number{
      if(this._rank === "A")return 11;
      else if(this._rank === "J" || this._rank === "Q" || this._rank === "K")return 10;
      else return parseInt(this._rank);
    }
}
class Deck {
    private _gameType: string;
    private _cards: Card[] = [];
    static readonly suits = ["heart", "diamond", "clover", "spade"];
    static readonly ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
    
  
    constructor(_gameType: string){
      this._gameType = _gameType;
      
      this._cards = _gameType === "blackjack" ? Deck.initialBlackJack() : [];
    }
  
    private static initialBlackJack(): Card[]{
      let _cards = [];
      for(let suit of Deck.suits){
          for(let rank of Deck.ranks){
            let card = new Card(suit, rank);
            _cards.push(card);
          }
      }
      return _cards;
    }
  
    public shuffle(): void{
      for(let i = 0;i < this._cards.length;i++){
        let j = Math.floor(Math.random() * (i + 1));
        let temp = this._cards[i];
        this._cards[i] = this._cards[j];
        this._cards[j] = temp;
      }
    }
  
    public resetDeck(): void{
        if(this._gameType === "blackjack"){
          this._cards = Deck.initialBlackJack();
          this.shuffle();
        }
    }
  
    public drawOne(): Card{
      return this._cards.pop() as Card;
    }
  }