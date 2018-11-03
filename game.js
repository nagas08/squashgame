phina.globalize();
// 定数
var SCREEN_WIDTH = 640;            // 画面横サイズ
var SCREEN_HEIGHT = 960;           // 画面縦サイズ
var GRID_SIZE = SCREEN_WIDTH / 4;  // グリッドのサイズ
var PIECE_SIZE = GRID_SIZE * 0.95; // ピースの大きさ
var PIECE_NUM_XY = 4;              // 縦横のピース数
var PIECE_OFFSET = GRID_SIZE / 2;  // オフセット値
// メインシーン
phina.define('MainScene', {
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function() {
    // 親クラス初期化
    this.superInit();
    // 背景色
    this.backgroundColor = 'gray';
    // グリッド
    var grid = Grid(SCREEN_WIDTH, PIECE_NUM_XY);
    // ピースグループ
    var pieceGroup = DisplayElement().addChildTo(this);
    var self = this;
    // ピース配置
    PIECE_NUM_XY.times(function(spanX) {
      PIECE_NUM_XY.times(function(spanY) {
        // 番号
        var num = spanY * PIECE_NUM_XY + spanX + 1;
        // ピース作成
        var piece = Piece(num).addChildTo(pieceGroup);
        // Gridを利用して配置
        piece.x = grid.span(spanX) + PIECE_OFFSET;
        piece.y = grid.span(spanY) + PIECE_OFFSET;
        // タッチを有効にする
        piece.setInteractive(true);
        // タッチされた時の処理
        piece.onpointend = function() {
          // ピース移動処理
          self.movePiece(this);
        };
        // 16番のピースは非表示
        if (num === 16) piece.hide();
      });
    });
    // シャッフルボタン
    var shuffleButton = Button({
      text: 'SHUFFLE',
    }).addChildTo(this).setPosition(this.gridX.center(), this.gridY.span(13));
    // ボタンプッシュ時処理
    shuffleButton.onpush = function() {
      // ピースをシャッフル
      (100).times(function() {
        self.shufflePieces();  
      });
    };
    // 参照用
    this.pieceGroup = pieceGroup;
    this.shuffleButton = shuffleButton;
  },
  // 16番ピース（空白）を取得
  getBlankPiece: function() {
    var result = null;
    this.pieceGroup.children.some(function(piece) {
      // 16番ピースを結果に格納
      if (piece.num === 16) {
        result = piece;
        return true;
      }
    });
    return result;
  },
  // ピースの移動処理
  movePiece: function(piece, isInstantly) {
    // 空白ピースを得る
    var blank = this.getBlankPiece();
    // 即入れ替え
    if (isInstantly) {
      var tmpX = piece.x;
      var tmpY = piece.y;
      piece.setPosition(blank.x, blank.y);
      blank.setPosition(tmpX, tmpY);
      return;
    }
    // x, yの座標差の絶対値
    var dx = Math.abs(piece.x - blank.x);
    var dy = Math.abs(piece.y - blank.y);
    // 隣り合わせの判定
    if ((piece.x === blank.x && dy === GRID_SIZE) || 
        (piece.y === blank.y && dx === GRID_SIZE)) {
      // タッチされたピース位置を記憶
      var touchX = piece.x;
      var touchY = piece.y;
      var self = this;
      // tweenerで移動処理
      piece.tweener.clear()
                   .to({x: blank.x, y: blank.y}, 200, "easeOutCubic")
                   .call(function() {
                     // 空白ピースをタッチされたピースの位置へ
                     blank.setPosition(touchX, touchY);
                   });
    }
  },
  // 指定の位置のピースを返す
  getPieceByXY: function(x, y) {
    var result = null;
    this.pieceGroup.children.some(function(piece) {
      // 指定した座標なら
      if (piece.x === x && piece.y === y) {
        result = piece;
        return true;
      }
    });
    return result;
  },
  // ピースをシャッフルする
  shufflePieces: function() {
    var self = this;
    // 隣接ピース格納用
    var pieces = [];
    // 空白ピースを得る
    var blank = this.getBlankPiece();
    // 上下左右隣りのピースがあれば配列に追加
    [1, 0, -1].each(function(i) {
      [1, 0, -1].each(function(j) {
        if (i != j) {
          var x = blank.x + i * GRID_SIZE;
          var y = blank.y + j * GRID_SIZE;
          var target = self.getPieceByXY(x, y);
          if (target) pieces.push(target);
        }
      });
    });
    // 隣接ピースからランダムに選択して空白ピースと入れ替える
    this.movePiece(pieces.random(), 'instantly');
    pieces.clear();
  },
});
// ピースクラス
phina.define('Piece', {
  // RectangleShapeを継承
  superClass: 'phina.display.RectangleShape',
    // コンストラクタ
    init: function(num) {
      // 親クラス初期化
      this.superInit({
        width: PIECE_SIZE,
        height: PIECE_SIZE,
        cornerRadius: 10,
        fill: 'silver',
        stroke: 'white',
      });
      // 数字
      this.num = num;
      // 数字表示用ラベル
      this.label = Label({
        text: this.num + '',
        fontSize: PIECE_SIZE * 0.8,
        fill: 'white',
      }).addChildTo(this);
    },
});
// メイン
phina.main(function() {
  var app = GameApp({
    startLabel: 'main',
  });
  app.run();
});
