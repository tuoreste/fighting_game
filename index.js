const canvas = document.querySelector('canvas');
const c = canvas.getContext('2d')

canvas.width = 1024
canvas.height = 576

c.fillRect(0, 0, canvas.width, canvas.height)

const gravity = 0.7

const background = new Sprite({
	position: {
		x: 0,
		y: 0
	},
	imageSrc: './images/background.png'
})
const shop = new Sprite({
	position: {
		x: 600,
		y: 128
	},
	imageSrc: './images/shop_anim.png',
	scale: 2.75,
	framesMax: 6
})
const player = new Fighter({
	position: {
		x: 0,
		y: 0
	},
	velocity: {
		x: 0,
		y: 0
	},
	offset: {
		x: 0,
		y: 0
	},
	imageSrc: './images/samuraiMack/Idle.png',
	framesMax: 8,
	scale: 2.5,
	offset: {
		x: 215,
		y: 157
	},
	sprites: {
		idle: {
			imageSrc: './images/samuraiMack/Idle.png',
			framesMax: 8
		},
		run: {
			imageSrc: './images/samuraiMack/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './images/samuraiMack/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './images/samuraiMack/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './images/samuraiMack/Attack1.png',
			framesMax: 6
		},
		takeHit: {
			imageSrc: './images/samuraiMack/Take Hit - white silhouette.png',
			framesMax: 4
		},
		death: {
			imageSrc: './images/samuraiMack/Death.png',
			framesMax: 6
		},
		attackBox: {
			offset: {
				x: 100,
				y: 50
			},
			width: 160,
			height: 50
		}
	}
})

const enemy = new Fighter({
	position: {
		x: 400,
		y: 100
	},
	velocity: {
		x: 0,
		y: 0
	},
	color: 'blue',
	offset: {
		x: -50,
		y: 0
	},
	imageSrc: './images/kenji/Idle.png',
	framesMax: 4,
	scale: 2.5,
	offset: {
		x: 215,
		y: 170
	},
	sprites: {
		idle: {
			imageSrc: './images/kenji/Idle.png',
			framesMax: 4
		},
		run: {
			imageSrc: './images/kenji/Run.png',
			framesMax: 8
		},
		jump: {
			imageSrc: './images/kenji/Jump.png',
			framesMax: 2
		},
		fall: {
			imageSrc: './images/kenji/Fall.png',
			framesMax: 2
		},
		attack1: {
			imageSrc: './images/kenji/Attack1.png',
			framesMax: 4
		},
		takeHit: {
			imageSrc: './images/kenji/hit.jpg',
			framesMax: 3
		},
		death: {
			imageSrc: './images/kenji/Death.png',
			framesMax: 7
		},
		attackBox: {
			offset: {
				x: -170,
				y: 50
			},
			width: 170,
			height: 50
		}
	}
})

console.log(player)

const keys = {
	a: {
		pressed: false
	},
	d: {
		pressed: false
	},
	w: {
		pressed: false
	},
	ArrowRight: {
		pressed: false
	},
	ArrowLeft: {
		pressed: false
	}
}

decreaseTimer()

function animate() {
	window.requestAnimationFrame(animate)
	c.fillStyle = 'black'
	c.fillRect(0, 0, canvas.width, canvas.height)
	background.update()
	shop.update()
	player.update()
	enemy.update()

	player.velocity.x = 0
	enemy.velocity.x = 0

	//player movement
	if (keys.a.pressed && player.lastKey === 'a') {
		player.velocity.x = -5
		player.switchSprite('run')
	} else if (keys.d.pressed && player.lastKey === 'd') {
		player.velocity.x = 5
		player.switchSprite('run')
	} else {
		player.switchSprite('idle')
	}

	//player jumping
	if (player.velocity.y < 0) {
		player.switchSprite('jump')
	} else if (player.velocity.y > 0) {
		player.switchSprite('fall')
	}

	//enemy movement
	if (keys.ArrowLeft.pressed && enemy.lastKey === 'ArrowLeft') {
		enemy.velocity.x = -5
		enemy.switchSprite('run')
	} else if (keys.ArrowRight.pressed && enemy.lastKey === 'ArrowRight') {
		enemy.velocity.x = 5
		enemy.switchSprite('run')
	} else {
		enemy.switchSprite('idle')
	}

	//enemy jumping
	if (enemy.velocity.y < 0) {
		enemy.switchSprite('jump')
	} else if (enemy.velocity.y > 0) {
		enemy.switchSprite('fall')
	}

	//detect for collision & enemy gets hit
	if (
		rectangularCollision({
			rectangle1: player,
			rectangle2: enemy
		}) &&
		player.isAttacking &&
		player.framesCurrent === 4
	) {
		player.isAttacking = false
		document.querySelector('#enemyHealth').style.width = enemy.health + '%'
	}

	//if player misses
	if (player.isAttacking && player.framesCurrent === 4) {
		player.isAttacking = false
	}

	if (
		rectangularCollision({
			rectangle1: enemy,
			rectangle2: player
		}) &&
		enemy.isAttacking &&
		enemy.framesCurrent === 2
	) {
		player.takeHit()
		enemy.isAttacking = false
		document.querySelector('#playerHealth').style.width = player.health + '%'
	}
	//if enemy misses
	if (enemy.isAttacking && enemy.framesCurrent === 2) {
		enemy.isAttacking = false
	}
	// end game based on health
	if (enemy.health <= 0 || player.health <= 0) {
		determineWinner({ player, enemy, timerId })
	}
}

animate()

window.addEventListener('keydown', (event) => {
	switch (event.key) {
		case 'd':
			keys.d.pressed = true
			player.lastKey = 'd'
			break
		case 'a':
			keys.a.pressed = true
			player.lastKey = 'a'
			break
		case 'w':
			player.velocity.y = -20
			break
		case ' ':
			player.attack()
			break
		case 'ArrowRight':
			keys.ArrowRight.pressed = true
			enemy.lastKey = 'ArrowRight'
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = true
			enemy.lastKey = 'ArrowLeft'
			break
		case 'ArrowUp':
			enemy.velocity.y = -20
			break
		case 'ArrowDown':
			enemy.attack()
			break
	}
})

window.addEventListener('keyup', (event) => {
	switch (event.key) {
		case 'd':
			keys.d.pressed = false
			break
		case 'a':
			keys.a.pressed = false
			break
		case 'w':
			keys.w.pressed = false
			break
		case ' ':
			player.attack()
			break
	}
	//enemy's keys
	switch (event.key) {
		case 'ArrowRight':
			keys.ArrowRight.pressed = false
			break
		case 'ArrowLeft':
			keys.ArrowLeft.pressed = false
			break
	}
	console.log(event.key)
})
