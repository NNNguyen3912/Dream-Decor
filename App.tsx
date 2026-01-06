
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Grid, TileData, FurnitureType, HomeStats, AIDesignGoal, MagazineSnippet } from './types';
import { GRID_SIZE, FURNITURE, TICK_RATE_MS, INITIAL_BUDGET } from './constants';
import IsoMap from './components/IsoMap';
import UIOverlay from './components/UIOverlay';
import StartScreen from './components/StartScreen';
import { generateOfflineQuest, generateLocalMagazineSnippet } from './services/localQuestService';
import { generateDesignGoal, generateMagazineSnippet } from './services/geminiService';
import { GoogleUser, initGoogleAuth } from './services/authService';
import { saveGameProgress, loadGameProgress, hasGameProgress } from './services/storageService';

const createInitialGrid = (): Grid => {
  const grid: Grid = [];
  for (let y = 0; y < GRID_SIZE; y++) {
    const row: TileData[] = [];
    for (let x = 0; x < GRID_SIZE; x++) {
      row.push({ x, y, furnitureType: FurnitureType.None });
    }
    grid.push(row);
  }
  return grid;
};

function App() {
  const [gameStarted, setGameStarted] = useState(false);
  const [grid, setGrid] = useState<Grid>(createInitialGrid);
  const [stats, setStats] = useState<HomeStats>({ budget: INITIAL_BUDGET, stylePoints: 0, phase: 1 });
  const [selectedTool, setSelectedTool] = useState<FurnitureType>(FurnitureType.Seating);
  const [currentGoal, setCurrentGoal] = useState<AIDesignGoal | null>(null);
  const [isGeneratingGoal, setIsGeneratingGoal] = useState(false);
  const [newsFeed, setNewsFeed] = useState<MagazineSnippet[]>([]);
  const [aiError, setAiError] = useState<string | null>(null);
  const [hoveredTile, setHoveredTile] = useState<{ x: number, y: number } | null>(null);
  const [currentUser, setCurrentUser] = useState<GoogleUser | null>(null);
  const [hasSavedProgress, setHasSavedProgress] = useState(false);

  const gridRef = useRef(grid);
  const statsRef = useRef(stats);
  const goalRef = useRef(currentGoal);

  useEffect(() => { gridRef.current = grid; }, [grid]);
  useEffect(() => { statsRef.current = stats; }, [stats]);
  useEffect(() => { goalRef.current = currentGoal; }, [currentGoal]);

  // Khởi tạo Google Auth
  useEffect(() => {
    initGoogleAuth((user) => {
      setCurrentUser(user);
      if (user) {
        setHasSavedProgress(hasGameProgress(user.email));
      } else {
        setHasSavedProgress(false);
      }
    });
  }, []);

  // Auto-save khi có thay đổi (mỗi 5 giây)
  useEffect(() => {
    if (!gameStarted || !currentUser) return;
    const saveTimer = setInterval(() => {
      saveGameProgress(currentUser.email, {
        grid: gridRef.current,
        stats: statsRef.current,
        currentGoal: goalRef.current,
        selectedTool,
      });
    }, 5000);
    return () => clearInterval(saveTimer);
  }, [gameStarted, currentUser, selectedTool]);

  const fetchNewGoal = useCallback(async () => {
    if (isGeneratingGoal || currentGoal) return;
    setIsGeneratingGoal(true);

    try {
      // Luôn dùng local quest (đã bỏ Gemini API)
      const quest = generateOfflineQuest(statsRef.current);
      const nextGoal: AIDesignGoal = {
        description: quest.description,
        targetType: quest.targetType,
        targetValue: quest.targetValue,
        furnitureType: quest.furnitureType,
        reward: quest.reward,
        completed: false
      };

      setCurrentGoal(nextGoal);
      setAiError(null);
    } catch (err) {
      console.error("Goal fetch failed:", err);
      setAiError("Không thể tạo nhiệm vụ.");
    } finally {
      setIsGeneratingGoal(false);
    }
  }, [isGeneratingGoal, currentGoal]);

  const fetchNews = useCallback(async () => {
    if (Math.random() > 0.05) return;
    try {
      // Luôn dùng local news (đã bỏ Gemini API)
      const news = await generateLocalMagazineSnippet();
      if (news) setNewsFeed(prev => [...prev.slice(-10), news]);
    } catch (err) { }
  }, []);

  useEffect(() => {
    if (!gameStarted) return;
    if (!currentGoal && !isGeneratingGoal) {
      const timer = setTimeout(fetchNewGoal, 1000);
      return () => clearTimeout(timer);
    }
  }, [gameStarted, currentGoal, fetchNewGoal, isGeneratingGoal]);

  useEffect(() => {
    if (!gameStarted) return;
    const intervalId = setInterval(() => {
      let totalStyle = 0;
      const counts: Record<string, number> = {};
      gridRef.current.flat().forEach(tile => {
        if (tile.furnitureType !== FurnitureType.None) {
          totalStyle += FURNITURE[tile.furnitureType].styleGen;
          counts[tile.furnitureType] = (counts[tile.furnitureType] || 0) + 1;
        }
      });

      setStats(prev => {
        const nextStats = { ...prev, stylePoints: totalStyle };
        const goal = goalRef.current;
        if (goal && !goal.completed) {
          let met = false;
          if (goal.targetType === 'style' && totalStyle >= goal.targetValue) met = true;
          if (goal.targetType === 'furniture_count' && goal.furnitureType && (counts[goal.furnitureType] || 0) >= goal.targetValue) met = true;
          if (met) setCurrentGoal({ ...goal, completed: true });
        }
        return nextStats;
      });

      fetchNews();
    }, TICK_RATE_MS);
    return () => clearInterval(intervalId);
  }, [gameStarted, fetchNews]);

  const handleTileClick = useCallback((x: number, y: number) => {
    const tool = selectedTool;
    const currentTile = gridRef.current[y][x];

    // Xóa đồ vật
    if (tool === FurnitureType.None) {
      if (currentTile.furnitureType !== FurnitureType.None) {
        const refundAmount = FURNITURE[currentTile.furnitureType].cost;
        setStats(prev => ({ ...prev, budget: prev.budget + refundAmount }));
        const newGrid = gridRef.current.map(row => [...row]);
        newGrid[y][x] = { ...currentTile, furnitureType: FurnitureType.None, rotation: undefined };
        setGrid(newGrid);
      }
      return;
    }

    // Đặt đồ vật bình thường (chỉ khi ô trống)
    if (currentTile.furnitureType === FurnitureType.None && statsRef.current.budget >= FURNITURE[tool].cost) {
      setStats(prev => ({ ...prev, budget: prev.budget - FURNITURE[tool].cost }));
      const newGrid = gridRef.current.map(row => [...row]);
      newGrid[y][x] = { ...currentTile, furnitureType: tool };
      setGrid(newGrid);
    }
  }, [selectedTool]);

  const handleClaimReward = () => {
    if (currentGoal?.completed) {
      setStats(prev => ({ ...prev, budget: prev.budget + currentGoal.reward, phase: prev.phase + 1 }));
      setCurrentGoal(null);
    }
  };

  const handleRotate = useCallback((x: number, y: number) => {
    const tile = gridRef.current[y]?.[x];
    if (tile && tile.furnitureType !== FurnitureType.None) {
      const newGrid = gridRef.current.map(row => [...row]);
      const currentRotation = tile.rotation ?? 0;
      newGrid[y][x] = { ...tile, rotation: (currentRotation + 1) % 4 };
      setGrid(newGrid);
    }
  }, []);

  // Xử lý phím R để xoay đồ vật
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'r' || e.key === 'R') {
        if (hoveredTile) {
          handleRotate(hoveredTile.x, hoveredTile.y);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [hoveredTile, handleRotate]);

  // Xử lý bắt đầu game
  const handleStart = (loadSaved: boolean) => {

    if (loadSaved && currentUser) {
      const savedData = loadGameProgress(currentUser.email);
      if (savedData) {
        setGrid(savedData.grid);
        setStats(savedData.stats);
        setCurrentGoal(savedData.currentGoal);
        setSelectedTool(savedData.selectedTool);
      }
    } else {
      // Bắt đầu mới
      setGrid(createInitialGrid());
      setStats({ budget: INITIAL_BUDGET, stylePoints: 0, phase: 1 });
      setCurrentGoal(null);
      setSelectedTool(FurnitureType.Seating);
    }

    setGameStarted(true);
  };

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-[#0f172a]">
      <IsoMap grid={grid} onTileClick={handleTileClick} hoveredTool={selectedTool} onHoverChange={setHoveredTile} />
      {!gameStarted && (
        <StartScreen
          onStart={handleStart}
          currentUser={currentUser}
          hasSavedProgress={hasSavedProgress}
        />
      )}
      {gameStarted && (
        <UIOverlay
          stats={stats}
          selectedTool={selectedTool}
          onSelectTool={setSelectedTool}
          currentGoal={currentGoal}
          newsFeed={newsFeed}
          onClaimReward={handleClaimReward}
          isGeneratingGoal={isGeneratingGoal}
          aiError={aiError}
          onRetryGoal={() => { fetchNewGoal(); }}
        />
      )}
    </div>
  );
}

export default App;
