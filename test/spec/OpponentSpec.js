var opponent = new (require('../../game/battleships/Opponent'))();
var customMatchers = require('../customMatchers');
var _ = require('lodash');

describe('BoardUtils', function () {
  var boardUtils = require('../../game/BoardUtils');
  it('finds adjacent positions', function() {
    boardUtils.boardSize = 10;

    var adjacent = boardUtils.getAdjacentCells([{x:5, y:0}], true);

    expect(adjacent).toContain({x:4, y:0});
    expect(adjacent).toContain({x:6, y:0});
    expect(adjacent).toContain({x:5, y:1});
  });
});

describe('Opponent', function () {

  var cfg = {boardSize: 10};
  opponent.init(cfg);

  it('shoots at a position', function () {
    var board = {
      inactive: [],
      hitCells: [],
      smallestShipLeft: 4
    };
    var shot = opponent.shoot(board);

    expect(shot).toBeTruthy();
    expect(shot.x).toBeGreaterThan(-1);
    expect(shot.x).toBeLessThan(cfg.boardSize);
    expect(shot.y).toBeGreaterThan(-1);
    expect(shot.y).toBeLessThan(cfg.boardSize);
  });

  it('throws an Error when the boardState is not given', function () {
    expect(function () {
      opponent.shoot(null)
    }).toThrow("boardState is Empty");
  });

  it('shoots at different positions', function () {
    var board = {
      inactive: [],
      hitCells: [{x: 1, y: 1}],
      smallestShipLeft: 4
    };
    board.inactive.push(opponent.shoot(board));
    board.inactive.push(opponent.shoot(board));
    board.inactive.push(opponent.shoot(board));

    expect(board.inactive[0]).not.toEqual(board.inactive[1]);
    expect(board.inactive[0]).not.toEqual(board.inactive[2]);
    expect(board.inactive[1]).not.toEqual(board.inactive[2]);
  });

  it('shoots on adjacent cell of a hit ship', function () {
    var board = {
      inactive: [{x: 5, y: 5}, {x: 5, y: 7}, {x: 4, y: 6}],
      hitCells: [{x: 5, y: 6}],
      smallestShipLeft: 4
    };
    expect([{x: 6, y: 6}]).toContain(opponent.shoot(board));
  });

  it('shoots along the hit ship', function () {
    var board = {
      inactive: [{x: 5, y: 5}, {x: 1, y: 0}, {x: 1, y: 1}],
      hitCells: [{x: 1, y: 0}, {x: 1, y: 1}],
      smallestShipLeft: 1
    };
    expect(opponent.shoot(board)).toEqual({x: 1, y: 2});
  });

  it('finds a position where a ship can be hit', function () {
    opponent.init({boardSize: 5});
    var board = {
      inactive: [
        {x: 1, y: 0}, {x: 1, y: 1}, {x: 1, y: 2}, {x: 1, y: 3},
        {x: 0, y: 1}, {x: 1, y: 1}, {x: 2, y: 1}, {x: 3, y: 1}, {x: 4, y: 1}
      ],
      hitCells: [{x: 4, y: 4}],
      smallestShipLeft: 4
    };

    var pos = opponent.shoot(board);
    expect([{x: 0, y: 4}, {x: 1, y: 4}, {x: 2, y: 4}, {x: 3, y: 4}, {x: 4, y: 4}]).toContain(pos);
    console.log(pos);
  });

  it('places ships', function () {
    var config = {
      boardSize: 10,
      ships: [
        {name: 'Battleship', size: 4, count: 1},
        {name: 'Submarine', size: 3, count: 2},
        {name: 'Cruiser', size: 2, count: 2},
        {name: 'Destroyer', size: 1, count: 2}
      ]
    };

    var placement = opponent.placeShips(config);
    expect(placement).toBeTruthy();
    expect(placement.length).toEqual(7);

    //console.log(placement)
  });

  it('updates game state', function () {
    opponent.init({
      boardSize: 10,
      ships: [
        {name: 'Battleship', size: 4, count: 1},
        {name: 'Submarine', size: 3, count: 2},
        {name: 'Cruiser', size: 2, count: 2},
        {name: 'Destroyer', size: 1, count: 2}
      ]
    });
    var board = {
      inactive: [],
      hitCells: [],
      smallestShipLeft: 4
    };

    var shot = {
      shipWasHit: true,
      shipWasDestroyed: false,
      position: {x: 0, y: 0}
    };
    board = opponent.updateGameState(board, shot);
    expect(board.inactive).toContain({x: 0, y: 0});
    expect(board.hitCells).toContain({x: 0, y: 0});

    var shot = {
      shipWasHit: true,
      shipWasDestroyed: true,
      ship: {positions: [{x: 0, y: 0}, {x: 0, y: 1}]},
      position: {x: 0, y: 1}
    };
    board = opponent.updateGameState(board, shot);
    expect(board.inactive.length).toEqual(6);
    expect(board.hitCells.length).toEqual(0);
  });

});

