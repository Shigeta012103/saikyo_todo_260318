import type { Todo } from '../types';

export function buildChildrenByParentId(todos: Todo[]): Map<string | null, Todo[]> {
  const childrenByParentId = new Map<string | null, Todo[]>();

  for (const todo of todos) {
    // 子課題の導入前に保存された Todo には parentId が無いためルート扱いにする
    const parentId = todo.parentId ?? null;
    const siblings = childrenByParentId.get(parentId);

    if (siblings) {
      siblings.push(todo);
      continue;
    }

    childrenByParentId.set(parentId, [todo]);
  }

  return childrenByParentId;
}

export function collectDescendantIds(todos: Todo[], ancestorId: string): Set<string> {
  const childrenByParentId = buildChildrenByParentId(todos);
  const descendantIds = new Set<string>();
  const pendingIds = [ancestorId];

  for (let index = 0; index < pendingIds.length; index++) {
    const children = childrenByParentId.get(pendingIds[index]) ?? [];

    for (const child of children) {
      descendantIds.add(child.id);
      pendingIds.push(child.id);
    }
  }

  return descendantIds;
}
