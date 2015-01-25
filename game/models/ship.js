function Ship(id, positions) {
    this.id = id;
    this.positions = positions;
    this.healthCount = positions.length; // number of undamaged ship parts; on "0" the ship was destroyed
}

module.exports = Ship;