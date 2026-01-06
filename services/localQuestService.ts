
import { HomeStats, MagazineSnippet, FurnitureType } from "../types";

export interface GameQuest {
  id: string;
  title: string;
  description: string;
  reward: number;
  targetType: 'style' | 'budget' | 'furniture_count';
  targetValue: number;
  furnitureType?: FurnitureType;
}

const pickRandom = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

export const generateOfflineQuest = (stats: HomeStats): GameQuest => {
  const questType = Math.floor(Math.random() * 3);
  const id = `quest_${Date.now()}`;
  const multiplier = Math.max(1, Math.floor(stats.phase / 2));

  if (questType === 0) {
    const targets = [
      { type: FurnitureType.Seating, name: "Sofa hiện đại", val: 2 },
      { type: FurnitureType.LargeTable, name: "bàn ăn", val: 1 },
      { type: FurnitureType.Electronics, name: "thiết bị giải trí", val: 1 },
      { type: FurnitureType.Bookshelf, name: "kệ sách", val: 2 },
      { type: FurnitureType.Window, name: "cửa sổ", val: 3 },
      { type: FurnitureType.Wall, name: "tường", val: 4 },
      { type: FurnitureType.Decor, name: "cây xanh nghệ thuật", val: 3 },
    ];
    const selected = pickRandom(targets);
    return {
      id,
      title: "Chuyên gia Thiết kế",
      description: `Hãy thêm ít nhất ${selected.val} ${selected.name} vào bố cục của bạn.`,
      reward: 250 * multiplier,
      targetType: 'furniture_count',
      targetValue: selected.val,
      furnitureType: selected.type
    };
  }

  // Bỏ quest budget, thay bằng quest style
  const targetStyle = stats.stylePoints + (80 * multiplier);
  return {
    id,
    title: "Kiến trúc sư Phong cách",
    description: `Nâng cao thẩm mỹ căn phòng cho đến khi Điểm Phong cách đạt ${targetStyle}.`,
    reward: 350 * multiplier,
    targetType: 'style',
    targetValue: targetStyle
  };
};

const SNIPPETS = [
  { text: "Smart TV sets are becoming the focal point of modern living rooms.", type: 'trend' },
  { text: "Natural light from large windows can boost your style score significantly.", type: 'tip' },
  { text: "A bookshelf isn't just for books; it's a statement piece.", type: 'trend' },
  { text: "Try grouping your seating around a large dining table for a social vibe.", type: 'tip' },
  { text: "Empty walls feel cold. Use windows or decor to break the monotony.", type: 'critique' },
  { text: "The industrial look of exposed walls is making a huge comeback.", type: 'trend' }
];

export const generateLocalMagazineSnippet = async (): Promise<MagazineSnippet> => {
  const randomSnippet = pickRandom(SNIPPETS);
  return {
    id: Math.random().toString(36).substr(2, 9),
    text: randomSnippet.text,
    type: randomSnippet.type as any
  };
};
