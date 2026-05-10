import { useEffect, useRef, useState } from 'react'
import Phaser from 'phaser'
import GameScene from './game/GameScene'
import { startPitchDetection } from './audio/pitchDetector'

export default function App() {
  const gameRef = useRef(null)

  const [gameState, setGameState] =
    useState('home')

  const [score, setScore] = useState(0)

  const [misses, setMisses] = useState(0)

  const [detectedNote, setDetectedNote] =
    useState('-')

  const [frequency, setFrequency] =
    useState(0)

  const gameInstance = useRef(null)

  const [accuracy, setAccuracy] =
  useState('-')

useEffect(() => {
  if (gameState !== 'playing')
    return

  const game = new Phaser.Game({
    type: Phaser.AUTO,

    parent: gameRef.current,

    backgroundColor: '#050816',

    scale: {
      mode: Phaser.Scale.RESIZE,

      autoCenter:
        Phaser.Scale.CENTER_BOTH,

      width: window.innerWidth,

      height:
        window.innerHeight - 1
    },

    render: {
      antialias: true,

      pixelArt: false,

      roundPixels: false
    },

    scene: new GameScene()
  })

  gameInstance.current = game

  // SCORE UPDATE
  window.updateScore = () => {
    setScore(prev => prev + 1)
  }

  // GET SCORE
  window.getScore = () => score

  // MISS SYSTEM
  window.addMiss = () => {
    setMisses(prev => {
      const newMiss = prev + 1

      if (newMiss >= 10) {
        // Destroy game
        if (
          gameInstance.current
        ) {
          gameInstance.current.destroy(
            true
          )
        }

        // Game over screen
        setTimeout(() => {
          setGameState(
            'gameover'
          )
        }, 100)
      }

      return newMiss
    })
  }

  // PITCH DETECTION
  startPitchDetection(
    (note, pitch, cents) => {
      setDetectedNote(note)

      setFrequency(
        Math.round(
          pitch || 0
        )
      )

      const scene =
        game.scene.keys.GameScene

      // Scene not ready
      if (!scene) return

      // Find matching target
      const matchedTarget =
        scene.targets.find(
          t =>
            t.note === note &&
            !t.hit
        )

      // No match
      if (!matchedTarget) {
        setAccuracy('-')
        return
      }

      // Accuracy
      setAccuracy('PERFECT')

clearTimeout(
  window.accuracyTimeout
)

window.accuracyTimeout =
  setTimeout(() => {
    setAccuracy('-')
  }, 800)

      // Hit target
      scene.hitTarget(
        matchedTarget
      )
    }
  )

  return () => {
    game.destroy(true)
  }
}, [gameState])

function startGame() {
  setScore(0)

  setMisses(0)

  setGameState('playing')
}

  function backHome() {
    setGameState('home')
  }
  

  // HOME SCREEN
if (gameState === 'home') {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',

        background:
          'linear-gradient(to bottom, #020617, #050816)',

        color: 'white',

        display: 'flex',

        flexDirection: 'column',

        justifyContent: 'center',

        alignItems: 'center',

        fontFamily: 'Arial',

        overflow: 'hidden',

        position: 'relative'
      }}
    >
      {/* Blue Glow */}
      <div
        style={{
          position: 'absolute',

          width: '500px',

          height: '500px',

          background:
            'rgba(59,130,246,0.18)',

          filter: 'blur(120px)',

          borderRadius: '50%',

          top: '-100px',

          right: '-100px'
        }}
      />

      {/* Stars */}
      <div
        style={{
          position: 'absolute',

          inset: 0,

          backgroundImage:
            'radial-gradient(white 1px, transparent 1px)',

          backgroundSize: '50px 50px',

          opacity: 0.12
        }}
      />

      {/* Logo */}
      <div
        style={{
          display: 'flex',

          alignItems: 'center',

          gap: '20px',

          marginBottom: '25px',

          zIndex: 2
        }}
      >
        <div
          style={{
            fontSize:
              'clamp(50px, 8vw, 90px)'
          }}
        >
          🎸
        </div>

        <div>
          <div
            style={{
              fontSize:
                'clamp(40px, 7vw, 90px)',

              fontWeight: '900',

              lineHeight: 1
            }}
          >
            Guitar Note
          </div>

          <div
            style={{
              fontSize:
                'clamp(40px, 7vw, 90px)',

              fontWeight: '900',

              lineHeight: 1,

              color: '#60a5fa',

              textShadow:
                '0 0 20px rgba(96,165,250,0.5)'
            }}
          >
            Shooter
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <div
        style={{
          fontSize:
            'clamp(16px, 2vw, 24px)',

          opacity: 0.75,

          marginBottom: '50px',

          zIndex: 2
        }}
      >
        Play the correct guitar notes
        before they fall
      </div>

      {/* Difficulty Cards */}
      <div
        style={{
          display: 'flex',

          gap: '22px',

          flexWrap: 'wrap',

          justifyContent: 'center',

          zIndex: 2
        }}
      >
        <button
  onClick={startGame}
  style={{
    padding: '24px 60px',

    borderRadius: '24px',

    border: 'none',

    background:
      'linear-gradient(to right, #3b82f6, #2563eb)',

    color: 'white',

    fontSize: '36px',

    fontWeight: 'bold',

    cursor: 'pointer',

    boxShadow:
      '0 0 30px rgba(59,130,246,0.45)'
  }}
>
  START GAME
</button>

      </div>
    </div>
  )
}

if (gameState === 'gameover') {
  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',

        background:
          'linear-gradient(to bottom, #020617, #050816)',

        color: 'white',

        display: 'flex',

        flexDirection: 'column',

        justifyContent: 'center',

        alignItems: 'center',

        fontFamily: 'Arial',

        position: 'relative',

        overflow: 'hidden'
      }}
    >
      {/* Red Glow */}
      <div
        style={{
          position: 'absolute',

          width: '500px',

          height: '500px',

          background:
            'rgba(239,68,68,0.18)',

          filter: 'blur(120px)',

          borderRadius: '50%'
        }}
      />

      {/* GAME OVER */}
      <div
        style={{
          fontSize:
            'clamp(50px, 8vw, 100px)',

          fontWeight: '900',

          color: '#ff6666',

          textShadow:
            '0 0 30px rgba(255,80,80,0.5)',

          zIndex: 2
        }}
      >
        GAME OVER
      </div>

      {/* Score Card */}
      <div
        style={{
          marginTop: '40px',

          background:
            'rgba(255,255,255,0.08)',

          border:
            '1px solid rgba(255,255,255,0.1)',

          backdropFilter: 'blur(12px)',

          borderRadius: '24px',

          padding: '40px',

          width: '320px',

          textAlign: 'center',

          zIndex: 2
        }}
      >
        <div
          style={{
            fontSize: '22px',
            opacity: 0.7
          }}
        >
          FINAL SCORE
        </div>

        <div
          style={{
            fontSize: '72px',

            fontWeight: 'bold',

            marginTop: '10px',

            color: '#60a5fa'
          }}
        >
          {score}
        </div>


        <button
          onClick={backHome}
          style={{
            marginTop: '35px',

            width: '100%',

            padding: '18px',

            borderRadius: '16px',

            border: 'none',

            background: '#3b82f6',

            color: 'white',

            fontSize: '22px',

            fontWeight: 'bold',

            cursor: 'pointer'
          }}
        >
          PLAY AGAIN
        </button>
      </div>
    </div>
  )
}

  // GAME SCREEN
  // GAME SCREEN
return (
  <div
    style={{
      width: '100vw',
      height: '100vh',
      overflow: 'hidden',
      position: 'relative',
      background: '#050816'
    }}
  >
    {/* Phaser Canvas */}
    <div
      ref={gameRef}
      style={{
        width: '100%',
        height: '100%'
      }}
    />

    {/* HUD */}
    <div
      style={{
        position: 'absolute',
        top: 14,
        left: 14,
        right: 14,

        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',

        zIndex: 20,

        fontFamily: 'Arial',

        pointerEvents: 'none'
      }}
    >
      {/* Logo */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          color: 'white'
        }}
      >
        <div
          style={{
            fontSize: '32px'
          }}
        >
          🎸
        </div>

        <div>
          <div
            style={{
              fontSize: '22px',
              fontWeight: 'bold',
              lineHeight: 1
            }}
          >
            Guitar Note Shooter
          </div>

          <div
            style={{
              fontSize: '12px',
              opacity: 0.7,
              marginTop: '2px'
            }}
          >
            Play correct guitar notes
          </div>
        </div>
      </div>

      {/* Scoreboard */}
      <div
        style={{
          background:
            'rgba(0,0,0,0.45)',

          border:
            '1px solid rgba(255,255,255,0.1)',

          backdropFilter: 'blur(8px)',

          borderRadius: '14px',

          padding: '12px 16px',

          color: 'white',

          minWidth: '190px',

          boxShadow:
            '0 0 15px rgba(0,0,0,0.25)'
        }}
      >
        {/* Score */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',

            marginBottom: '8px',

            fontSize: '16px'
          }}
        >
          <span>Score</span>

          <span
            style={{
              color: '#60a5fa',
              fontWeight: 'bold'
            }}
          >
            {score}
          </span>
        </div>

        {/* Miss */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',

            marginBottom: '8px',

            fontSize: '16px'
          }}
        >
          <span>Miss</span>

          <span
            style={{
              color: '#ff6666',
              fontWeight: 'bold'
            }}
          >
            {misses}/10
          </span>
        </div>
<div
  style={{
    display: 'flex',
    justifyContent:
      'space-between',

    marginTop: '8px',

    fontSize: '16px'
  }}
>
  <span>Accuracy</span>

  <span
    style={{
      fontWeight: 'bold',

      color:
        accuracy === 'PERFECT'
          ? '#4ade80'
          : accuracy === 'GOOD'
          ? '#60a5fa'
          : accuracy === 'OK'
          ? '#facc15'
          : '#ff6666'
    }}
  >
    {accuracy}
  </span>
</div>
        {/* Divider */}
        <div
          style={{
            height: '1px',

            background:
              'rgba(255,255,255,0.1)',

            margin: '8px 0'
          }}
        />
{/* Level */}
<div
  style={{
    display: 'flex',
    justifyContent:
      'space-between',

    marginBottom: '8px',

    fontSize: '16px'
  }}
>
  <span>Level</span>

  <span
    style={{
      color: '#60a5fa',
      fontWeight: 'bold'
    }}
  >
    {Math.min(
      1 + Math.floor(score / 5),
      5
    )}
  </span>
</div>
        {/* Detected */}
        <div
          style={{
            display: 'flex',
            justifyContent:
              'space-between',

            fontSize: '16px'
          }}
        >
          <span>Detected</span>

          <span
            style={{
              color: '#facc15',
              fontWeight: 'bold'
            }}
          >
            {detectedNote}
          </span>
        </div>
      </div>
    </div>
    {/* Footer */}
{/* Copyright */}
<div
  style={{
    position: 'absolute',

    bottom:
      window.innerWidth < 768
        ? '8px'
        : '14px',

    right:
      window.innerWidth < 768
        ? '10px'
        : '18px',

    textAlign: 'right',

    color:
      'rgba(255,255,255,0.28)',

    fontSize:
      window.innerWidth < 768
        ? '8px'
        : '12px',

    lineHeight: 1.4,

    zIndex: 2,

    pointerEvents: 'none',

    userSelect: 'none',

    maxWidth:
      window.innerWidth < 768
        ? '120px'
        : '220px'
  }}
>
  <div>
    © 2026 Sarkar
    Tuhassinul Arnob
  </div>

  <div>
    Dept. of ICT
  </div>

  <div>
    Islamic University,
    Kushtia
  </div>
</div>
  </div>
)
}