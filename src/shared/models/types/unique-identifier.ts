/**
 * Интерфейс для обеспечения уникальности ID
 */
export interface UniqueIdentifier {
  id: number;
}

/**
 * Утилита для создания уникального набора объектов по ID
 */
export class UniqueIdCollection<T extends UniqueIdentifier> {
  private items: Map<number, T> = new Map();

  /**
   * Добавить элемент в коллекцию
   * Если элемент с таким ID уже существует, он будет заменен
   */
  add(item: T): void {
    this.items.set(item.id, item);
  }

  /**
   * Добавить несколько элементов
   */
  addMany(items: T[]): void {
    items.forEach((item) => this.add(item));
  }

  /**
   * Получить элемент по ID
   */
  get(id: number): T | undefined {
    return this.items.get(id);
  }

  /**
   * Проверить существование элемента по ID
   */
  has(id: number): boolean {
    return this.items.has(id);
  }

  /**
   * Удалить элемент по ID
   */
  remove(id: number): boolean {
    return this.items.delete(id);
  }

  /**
   * Получить все элементы как массив
   */
  toArray(): T[] {
    return Array.from(this.items.values());
  }

  /**
   * Получить количество уникальных элементов
   */
  get size(): number {
    return this.items.size;
  }

  /**
   * Очистить коллекцию
   */
  clear(): void {
    this.items.clear();
  }

  /**
   * Получить все ID
   */
  getIds(): number[] {
    return Array.from(this.items.keys());
  }
}

/**
 * Функция для удаления дубликатов из массива по ID
 */
export function deduplicateById<T extends UniqueIdentifier>(items: T[]): T[] {
  const collection = new UniqueIdCollection<T>();
  collection.addMany(items);
  return collection.toArray();
}

/**
 * Функция для проверки уникальности ID в массиве
 */
export function validateUniqueIds<T extends UniqueIdentifier>(
  items: T[]
): {
  isValid: boolean;
  duplicates: number[];
} {
  const seenIds = new Set<number>();
  const duplicates: number[] = [];

  for (const item of items) {
    if (seenIds.has(item.id)) {
      duplicates.push(item.id);
    } else {
      seenIds.add(item.id);
    }
  }

  return {
    isValid: duplicates.length === 0,
    duplicates: [...new Set(duplicates)], // Убираем дубликаты из списка дубликатов
  };
}
