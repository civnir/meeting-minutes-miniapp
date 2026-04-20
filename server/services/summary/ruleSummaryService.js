function detectTopic(text) {
  if (/上线|排期|时间|延期/.test(text)) return '上线与排期';
  if (/风险|问题|阻塞|bug/.test(text)) return '风险与问题';
  if (/需求|功能|方案/.test(text)) return '需求与方案';
  return '其他讨论';
}

function guessOwner(text, attendees) {
  const found = attendees.find((name) => text.includes(name));
  return found || '待确认';
}

function buildRuleSummary({ title, attendees, segments }) {
  const byTopic = new Map();

  segments.forEach((segment) => {
    const topic = detectTopic(segment.text);
    const current = byTopic.get(topic) || {
      topic,
      decision: '待确认',
      risks: [],
      todos: []
    };

    if (/决定|结论|确认|定为/.test(segment.text)) current.decision = segment.text;
    if (/风险|问题|阻塞|bug/.test(segment.text)) current.risks.push(segment.text);

    if (/需要|安排|跟进|评估|完成/.test(segment.text)) {
      current.todos.push({
        owner: guessOwner(segment.text, attendees),
        task: segment.text,
        dueDate: '待确认'
      });
    }

    byTopic.set(topic, current);
  });

  const topics = [...byTopic.values()].map((item) => ({
    ...item,
    risks: item.risks.length ? item.risks : ['暂无明确风险'],
    todos: item.todos.length ? item.todos : [{ owner: '待确认', task: '整理并确认该议题待办', dueDate: '待确认' }]
  }));

  return {
    title,
    date: new Date().toISOString().slice(0, 10),
    attendees,
    topics
  };
}

module.exports = {
  buildRuleSummary
};
