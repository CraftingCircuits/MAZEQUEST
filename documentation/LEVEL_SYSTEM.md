# LEVEL PROGRESSION SYSTEM DOCUMENTATION

This document defines the technical architecture, state lifecycle, data flow, and pseudocode for the **Level System** in **MazeQuest**.

---

## 1. Purpose of the Level System

The Level System provides a structured progression framework for game sessions. It turns standalone procedural maze instances into a continuous, multi-level gaming experience:
* **Session Progression**: Increments level counters ($1, 2, 3 \dots$) upon maze completion.
* **Fresh Maze Provisioning**: Triggers `MazeGenerator` to construct a new procedurally generated maze matrix for every level.
* **State Isolation**: Ensures level-specific variables (`playerPos`, `movesCount`, `timer`) reset cleanly without polluting future levels.

---

## 2. Level State vs. Maze State

| Variable | Level System Scope | Lifecycle |
| :--- | :--- | :--- |
| `currentLevel` | Global Game Session | Persists and increments ($1 \rightarrow 2 \rightarrow 3 \dots$) |
| `mazeGrid` | Single Level | Replaced on every level by `MazeGenerator.generate()` |
| `playerPos` | Single Level | Resets to Start `(1, 1)` |
| `goalPos` | Single Level | Resets to Goal `(13, 13)` |
| `movesCount` | Single Level | Resets to `0` |
| `elapsedSeconds` | Single Level | Resets to `0` |
| `gameStatus` | Single Level | `'PLAYING'` $\rightarrow$ `'SOLVED'` $\rightarrow$ `'PLAYING'` |

---

## 3. Data Flow Architecture

```text
               User clicks [NEXT LEVEL]
                          │
                          ▼
            Level Manager (app.js / game_state.js)
                          │
                   currentLevel += 1
                          │
                          ▼
           Maze Generator (maze_generator.js)
            - generate(15, 15)
                          │
                          ▼
                Fresh Maze Data Object
         { grid: 15x15, startPos: (1,1), goalPos: (13,13) }
                          │
                          ▼
                     Game State
            - loadMaze(freshMaze)
            - playerPos = (1, 1)
            - movesCount = 0
            - elapsedSeconds = 0
            - startTimer()
                          │
                          ▼
                   HTML5 Renderer
            - Clear & Draw new Grid
            - Render Start, Goal & Player
                          │
                          ▼
             HUD: Level X | Moves 0 | Time 00:00
```

---

## 4. Architectural Pseudocode

```text
CLASS GameState:
    currentLevel = 1
    movesCount = 0
    elapsedSeconds = 0
    gameStatus = 'IDLE'

    FUNCTION advanceToNextLevel(newMaze):
        currentLevel += 1
        stopTimer()
        loadMaze(newMaze)
        startLevel()

    FUNCTION startLevel():
        playerPos = startPos
        movesCount = 0
        elapsedSeconds = 0
        gameStatus = 'PLAYING'
        startTimer()

    FUNCTION movePlayer(dr, dc):
        targetR = playerPos.r + dr
        targetC = playerPos.c + dc
        IF isValidPath(targetR, targetC):
            playerPos = (targetR, targetC)
            movesCount += 1
            IF playerPos == goalPos:
                gameStatus = 'SOLVED'
                stopTimer()
                triggerLevelCompleteUI()
```

---

## 5. State Transition Table

| Trigger | Previous Status | New Status | Level | Moves | Timer | Overlay |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| **Start Game** | `'IDLE'` | `'PLAYING'` | 1 | 0 | Running | Hidden |
| **Move to Path** | `'PLAYING'` | `'PLAYING'` | Unchanged | $+1$ | Running | Hidden |
| **Reach Goal** | `'PLAYING'` | `'SOLVED'` | Unchanged | Frozen | Stopped | Visible |
| **Next Level** | `'SOLVED'` | `'PLAYING'` | $+1$ | Resets to 0 | Running | Hidden |
| **Restart Level** | `'PLAYING'` / `'SOLVED'` | `'PLAYING'` | Unchanged | Resets to 0 | Running | Hidden |
