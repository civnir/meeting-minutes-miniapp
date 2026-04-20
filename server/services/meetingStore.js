const fs = require('fs');
const path = require('path');

class MeetingStore {
  constructor({ filePath, enablePersistence }) {
    this.filePath = filePath;
    this.enablePersistence = enablePersistence;
    this.map = new Map();
    this._load();
  }

  _load() {
    if (!this.enablePersistence) return;
    if (!fs.existsSync(this.filePath)) return;

    try {
      const raw = fs.readFileSync(this.filePath, 'utf8');
      const rows = JSON.parse(raw);
      rows.forEach((item) => this.map.set(item.meetingId, item));
    } catch (err) {
      console.warn('[meetingStore] load failed:', err.message);
    }
  }

  _save() {
    if (!this.enablePersistence) return;

    try {
      fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
      const rows = [...this.map.values()];
      fs.writeFileSync(this.filePath, JSON.stringify(rows, null, 2));
    } catch (err) {
      console.warn('[meetingStore] save failed:', err.message);
    }
  }

  create(meeting) {
    this.map.set(meeting.meetingId, meeting);
    this._save();
    return meeting;
  }

  update(meetingId, updater) {
    const prev = this.map.get(meetingId);
    if (!prev) return null;

    const next = typeof updater === 'function' ? updater(prev) : { ...prev, ...updater };
    this.map.set(meetingId, next);
    this._save();
    return next;
  }

  get(meetingId) {
    return this.map.get(meetingId) || null;
  }

  list({ limit = 20 } = {}) {
    return [...this.map.values()]
      .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
      .slice(0, limit);
  }
}

module.exports = {
  MeetingStore
};
