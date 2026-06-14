type ConversationWithId = {
  id: string;
};

export function sortConversationsByUnread<T extends ConversationWithId>(items: T[], unreadCounts: Map<string, number>) {
  return items
    .map((item, index) => ({ item, index, unreadCount: unreadCounts.get(item.id) ?? 0 }))
    .sort((a, b) => {
      const unreadDelta = Number(b.unreadCount > 0) - Number(a.unreadCount > 0);

      if (unreadDelta !== 0) {
        return unreadDelta;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item);
}
