// グローバルに展開
phina.globalize();
/*
 * 定数
 */
var BLOCK_WIDTH = 40 * 2;
var BLOCK_HEIGHT = 60 / 2;
var PADDLE_WIDTH = BLOCK_WIDTH * 1.5;
var PADDLE_HEIGHT = BLOCK_HEIGHT;

var BALL_RADIUS = BLOCK_WIDTH / 8;
/*
 * メインシーン
 */
phina.define("MainScene", {
  // 継承
  superClass: 'DisplayScene',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit();
    // 背景色
    this.backgroundColor = 'black';
    // 位置判定用のRect
    var screenRect = Rect(0, 0, 640, 960);

    var self = this;
    // パドル移動ライン
    var paddleY = this.gridY.span(14.5);
    // パドル設置
    var paddle = Paddle().addChildTo(this)
      .setPosition(this.gridX.center(), paddleY);
    // 画面上でのタッチ移動時
    this.onpointmove = function (e) {
      // タッチ位置に移動
      paddle.setPosition(e.pointer.x, paddleY);
      // 画面はみ出し防止
      if (paddle.left < screenRect.left) { paddle.left = screenRect.left; }
      if (paddle.right > screenRect.right) { paddle.right = screenRect.right; }
    };
    // 画面上でタッチが離れた時
    this.onpointend = function () {
      if (self.status === 'ready') {
        // ボール発射
        self.ball.vy = -self.ball.speed;
        if (Random.randint(0, 1) === 1) {
          self.ball.vx = self.ball.speed;
        }
        else {
          self.ball.vx = -self.ball.speed;
        }
        self.status = 'move';
      }
    };
    // ボール作成
    this.ball = Ball().addChildTo(this);
    // シーン全体から参照可能にする
    this.paddle = paddle;
    this.screenRect = screenRect;
    // ゲーム状態
    this.status = 'ready';
  },
  // 毎フレーム更新
  update: function () {
    var ball = this.ball;
    var paddle = this.paddle;
    var screenRect = this.screenRect;
    // ボール待機中
    if (this.status === 'ready') {
      // ボールはパドルの真上
      ball.vx = ball.vy = 0;
      ball.x = paddle.x;
      ball.bottom = paddle.top;
    }
    // ボール移動中
    if (this.status === 'move') {
      // ボール移動
      ball.moveBy(ball.vx, ball.vy);
      // 画面端反射
      // 上
      if (ball.top < screenRect.top) {
        ball.top = screenRect.top;
        ball.vy = -ball.vy;
      }
      // 左
      if (ball.left < screenRect.left) {
        ball.left = screenRect.left;
        ball.vx = -ball.vx;
      }
      // 右
      if (ball.right > screenRect.right) {
        ball.right = screenRect.right;
        ball.vx = -ball.vx;
      }
      // 落下
      if (ball.top > screenRect.bottom) {
        // 準備状態へ
        this.status = 'ready';
      }
      // パドルとの反射
      if (ball.hitTestElement(paddle) && ball.vy > 0) {
        ball.bottom = paddle.top;
        ball.vy = -ball.vy;
        // 当たった位置で角度を変化させる
        var dx = paddle.x - ball.x;
        ball.vx = -dx / 5;
      }
    }
  },
});
/*
 * パドルクラス
 */
phina.define('Paddle', {
  // 親クラス指定
  superClass: 'RectangleShape',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit({
      width: PADDLE_WIDTH,
      height: PADDLE_HEIGHT,
      fill: 'silver',
    });
  },
});
/*
 * ボールクラス
 */
phina.define('Ball', {
  // 親クラス指定
  superClass: 'CircleShape',
  // コンストラクタ
  init: function () {
    // 親クラス初期化
    this.superInit({
      radius: BALL_RADIUS,
      fill: 'silver',
    });
    // スピード
    this.speed = 6;
  },
});
/*
 * メイン処理
 */
phina.main(function () {
  // アプリケーションを生成
  var app = GameApp({
    title: 'Break Out',
  });
  // fps変更
  app.fps = 60;
  // 実行
  // 実行
  app.run();
});