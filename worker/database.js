export function database(env) {
  if (!env.DB) throw new Error('Content database unavailable');
  return env.DB;
}
export function item(env, id) {
  return database(env).prepare('SELECT * FROM media WHERE id = ?').bind(id).first();
}
export function serialize(row) {
  return { id: row.id, type: row.mime.startsWith('video/') ? 'video' : 'image',
    mime: row.mime, size: row.size, title: row.title, caption: row.caption,
    published: Boolean(row.published), position: row.position,
    createdAt: row.created_at, updatedAt: row.updated_at, url: `/media/${row.id}` };
}
