moduleLibrary.define('Carrot.Model', gamecore.Pooled.extend('CarrotModel', {
  create: function(x, y, maturity, maturityCounter) {
    var carrotModel;
    if (maturityCounter == null) {
      maturityCounter = 20;
    }
    carrotModel = this._super();
    carrotModel.x = x;
    carrotModel.y = y;
    carrotModel.marked = false;
    carrotModel.maturity = maturity;
    carrotModel.maturityCounter = maturityCounter;
    carrotModel.minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][carrotModel.maturity];
    return carrotModel;
  }
}, {
  tick: function() {
    if (this.maturity === 3) {
      return;
    }
    this.maturityCounter -= 1;
    this.minimapColor = ['#b5e565', '#8dd862', '#65cc60', '#3dbf5d'][this.maturity];
    if (this.maturityCounter < 0) {
      this.maturityCounter = 20;
      return this.maturity += 1;
    }
  },
  dispose: function() {
    return this.release();
  }
}));
