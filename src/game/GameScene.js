import Phaser from 'phaser'

const NOTES = [
  'A',
  'A#',

  'B',

  'C',
  'C#',

  'D',
  'D#',

  'E',

  'F',
  'F#',

  'G',
  'G#'
]

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene')
  }

  preload() {
    this.load.image(
      'guitar',
      'assets/guitar.png'
    )

    this.load.image(
      'bullet',
      'assets/bullet.png'
    )

    this.load.image(
      'note',
      'assets/note.png'
    )
  }

  create() {
    this.cameras.main.setBackgroundColor(
      '#050816'
    )

    this.targets = []

    // Dynamic difficulty system
    this.getDifficulty = () => {
      const score =
        window.getScore()

      return {
        maxNotes: Math.min(
          1 + Math.floor(score / 5),
          5
        ),

        speed: Math.max(
          5200 - score * 200,
          500
        )
      }
    }

    // Dynamic spawning
    this.spawnTimer = this.time.addEvent({
      delay: 350,

      loop: true,

      callback: () => {
        const difficulty =
          this.getDifficulty()

        const active =
          this.targets.length

        // Stop if max reached
        if (
          active >=
          difficulty.maxNotes
        )
          return

        // Random spawn chance
        const shouldSpawn =
          Math.random() > 0.45

        if (shouldSpawn) {
          this.targets.push(
            this.createTarget()
          )
        }
      }
    })

    // Finish line
    this.finishLineY =
      this.scale.height - 80

    // Stars background
    for (let i = 0; i < 150; i++) {
      this.add.circle(
        Phaser.Math.Between(
          0,
          this.scale.width
        ),

        Phaser.Math.Between(
          0,
          this.scale.height
        ),

        Phaser.Math.Between(1, 2),

        0xffffff,

        0.5
      )
    }

    // Bottom line
    this.add.rectangle(
      this.scale.width / 2,
      this.finishLineY,
      this.scale.width,
      8,
      0xff0000,
      0.5
    )

    // Guitar position
    this.guitarX =
      this.scale.width / 2

    this.guitarY =
      this.scale.height - 80

    // Guitar
    this.guitar = this.add.image(
      this.guitarX,
      this.guitarY,
      'guitar'
    )

    const guitarScale =
      window.innerWidth < 768
        ? 0.32
        : 0.5

    this.guitar.setScale(
      guitarScale
    )
  }

  createTarget() {
    const note =
      Phaser.Utils.Array.GetRandom(NOTES)

    let x

    let validPosition = false

    while (!validPosition) {
      x = Phaser.Math.Between(
        120,
        this.scale.width - 120
      )

      validPosition = true

      for (const target of this.targets) {
        const distance = Math.abs(
          target.x - x
        )

        // Prevent overlap
        if (distance < 180) {
          validPosition = false
          break
        }
      }
    }

    // Note image
    const sphere = this.add.image(
      x,
      0,
      'note'
    )

    const noteScale =
      this.scale.width < 600
        ? 0.08
        : 0.12

    sphere.setScale(noteScale)

    // Note text
    const text = this.add.text(
      x - 10,
      -12,
      note,
      {
        fontSize: '24px',
        color: '#000000',
        fontStyle: 'bold'
      }
    )

    const container = this.add.container(
      0,
      0,
      [sphere, text]
    )

    const target = {
      note,
      container,
      x,
      hit: false
    }

    // Falling animation
    this.tweens.add({
      targets: container,

      y: this.finishLineY - 30,

      duration:
        this.getDifficulty().speed,

      ease: 'Linear',

      onComplete: () => {
        const targetIndex =
          this.targets.findIndex(
            t =>
              t.container === container
          )

        if (targetIndex !== -1) {
          container.destroy()

          window.addMiss()

          this.targets.splice(
            targetIndex,
            1
          )
        }
      }
    })

    return target
  }

  rotateGuitarToTarget(target) {
    if (!target) return

    const dx =
      target.x - this.guitarX

    const dy =
      target.container.y -
      this.guitarY

    const angle =
      Phaser.Math.RadToDeg(
        Math.atan2(dy, dx)
      ) + 90

    this.tweens.add({
      targets: this.guitar,
      angle: angle,
      duration: 150
    })
  }

  shootBullet(target) {
    if (!target) return

    this.rotateGuitarToTarget(target)

    const bullet = this.add.image(
      this.guitarX,
      this.guitarY - 120,
      'bullet'
    )

    bullet.setScale(0.08)

    this.tweens.add({
      targets: bullet,

      x: target.x,

      y: target.container.y,

      duration: 250,

      onComplete: () => {
        bullet.destroy()
      }
    })
  }

  explosion(x, y) {
    const boom = this.add.circle(
      x,
      y,
      15,
      0xff4444
    )

    this.tweens.add({
      targets: boom,

      radius: 60,

      alpha: 0,

      duration: 300,

      onComplete: () => {
        boom.destroy()
      }
    })
  }

  hitTarget(target) {
    if (!target || target.hit)
      return

    target.hit = true

    this.shootBullet(target)

    this.time.delayedCall(250, () => {
      window.updateScore()

      this.explosion(
        target.x,
        target.container.y
      )

      target.container.destroy()

      const index =
        this.targets.indexOf(target)

      if (index !== -1) {
        this.targets.splice(index, 1)
      }
    })
  }
}