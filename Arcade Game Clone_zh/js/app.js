const TILE_WIDTH = 101;
const CANVAS_WIDTH = TILE_WIDTH * 5;
const TILE_ORIGN_HEIGHT = 171;
const TILE_HEIGHT_OFFSET = -88;
const TILE_HEIGHT = TILE_ORIGN_HEIGHT + TILE_HEIGHT_OFFSET;
const IMGS_URL = {
	stone: 'images/stone-block.png',
	water: 'images/water-block.png',
	grass: 'images/grass-block.png',
	bug: 'images/enemy-bug.png',
	boy: 'images/char-boy.png',
	catGirl: 'images/char-cat-girl.png',
	hornGirl: 'images/char-horn-girl.png',
	pinkGirl: 'images/char-pink-girl.png',
	princessGirl: 'images/char-princess-girl.png',
	blueGam: 'images/Gem Blue.png',
	greenGam: 'images/Gem Green.png',
	orangeGam: 'images/Gem Orange.png',
	heart: 'images/Heart.png',
	key: 'images/Key.png',
	rock: 'images/Rock.png',
	selector: 'images/Selector.png',
	star: 'images/Star.png'
};

class Character {
	constructor(sprite, x, y, offsetY) {
		this.sprite = sprite;
		this.x = x;
		this.OFFSET_Y = offsetY
		this.y = y + this.OFFSET_Y;
	}
	render() {
		ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
	}
}
class Enemy extends Character {
	constructor(sprite, x, y, offsetY, offsetX, speed) {
		super(sprite, x, y, offsetY);
		this.OFFSET_X = offsetX;
		this.speed = speed;
	}
	update(dt) {
		if(this.x < CANVAS_WIDTH) {
			this.x += this.speed * dt;
		} else {
			this.x += this.OFFSET_X;
		}
	}
}
class Play extends Character {
	constructor(sprite, x, y, offsetY, HP) {
		super(sprite, x, y, offsetY);
		this.HP = HP;
	}
	update() {
		if(this.y === this.OFFSET_Y) {
			return true;
		}
	}
	handleInput(keyCode) {
		switch(keyCode) {
			case 'left':
				if(this.x !== 0) {
					this.x -= TILE_WIDTH;
				}
				break;
			case 'up':
				if(this.y !== this.OFFSET_Y) {
					this.y -= TILE_HEIGHT;
				}
				break;
			case 'right':
				if(this.x !== CANVAS_WIDTH - TILE_WIDTH) {
					this.x += TILE_WIDTH;
				}
				break;
			case 'down':
				if(this.y !== CANVAS_WIDTH + this.OFFSET_Y) {
					this.y += TILE_HEIGHT;
				}
				break;
		}
	}
}

function createEnemies(row, col) {
	'use strict';
	let arr = [];
	for(let i = 0; i < row; i++) {
		for(let j = 0; j < col; j++) {
			// depending upon the row to set the least space between two bugs in the row group
			let space = TILE_WIDTH * (2 + i);
			// initialize the position of x-axis by two thirds of weight to least space and rest to A TILE_WIDTH wider space
			let x = ~~(Math.random() * 3) ? TILE_WIDTH * 3 - j * space : TILE_WIDTH * 2 - j * space;
			// set offset of x-axis to be set to the bug when it runs out off the right range
			let offsetX = -((i + 2) * 4 + 1) * TILE_WIDTH;
			// initialize the position of y-axis
			let y = (1 + i) * TILE_HEIGHT;
			// initialize the speed
			let speed = TILE_WIDTH / 2 + TILE_WIDTH / (i + 1);
			// create an enemy
			arr[i * col + j] = new Enemy(IMGS_URL.bug, x, y, -20, offsetX, speed);
		}
	}
	return arr;
}
var allEnemies = createEnemies(3, 5);
var player = new Play(IMGS_URL.catGirl, (CANVAS_WIDTH - TILE_WIDTH) / 2, TILE_HEIGHT * 5, -20, 3);

// 这段代码监听游戏玩家的键盘点击事件并且代表将按键的关键数字送到 Play.handleInput()
// 方法里面。你不需要再更改这段代码了。
document.addEventListener('keyup', function(e) {
	var allowedKeys = {
		37: 'left',
		38: 'up',
		39: 'right',
		40: 'down'
	};

	player.handleInput(allowedKeys[e.keyCode]);
});