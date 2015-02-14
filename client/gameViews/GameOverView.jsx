var React = require('react')
  , Actions = require('../actions');

var GameOverView = React.createClass({

  render() {
    var {props} = this;
    return (
      <div className="game-over">
        <p>Game over!</p>
        <p className={props.hasWon ? "win" : "lose"}>{props.hasWon ? "You win!" : "You lose!"}</p>
        <button type="button" className="btn btn-primary" onClick={Actions.game.quit}>
          Play again!
        </button>
      </div>);
  }
});

module.exports = GameOverView;
