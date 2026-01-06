
/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
export enum FurnitureType {
  None = 'None',
  Flooring = 'Flooring',
  Seating = 'Seating',
  Chair = 'Chair', // Ghế 4 chân
  Table = 'Table',
  LargeTable = 'LargeTable',
  Bed = 'Bed',
  Storage = 'Storage',
  Bookshelf = 'Bookshelf',
  Electronics = 'Electronics', // TV
  Decor = 'Decor',
  Wall = 'Wall',
  Window = 'Window',
  Door = 'Door',
  Stove = 'Stove', // Bếp
  Oven = 'Oven', // Lò nướng
  Fridge = 'Fridge', // Tủ lạnh
  WashingMachine = 'WashingMachine', // Máy giặt
  Speaker = 'Speaker', // Loa
  Lamp = 'Lamp', // Đèn
  Bathtub = 'Bathtub', // Bồn tắm
}

export interface FurnitureConfig {
  type: FurnitureType;
  cost: number;
  name: string;
  description: string;
  color: string;
  styleGen: number;
  comfortGen: number;
}

export interface TileData {
  x: number;
  y: number;
  furnitureType: FurnitureType;
  rotation?: number; // 0-3, mỗi bước là 90 độ
  variant?: number;
  stackedItem?: FurnitureType; // Đồ vật xếp chồng (Decor hoặc Electronics)
  stackedRotation?: number; // Góc xoay của đồ vật xếp chồng
}

export type Grid = TileData[][];

export interface HomeStats {
  budget: number;
  stylePoints: number;
  phase: number;
}

export interface AIDesignGoal {
  description: string;
  targetType: 'style' | 'budget' | 'furniture_count';
  targetValue: number;
  furnitureType?: FurnitureType;
  reward: number;
  completed: boolean;
}

export interface MagazineSnippet {
  id: string;
  text: string;
  type: 'trend' | 'critique' | 'tip';
}
