'use strict';
/* Engine.js
 * 这个文件提供了游戏循环玩耍的功能（更新敌人和渲染）
 * 在屏幕上画出出事的游戏面板，然后调用玩家和敌人对象的 update / render 函数（在 app.js 中定义的）
 *
 * 一个游戏引擎的工作过程就是不停的绘制整个游戏屏幕，和小时候你们做的 flipbook 有点像。当
 * 玩家在屏幕上移动的时候，看上去就是图片在移动或者被重绘。但这都是表面现象。实际上是整个屏幕
 * 被重绘导致这样的动画产生的假象

 * 这个引擎是可以通过 Engine 变量公开访问的，而且它也让 canvas context (ctx) 对象也可以
 * 公开访问，以此使编写app.js的时候更加容易
 */

var Engine = (function(global) {
	/* 实现定义我们会在这个作用于用到的变量
	 * 创建 canvas 元素，拿到对应的 2D 上下文
	 * 设置 canvas 元素的高/宽 然后添加到dom中
	 */
	var doc = global.document,
		win = global.window,
		canvas = doc.createElement('canvas'),
		ctx = canvas.getContext('2d'),
		lastTime;
	window.playAgain = false;

	canvas.width = 505;
	canvas.height = 606;
	doc.body.appendChild(canvas);

	/* 这个函数是整个游戏的主入口，负责适当的调用 update / render 函数 */
	function main() {
		/* 如果你想要更平滑的动画过度就需要获取时间间隙。因为每个人的电脑处理指令的
		 * 速度是不一样的，我们需要一个对每个人都一样的常数（而不管他们的电脑有多快）
		 * 就问你屌不屌！
		 */
		var now = Date.now(),
			dt = (now - lastTime) / 1000.0;

		/* 调用我们的 update / render 函数， 传递事件间隙给 update 函数因为这样
		 * 可以使动画更加顺畅。
		 */
		// update(dt);
		let end = update(dt);
		render();
		if(end) {
			return reset(end);
		}

		/* 设置我们的 lastTime 变量，它会被用来决定 main 函数下次被调用的事件。 */
		lastTime = now;

		/* 在浏览准备好调用重绘下一个帧的时候，用浏览器的 requestAnimationFrame 函数
		 * 来调用这个函数
		 */
		win.requestAnimationFrame(main);
	}

	/* 这个函数调用一些初始化工作，特别是设置游戏必须的 lastTime 变量，这些工作只用
	 * 做一次就够了
	 */
	function init() {
		canvas.addEventListener('mousemove', function(e) {
			if(window.playAgain) {
				let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
				ctx.font = 'bolder 24pt Digifit';
				ctx.lineWidth = 2;
				if(192 < e.offsetX && e.offsetX < 404 && 343 < e.offsetY && e.offsetY < 394) {
					canvas.style.cursor = 'pointer';
					drawPlayAgain('orange', 'yellow');
				} else {
					canvas.style.cursor = '';
					drawPlayAgain('gray','white');
				}
				ctx.fillText('Play Again', canvas.width / 2 + 48, canvas.height / 2 + 72);
				ctx.strokeText('Play Again', canvas.width / 2 + 48, canvas.height / 2 + 72);
			}
		});
		canvas.addEventListener('mouseup', function(e) {
			if(window.playAgain && canvas.style.cursor === 'pointer') {
				window.playAgain = false;
				canvas.style.cursor = '';
				canvas.width = canvas.width;
				player.x = 202;
				player.y = 395;
				player.HP = 3;
				lastTime = Date.now();
				main();
			}
		});
		reset();
		lastTime = Date.now();
		main();
	}

	function drawPlayAgain(fillStyle, strokeStyle) {
		ctx.font = 'bolder 24pt Digifit';
		ctx.lineWidth = 2;
		ctx.fillStyle = fillStyle;
		ctx.strokeStyle = strokeStyle;
		ctx.fillText('Play Again', canvas.width / 2 + 48, canvas.height / 2 + 72);
		ctx.strokeText('Play Again', canvas.width / 2 + 48, canvas.height / 2 + 72);
	}

	/* 这个函数被 main 函数（我们的游戏主循环）调用，它本身调用所有的需要更新游戏角色
	 * 数据的函数，取决于你怎样实现碰撞检测（意思是如何检测两个角色占据了同一个位置，
	 * 比如你的角色死的时候），你可能需要在这里调用一个额外的函数。现在我们已经把这里
	 * 注释了，你可以在这里实现，也可以在 app.js 对应的角色类里面实现。
	 */
	function update(dt) {
		let isWin = updateEntities(dt);
		if(isWin) {
			return 'win';
		}
		// checkCollisions();
		return allEnemies.some(enemy => enemy.y === player.y && Math.abs(enemy.x - player.x) < 81);
	}

	/* 这个函数会遍历在 app.js 定义的存放所有敌人实例的数组，并且调用他们的 update()
	 * 函数，然后，它会调用玩家对象的 update 方法，最后这个函数被 update 函数调用。
	 * 这些更新函数应该只聚焦于更新和对象相关的数据/属性。把重绘的工作交给 render 函数。
	 */
	function updateEntities(dt) {
		allEnemies.forEach(function(enemy) {
			enemy.update(dt);
		});
		return player.update();
	}

	/* 这个函数做了一些游戏的初始渲染，然后调用 renderEntities 函数。记住，这个函数
	 * 在每个游戏的时间间隙都会被调用一次（或者说游戏引擎的每个循环），因为这就是游戏
	 * 怎么工作的，他们就像是那种每一页上都画着不同画儿的书，快速翻动的时候就会出现是
	 * 动画的幻觉，但是实际上，他们只是不停的在重绘整个屏幕。
	 */
	function render() {
		/* 这个数组保存着游戏关卡的特有的行对应的图片相对路径。 */
		var rowImages = [
				'images/water-block.png', // 这一行是河。
				'images/stone-block.png', // 第一行石头
				'images/stone-block.png', // 第二行石头
				'images/stone-block.png', // 第三行石头
				'images/grass-block.png', // 第一行草地
				'images/grass-block.png' // 第二行草地
			],
			numRows = 6,
			numCols = 5,
			row, col;

		/* 便利我们上面定义的行和列，用 rowImages 数组，在各自的各个位置绘制正确的图片 */
		for(row = 0; row < numRows; row++) {
			for(col = 0; col < numCols; col++) {
				/* 这个 canvas 上下文的 drawImage 函数需要三个参数，第一个是需要绘制的图片
				 * 第二个和第三个分别是起始点的x和y坐标。我们用我们事先写好的资源管理工具来获取
				 * 我们需要的图片，这样我们可以享受缓存图片的好处，因为我们会反复的用到这些图片
				 */
				ctx.drawImage(Resources.get(rowImages[row]), col * 101, row * 83);
			}
		}

		renderEntities();
	}

	/* 这个函数会在每个时间间隙被 render 函数调用。他的目的是分别调用你在 enemy 和 player
	 * 对象中定义的 render 方法。
	 */
	function renderEntities() {
		/* 遍历在 allEnemies 数组中存放的作于对象然后调用你事先定义的 render 函数 */
		allEnemies.forEach(function(enemy) {
			enemy.render();
		});

		player.render();
	}

	/* 这个函数现在没干任何事，但是这会是一个好地方让你来处理游戏重置的逻辑。可能是一个
	 * 从新开始游戏的按钮，也可以是一个游戏结束的画面，或者其它类似的设计。它只会被 init()
	 * 函数调用一次。
	 */
	function reset(end) {
		// 空操作
		let img = ctx.getImageData(0, 0, canvas.width, canvas.height);
		let imgData = img.data;
		if(end === 'win') {
			window.playAgain = true;
			for(let i = imgData.length / 4 - 1; 0 <= i; i--) {
				if(imgData[i * 4] + imgData[i * 4 + 1] + imgData[i * 4 + 2] !== 0) {
					imgData[i * 4 + 3] = 127;
				}
			}
			ctx.putImageData(img, 0, 0);
			ctx.fillStyle = 'white';
			ctx.font = '72pt Impact';
			ctx.textAlign = 'center';
			ctx.fillText('You Win!', canvas.width / 2, canvas.height / 2);
			ctx.strokeStyle = 'black';
			ctx.lineWidth = 3;
			ctx.strokeText('You Win!', canvas.width / 2, canvas.height / 2);
			drawPlayAgain('gray','white');
		} else if(end) {
			player.HP--;
			let r, g, b;
			for(let i = imgData.length / 4 - 1; 0 <= i; i--) {
				let gray = (imgData[i * 4 + 0] + imgData[i * 4 + 1] + imgData[i * 4 + 2]) / 3;
				imgData[i * 4] = gray;
				imgData[i * 4 + 1] = gray;
				imgData[i * 4 + 2] = gray;
			}
			ctx.putImageData(img, 0, 0);
			if(player.HP === 0) {
				window.playAgain = true;
				ctx.font = '72pt Impact';
				ctx.textAlign = 'center';
				ctx.fillStyle = 'white';
				ctx.fillText('Game Over!', canvas.width / 2, canvas.height / 2);
				ctx.strokeStyle = 'black';
				ctx.lineWidth = 3;
				ctx.strokeText('Game Over!', canvas.width / 2, canvas.height / 2);
				drawPlayAgain('gray','white');
			} else {
				ctx.fillStyle = 'black';
				ctx.fillRect(0, 215, canvas.width, 240);
				ctx.drawImage(Resources.get(player.sprite), 101, 229);
				ctx.drawImage(Resources.get('images/Heart.png'), 202, 229);

				function minusHP(x) {
					setTimeout(function() {
						ctx.fillRect(x, 229, 101, 171);
					}, 500, x);
					setTimeout(function(x) {
						ctx.drawImage(Resources.get('images/Heart.png'), x, 229);
					}, 1000, x);
					setTimeout(function(x) {
						ctx.fillRect(x, 229, 101, 171);
					}, 1500, x);
				}
				if(player.HP === 2) {
					ctx.drawImage(Resources.get('images/Heart.png'), 303, 229);
					ctx.drawImage(Resources.get('images/Heart.png'), 404, 229);
					minusHP(404);
				} else {
					ctx.drawImage(Resources.get('images/Heart.png'), 303, 229);
					minusHP(303);
				}
				setTimeout(function() {
					player.x = 202;
					player.y = 395;
					lastTime = Date.now();
					main();
				}, 3000);
			}
		}
	}

	/* 紧接着我们来加载我们知道的需要来绘制我们游戏关卡的图片。然后把 init 方法设置为回调函数。
	 * 那么党这些图片都已经加载完毕的时候游戏就会开始。
	 */
	Resources.load([
		'images/stone-block.png',
		'images/water-block.png',
		'images/grass-block.png',
		'images/enemy-bug.png',
		'images/char-boy.png',
		'images/char-cat-girl.png',
		'images/char-horn-girl.png',
		'images/char-pink-girl.png',
		'images/char-princess-girl.png',
		'images/Gem Blue.png',
		'images/Gem Green.png',
		'images/Gem Orange.png',
		'images/Heart.png',
		'images/Key.png',
		'images/Rock.png',
		'images/Selector.png',
		'images/Star.png'
	]);
	Resources.onReady(init);

	/* 把 canvas 上下文对象绑定在 global 全局变量上（在浏览器运行的时候就是 window
	 * 对象。从而开发者就可以在他们的app.js文件里面更容易的使用它。
	 */
	global.ctx = ctx;
})(this);